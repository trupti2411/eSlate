<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\AcademicTerm;
use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassroomController extends Controller
{
    use ResolvesScope;

    public function index(Request $request): JsonResponse
    {
        $query = Classroom::query()->with([
            'subject',
            'subjects:id,code,name',
            'yearGroup',
            'tutor.user',
            'academicYear',
            'course',
            'terms',
        ]);
        $scoper = $this->ownedScope($request->user());

        return response()->json($scoper($query)->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tutor_id' => ['nullable', 'integer', 'exists:tutors,id'],   // owner may defer tutor assignment
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'year_group_id' => ['required', 'integer', 'exists:year_groups,id'],
            // Either subject_id (legacy single-subject) OR subject_ids[] (multi-subject WEMT-style).
            // If both arrive, subject_ids wins and the first becomes the primary.
            'subject_id'    => ['required_without:subject_ids', 'nullable', 'integer', 'exists:subjects,id'],
            'subject_ids'   => ['required_without:subject_id', 'nullable', 'array', 'min:1'],
            'subject_ids.*' => ['integer', 'exists:subjects,id'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'course_offering_id' => ['nullable', 'integer', 'exists:course_offerings,id'],   // deprecated; kept for back-compat
            'term_ids' => ['nullable', 'array'],
            'term_ids.*' => ['integer', 'exists:academic_terms,id'],
            'name' => ['required', 'string', 'max:100'],
            'business_id' => ['nullable', 'integer', 'exists:businesses,id'],
            // New fields absorbed from course_offerings
            'capacity' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:draft,active,completed,archived'],
            'description' => ['nullable', 'string'],
            'level' => ['nullable', 'string', 'max:30'],
            // Schedule (Phase 5 — when does the class meet each week?)
            'schedule_day_of_week' => ['nullable', 'integer', 'between:1,7'],   // 1=Mon..7=Sun
            'schedule_start_time' => ['nullable', 'date_format:H:i'],
            'schedule_end_time'   => ['nullable', 'date_format:H:i', 'after:schedule_start_time'],
            'location' => ['nullable', 'string', 'max:120'],
        ]);

        $scope = $this->resolveOwnerScope(
            $request->user(),
            $data['business_id'] ?? null,
            $data['tutor_id'] ?? null
        );

        // Normalise subject inputs into a single canonical list (first = primary).
        $subjectIds = ! empty($data['subject_ids'])
            ? array_values(array_unique($data['subject_ids']))
            : (! empty($data['subject_id']) ? [(int) $data['subject_id']] : []);
        $primarySubjectId = $subjectIds[0] ?? null;

        // course_id must belong to this business if provided, and chosen subjects must be a subset
        // of the course's declared subject set (when the course has any subjects declared).
        if (! empty($data['course_id'])) {
            $course = \App\Models\Course::findOrFail($data['course_id']);
            if ($course->business_id !== $scope['business_id']) {
                return response()->json([
                    'message' => 'Course not in your business.',
                    'errors'  => ['course_id' => ['Cross-business link not allowed.']],
                ], 422);
            }
            $courseSubjectIds = $course->subjects()->pluck('subjects.id')->all();
            if (! empty($courseSubjectIds)) {
                $invalid = array_diff($subjectIds, $courseSubjectIds);
                if (! empty($invalid)) {
                    return response()->json([
                        'message' => 'One or more subjects are not part of the selected course.',
                        'errors'  => ['subject_ids' => ['Subjects must come from the course\'s subject list.']],
                    ], 422);
                }
            }
        }

        // Legacy: course_offering_id must belong to this business if provided.
        if (! empty($data['course_offering_id'])) {
            $offering = \App\Models\CourseOffering::findOrFail($data['course_offering_id']);
            if ($offering->business_id !== $scope['business_id']) {
                return response()->json([
                    'message' => 'Course offering not in your business.',
                    'errors'  => ['course_offering_id' => ['Cross-business link not allowed.']],
                ], 422);
            }
        }

        // Picked terms must belong to the academic_year (no cross-year mixing).
        $termIds = $data['term_ids'] ?? [];
        $terms = collect();
        if (! empty($termIds)) {
            $terms = AcademicTerm::whereIn('id', $termIds)
                ->where('academic_year_id', $data['academic_year_id'])
                ->get();
            if ($terms->count() !== count($termIds)) {
                return response()->json([
                    'message' => 'One or more terms do not belong to the chosen academic year.',
                    'errors'  => ['term_ids' => ['Cross-year term mix not allowed.']],
                ], 422);
            }
        }

        // Derive starts_on / ends_on from picked terms (no free-form dates).
        $startsOn = $terms->isNotEmpty() ? $terms->min('start_date') : null;
        $endsOn   = $terms->isNotEmpty() ? $terms->max('end_date')   : null;

        // Schedule conflict: tutor double-booked within overlapping terms?
        if ($conflict = $this->findScheduleConflict(
            tutorId: $data['tutor_id'] ?? null,
            dayOfWeek: $data['schedule_day_of_week'] ?? null,
            startTime: $data['schedule_start_time'] ?? null,
            endTime: $data['schedule_end_time'] ?? null,
            termIds: $termIds,
            excludeClassId: null,
        )) {
            return response()->json([
                'message' => 'Schedule conflict with another class.',
                'errors'  => ['schedule_start_time' => [
                    "Tutor already runs '{$conflict['name']}' on the same day/time during overlapping terms.",
                ]],
                'conflict' => $conflict,
            ], 422);
        }

        return DB::transaction(function () use ($data, $scope, $termIds, $startsOn, $endsOn, $subjectIds, $primarySubjectId) {
            $classroom = Classroom::create([
                'business_id' => $scope['business_id'],
                'tutor_id' => $data['tutor_id'] ?? null,
                'course_id' => $data['course_id'] ?? null,
                'course_offering_id' => $data['course_offering_id'] ?? null,
                'academic_year_id' => $data['academic_year_id'],
                'year_group_id' => $data['year_group_id'],
                'subject_id' => $primarySubjectId,    // primary mirror; class_subjects is authoritative
                'name' => $data['name'],
                'starts_on' => $startsOn,
                'ends_on' => $endsOn,
                'capacity' => $data['capacity'] ?? null,
                'status' => $data['status'] ?? 'draft',
                'description' => $data['description'] ?? null,
                'level' => $data['level'] ?? null,
                'schedule_day_of_week' => $data['schedule_day_of_week'] ?? null,
                'schedule_start_time' => $data['schedule_start_time'] ?? null,
                'schedule_end_time' => $data['schedule_end_time'] ?? null,
                'location' => $data['location'] ?? null,
            ]);

            // Populate class_subjects with is_primary flagging the first picked subject.
            $pivot = [];
            foreach ($subjectIds as $i => $sid) {
                $pivot[$sid] = ['is_primary' => $i === 0];
            }
            $classroom->subjects()->sync($pivot);

            if (! empty($termIds)) {
                $classroom->terms()->sync($termIds);
            }

            return response()->json(
                $classroom->load(['subject', 'subjects:id,code,name', 'yearGroup', 'tutor.user', 'academicYear', 'course', 'courseOffering', 'terms']),
                201
            );
        });
    }

    /**
     * Returns a conflict descriptor (id + name + day + times) if the tutor is double-booked
     * within any of the picked terms on the same day-of-week with overlapping time. Null
     * if no conflict or insufficient data to check.
     */
    private function findScheduleConflict(
        ?int $tutorId,
        ?int $dayOfWeek,
        ?string $startTime,
        ?string $endTime,
        array $termIds,
        ?int $excludeClassId,
    ): ?array {
        // Need tutor + day + at least a start time + at least one term to check.
        if (! $tutorId || ! $dayOfWeek || ! $startTime || empty($termIds)) {
            return null;
        }
        $endTime = $endTime ?? $startTime;  // treat zero-length as a point in time

        $candidates = Classroom::query()
            ->where('tutor_id', $tutorId)
            ->where('schedule_day_of_week', $dayOfWeek)
            ->whereNotNull('schedule_start_time')
            ->when($excludeClassId, fn ($q) => $q->where('id', '!=', $excludeClassId))
            ->whereHas('terms', fn ($q) => $q->whereIn('academic_term_id', $termIds))
            ->get();

        foreach ($candidates as $c) {
            $cStart = $c->schedule_start_time;
            $cEnd   = $c->schedule_end_time ?? $cStart;
            // Half-open interval overlap: [startTime, endTime) ∩ [cStart, cEnd)
            if ($startTime < $cEnd && $endTime > $cStart) {
                return [
                    'id'         => $c->id,
                    'name'       => $c->name,
                    'day'        => (int) $c->schedule_day_of_week,
                    'start_time' => substr((string) $cStart, 0, 5),
                    'end_time'   => substr((string) $cEnd, 0, 5),
                ];
            }
        }
        return null;
    }

    public function show(Request $request, Classroom $class): JsonResponse
    {
        $this->authorizeClass($request->user(), $class);

        return response()->json($class->load([
            'subject',
            'subjects:id,code,name',
            'yearGroup',
            'tutor.user',
            'academicYear',
            'course.subjects:id,code,name',
            'terms',
            'students.user',
        ]));
    }

    public function update(Request $request, Classroom $class): JsonResponse
    {
        $this->authorizeClass($request->user(), $class);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'tutor_id' => ['sometimes', 'nullable', 'integer', 'exists:tutors,id'],
            'year_group_id' => ['sometimes', 'integer', 'exists:year_groups,id'],
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
            'subject_ids' => ['sometimes', 'array', 'min:1'],
            'subject_ids.*' => ['integer', 'exists:subjects,id'],
            'course_id' => ['sometimes', 'nullable', 'integer', 'exists:courses,id'],
            'term_ids' => ['sometimes', 'array'],
            'term_ids.*' => ['integer', 'exists:academic_terms,id'],
            'capacity' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:draft,active,completed,archived'],
            'description' => ['sometimes', 'nullable', 'string'],
            'level' => ['sometimes', 'nullable', 'string', 'max:30'],
            // Schedule
            'schedule_day_of_week' => ['sometimes', 'nullable', 'integer', 'between:1,7'],
            'schedule_start_time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'schedule_end_time'   => ['sometimes', 'nullable', 'date_format:H:i'],
            'location' => ['sometimes', 'nullable', 'string', 'max:120'],
        ]);

        // If caller sent subject_ids, validate against the (possibly updated) course's allowed subjects.
        if (array_key_exists('subject_ids', $data)) {
            $effectiveCourseId = array_key_exists('course_id', $data) ? $data['course_id'] : $class->course_id;
            if ($effectiveCourseId) {
                $course = \App\Models\Course::findOrFail($effectiveCourseId);
                $allowed = $course->subjects()->pluck('subjects.id')->all();
                if (! empty($allowed)) {
                    $invalid = array_diff($data['subject_ids'], $allowed);
                    if (! empty($invalid)) {
                        return response()->json([
                            'message' => 'One or more subjects are not part of the selected course.',
                            'errors'  => ['subject_ids' => ['Subjects must come from the course\'s subject list.']],
                        ], 422);
                    }
                }
            }
        }

        // Pre-compute the merged class (after this update) for conflict check.
        $mergedTutorId   = array_key_exists('tutor_id', $data) ? $data['tutor_id'] : $class->tutor_id;
        $mergedDay       = array_key_exists('schedule_day_of_week', $data) ? $data['schedule_day_of_week'] : $class->schedule_day_of_week;
        $mergedStart     = array_key_exists('schedule_start_time', $data) ? $data['schedule_start_time'] : $class->schedule_start_time;
        $mergedEnd       = array_key_exists('schedule_end_time', $data) ? $data['schedule_end_time'] : $class->schedule_end_time;
        $mergedTermIds   = array_key_exists('term_ids', $data) ? ($data['term_ids'] ?? []) : $class->terms()->pluck('academic_term_id')->all();

        // Sanity: schedule_end_time must be after start
        if ($mergedStart && $mergedEnd && $mergedEnd <= $mergedStart) {
            return response()->json([
                'message' => 'End time must be after start time.',
                'errors'  => ['schedule_end_time' => ['Must be after start time.']],
            ], 422);
        }

        if ($conflict = $this->findScheduleConflict(
            tutorId: $mergedTutorId,
            dayOfWeek: $mergedDay,
            startTime: $mergedStart,
            endTime: $mergedEnd,
            termIds: $mergedTermIds,
            excludeClassId: $class->id,
        )) {
            return response()->json([
                'message' => 'Schedule conflict with another class.',
                'errors'  => ['schedule_start_time' => [
                    "Tutor already runs '{$conflict['name']}' on the same day/time during overlapping terms.",
                ]],
                'conflict' => $conflict,
            ], 422);
        }

        return DB::transaction(function () use ($data, $class) {
            // If terms changed, re-derive starts_on/ends_on and re-sync the pivot.
            if (array_key_exists('term_ids', $data)) {
                $termIds = $data['term_ids'] ?? [];
                $terms = AcademicTerm::whereIn('id', $termIds)
                    ->where('academic_year_id', $class->academic_year_id)
                    ->get();
                if ($terms->count() !== count($termIds)) {
                    abort(422, 'Cross-year term mix not allowed.');
                }
                $data['starts_on'] = $terms->isNotEmpty() ? $terms->min('start_date') : null;
                $data['ends_on']   = $terms->isNotEmpty() ? $terms->max('end_date')   : null;
                $class->terms()->sync($termIds);
                unset($data['term_ids']);
            }

            // If subject_ids changed, resync the pivot and mirror primary to classes.subject_id.
            if (array_key_exists('subject_ids', $data)) {
                $subjectIds = array_values(array_unique($data['subject_ids']));
                $pivot = [];
                foreach ($subjectIds as $i => $sid) {
                    $pivot[$sid] = ['is_primary' => $i === 0];
                }
                $class->subjects()->sync($pivot);
                $data['subject_id'] = $subjectIds[0] ?? null;
                unset($data['subject_ids']);
            }

            $class->update($data);

            return response()->json($class->fresh()->load([
                'subject', 'subjects:id,code,name', 'yearGroup', 'tutor.user', 'academicYear', 'course', 'terms',
            ]));
        });
    }

    public function destroy(Request $request, Classroom $class): JsonResponse
    {
        $this->authorizeClass($request->user(), $class);
        $class->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function enrol(Request $request, Classroom $class): JsonResponse
    {
        $this->authorizeClass($request->user(), $class);

        $data = $request->validate([
            'student_id' => ['required', 'integer', 'exists:students,id'],
        ]);

        $class->students()->syncWithoutDetaching([
            $data['student_id'] => ['enrolled_at' => now()],
        ]);

        return response()->json($class->load('students.user'));
    }

    public function unenrol(Request $request, Classroom $class, Student $student): JsonResponse
    {
        $this->authorizeClass($request->user(), $class);

        $class->students()->detach($student->id);

        return response()->json(['message' => 'Unenrolled']);
    }

    private function authorizeClass($user, Classroom $class): void
    {
        if ($user->isAdmin()) {
            return;
        }

        $scope = $this->resolveOwnerScope($user);

        $owned = ($scope['business_id'] !== null && $class->business_id === $scope['business_id'])
            || ($scope['tutor_id'] !== null && $class->tutor_id === $scope['tutor_id']);

        if (! $owned) {
            abort(403);
        }
    }
}
