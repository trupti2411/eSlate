<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\CourseOffering;
use App\Models\CourseTemplate;
use App\Models\OfferingEnrolment;
use App\Models\Student;
use App\Models\Tutor;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CourseOfferingController extends Controller
{
    use ResolvesScope;

    public function __construct(
        private readonly AuditLogger $audit,
    ) {}

    /** GET /api/course-offerings — list offerings in caller's business (admins see all). */
    public function index(Request $request): JsonResponse
    {
        $query = CourseOffering::query()
            ->with(['template:id,code,name,short_name,kind,test_alignment,year_group_code', 'tutor.user:id,name,email']);

        $user = $request->user();
        if (! $user->isAdmin()) {
            $scope = $this->resolveOwnerScope($user);
            if ($scope['business_id']) {
                $query->where('business_id', $scope['business_id']);
            } else {
                return response()->json([]);
            }
        }

        foreach (['status', 'tutor_id', 'course_template_id'] as $f) {
            if ($v = $request->query($f)) {
                $query->where($f, $v);
            }
        }

        return response()->json($query->orderByDesc('starts_on')->get());
    }

    /** POST /api/course-offerings — create an offering from a template OR a custom course (null template). */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'course_id'          => ['nullable', 'integer', 'exists:courses,id'],
            'course_template_id' => ['nullable', 'integer', 'exists:course_templates,id'],
            'year_group_id'      => ['nullable', 'integer', 'exists:year_groups,id'],
            'subject_id'         => ['nullable', 'integer', 'exists:subjects,id'],
            'level'              => ['nullable', 'string', 'max:30'],
            'tutor_id'           => ['required', 'integer', 'exists:tutors,id'],
            'name'               => ['required', 'string', 'max:120'],
            'description'        => ['nullable', 'string'],
            'starts_on'          => ['required', 'date'],
            'ends_on'            => ['required', 'date', 'after_or_equal:starts_on'],
            'target_test_date'   => ['nullable', 'date'],
            'academic_year_id'   => ['nullable', 'integer', 'exists:academic_years,id'],
            'capacity'           => ['nullable', 'integer', 'min:1'],
            'notes'              => ['nullable', 'string'],
        ]);

        // Spec §8.2.5: ends_on <= target_test_date when set
        if (! empty($data['target_test_date']) && $data['ends_on'] > $data['target_test_date']) {
            return response()->json([
                'message' => 'End date must be on or before the target test date.',
                'errors'  => ['ends_on' => ['Ends after target test date.']],
            ], 422);
        }

        $user = $request->user();
        $tutor = Tutor::findOrFail($data['tutor_id']);

        // Spec §8.2.1: tutor and offering share business_id; check owner/tutor scope.
        $scope = $this->resolveOwnerScope($user, $tutor->business_id, $tutor->id);
        if ($scope['business_id'] !== $tutor->business_id) {
            abort(403, 'Tutor not in your business.');
        }

        return DB::transaction(function () use ($data, $tutor, $user) {
            $offering = CourseOffering::create([
                'business_id'        => $tutor->business_id,
                'course_id'          => $data['course_id'] ?? null,
                'course_template_id' => $data['course_template_id'] ?? null,
                'tutor_id'           => $tutor->id,
                'year_group_id'      => $data['year_group_id'] ?? null,
                'subject_id'         => $data['subject_id'] ?? null,
                'level'              => $data['level'] ?? null,
                'academic_year_id'   => $data['academic_year_id'] ?? null,
                'created_by_user_id' => $user->id,
                'name'               => $data['name'],
                'description'        => $data['description'] ?? null,
                'target_test_date'   => $data['target_test_date'] ?? null,
                'starts_on'          => $data['starts_on'],
                'ends_on'            => $data['ends_on'],
                'capacity'           => $data['capacity'] ?? null,
                'status'             => CourseOffering::STATUS_DRAFT,
                'notes'              => $data['notes'] ?? null,
            ]);

            $this->audit->log(
                event: 'course_offering_created',
                businessId: $offering->business_id,
                actor: $user,
                entityType: 'course_offering',
                entityId: $offering->id,
                payload: [
                    'template_id' => $offering->course_template_id,    // null for custom courses
                    'tutor_id'    => $offering->tutor_id,
                    'is_custom'   => $offering->course_template_id === null,
                ],
            );

            return response()->json($offering->load(['template.components', 'tutor.user:id,name,email']), 201);
        });
    }

    /** GET /api/course-offerings/{offering} */
    public function show(Request $request, CourseOffering $offering): JsonResponse
    {
        $this->authorizeOffering($request->user(), $offering);

        return response()->json(
            $offering->load([
                'template.components',
                'tutor.user:id,name,email',
                'enrolments.student:id,first_name,last_name,year_group_code',
                'academicYear:id,year,state_code',
            ])
        );
    }

    /** PATCH /api/course-offerings/{offering} — name/dates/capacity/notes/status. Template is immutable. */
    public function update(Request $request, CourseOffering $offering): JsonResponse
    {
        $this->authorizeOffering($request->user(), $offering);

        $data = $request->validate([
            'name'             => ['sometimes', 'string', 'max:120'],
            'starts_on'        => ['sometimes', 'date'],
            'ends_on'          => ['sometimes', 'date'],
            'target_test_date' => ['nullable', 'date'],
            'capacity'         => ['nullable', 'integer', 'min:1'],
            'notes'            => ['nullable', 'string'],
            'status'           => ['sometimes', Rule::in(CourseOffering::STATUSES)],
            'tutor_id'         => ['sometimes', 'integer', 'exists:tutors,id'],
        ]);

        // Apply spec §8.2.5 date rules across the merged set
        $start = $data['starts_on']        ?? $offering->starts_on?->toDateString();
        $end   = $data['ends_on']          ?? $offering->ends_on?->toDateString();
        $test  = array_key_exists('target_test_date', $data) ? $data['target_test_date'] : $offering->target_test_date?->toDateString();
        if ($start && $end && $end < $start) {
            return response()->json(['message' => 'End date must be on or after start date.', 'errors' => ['ends_on' => ['Before start.']]], 422);
        }
        if (! empty($test) && $end && $end > $test) {
            return response()->json(['message' => 'End date must be on or before the target test date.', 'errors' => ['ends_on' => ['After test date.']]], 422);
        }

        $oldStatus = $offering->status;
        $offering->update($data);

        if (isset($data['status']) && $data['status'] !== $oldStatus) {
            $this->audit->log(
                event: 'course_offering_status_changed',
                businessId: $offering->business_id,
                actor: $request->user(),
                entityType: 'course_offering',
                entityId: $offering->id,
                payload: ['from' => $oldStatus, 'to' => $offering->status],
            );
        }

        return response()->json($offering->fresh()->load(['template.components', 'tutor.user:id,name,email']));
    }

    /**
     * DELETE /api/course-offerings/{offering} — archive.
     * Per spec §6.2: soft-archive when no submissions exist; otherwise transition to completed.
     * (For v1 we always set archived; submission-protection comes when assignments land.)
     */
    public function destroy(Request $request, CourseOffering $offering): JsonResponse
    {
        $this->authorizeOffering($request->user(), $offering);

        $offering->update(['status' => CourseOffering::STATUS_ARCHIVED]);

        $this->audit->log(
            event: 'course_offering_archived',
            businessId: $offering->business_id,
            actor: $request->user(),
            entityType: 'course_offering',
            entityId: $offering->id,
            payload: [
                'enrolment_count' => $offering->enrolments()->count(),
                'assignment_count' => $offering->assignments()->count(),
            ],
        );

        return response()->json(['message' => 'Archived']);
    }

    /** POST /api/course-offerings/{offering}/enrolments — bulk enrol students. */
    public function enrol(Request $request, CourseOffering $offering): JsonResponse
    {
        $this->authorizeOffering($request->user(), $offering);

        $data = $request->validate([
            'student_ids'   => ['required', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'exists:students,id'],
        ]);

        // Spec §8.2.1: students must share the offering's business_id.
        $students = Student::whereIn('id', $data['student_ids'])->get();
        foreach ($students as $s) {
            if ($s->business_id !== $offering->business_id) {
                return response()->json([
                    'message' => "Student #{$s->id} is not in this business.",
                ], 422);
            }
        }

        // Spec §8.2.2: capacity enforcement.
        $activeCount = $offering->enrolments()->where('status', OfferingEnrolment::STATUS_ACTIVE)->count();
        if ($offering->capacity !== null && $activeCount + $students->count() > $offering->capacity) {
            return response()->json([
                'message' => "Capacity {$offering->capacity} would be exceeded.",
                'errors'  => ['capacity' => ["{$activeCount} already enrolled."]],
            ], 422);
        }

        return DB::transaction(function () use ($offering, $students, $request) {
            $created = [];
            foreach ($students as $student) {
                // Spec §11.1: at most one active enrolment per (offering, student) — soft-withdraw prior if exists.
                OfferingEnrolment::where('course_offering_id', $offering->id)
                    ->where('student_id', $student->id)
                    ->where('status', OfferingEnrolment::STATUS_ACTIVE)
                    ->update(['status' => OfferingEnrolment::STATUS_WITHDRAWN, 'withdrew_at' => now()]);

                $enrolment = OfferingEnrolment::create([
                    'business_id'        => $offering->business_id,
                    'course_offering_id' => $offering->id,
                    'student_id'         => $student->id,
                    'status'             => OfferingEnrolment::STATUS_ACTIVE,
                    'enrolled_at'        => now(),
                ]);
                $created[] = $enrolment;

                $this->audit->log(
                    event: 'course_enrolment_added',
                    businessId: $offering->business_id,
                    actor: $request->user(),
                    entityType: 'offering_enrolment',
                    entityId: $enrolment->id,
                    payload: ['student_id' => $student->id, 'offering_id' => $offering->id],
                );
            }
            return response()->json($created, 201);
        });
    }

    /** DELETE /api/course-offerings/{offering}/enrolments/{enrolment} — withdraw. */
    public function withdraw(Request $request, CourseOffering $offering, OfferingEnrolment $enrolment): JsonResponse
    {
        $this->authorizeOffering($request->user(), $offering);

        if ($enrolment->course_offering_id !== $offering->id) {
            abort(404);
        }

        $enrolment->update([
            'status' => OfferingEnrolment::STATUS_WITHDRAWN,
            'withdrew_at' => now(),
        ]);

        $this->audit->log(
            event: 'course_enrolment_withdrawn',
            businessId: $offering->business_id,
            actor: $request->user(),
            entityType: 'offering_enrolment',
            entityId: $enrolment->id,
            payload: ['student_id' => $enrolment->student_id, 'offering_id' => $offering->id],
        );

        return response()->json(['message' => 'Withdrawn']);
    }

    private function authorizeOffering($user, CourseOffering $offering): void
    {
        if ($user->isAdmin()) {
            return;
        }
        $scope = $this->resolveOwnerScope($user);

        // Owner of the business OR the tutor running the offering.
        $owned = ($scope['business_id'] !== null && $offering->business_id === $scope['business_id'])
            || ($scope['tutor_id'] !== null && $offering->tutor_id === $scope['tutor_id']);

        if (! $owned) {
            abort(403);
        }
    }
}
