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
        $query = Classroom::query()->with(['subject', 'yearGroup', 'tutor.user', 'academicYear', 'course', 'terms']);
        $scoper = $this->ownedScope($request->user());

        return response()->json($scoper($query)->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tutor_id' => ['nullable', 'integer', 'exists:tutors,id'],   // owner may defer tutor assignment
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'year_group_id' => ['required', 'integer', 'exists:year_groups,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
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
        ]);

        $scope = $this->resolveOwnerScope(
            $request->user(),
            $data['business_id'] ?? null,
            $data['tutor_id'] ?? null
        );

        // course_id must belong to this business if provided.
        if (! empty($data['course_id'])) {
            $course = \App\Models\Course::findOrFail($data['course_id']);
            if ($course->business_id !== $scope['business_id']) {
                return response()->json([
                    'message' => 'Course not in your business.',
                    'errors'  => ['course_id' => ['Cross-business link not allowed.']],
                ], 422);
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

        return DB::transaction(function () use ($data, $scope, $termIds, $startsOn, $endsOn) {
            $classroom = Classroom::create([
                'business_id' => $scope['business_id'],
                'tutor_id' => $data['tutor_id'] ?? null,
                'course_id' => $data['course_id'] ?? null,
                'course_offering_id' => $data['course_offering_id'] ?? null,
                'academic_year_id' => $data['academic_year_id'],
                'year_group_id' => $data['year_group_id'],
                'subject_id' => $data['subject_id'],
                'name' => $data['name'],
                'starts_on' => $startsOn,
                'ends_on' => $endsOn,
                'capacity' => $data['capacity'] ?? null,
                'status' => $data['status'] ?? 'draft',
                'description' => $data['description'] ?? null,
                'level' => $data['level'] ?? null,
            ]);

            if (! empty($termIds)) {
                $classroom->terms()->sync($termIds);
            }

            return response()->json(
                $classroom->load(['subject', 'yearGroup', 'tutor.user', 'academicYear', 'course', 'courseOffering', 'terms']),
                201
            );
        });
    }

    public function show(Request $request, Classroom $class): JsonResponse
    {
        $this->authorizeClass($request->user(), $class);

        return response()->json($class->load(['subject', 'yearGroup', 'tutor.user', 'academicYear', 'course', 'terms', 'students.user']));
    }

    public function update(Request $request, Classroom $class): JsonResponse
    {
        $this->authorizeClass($request->user(), $class);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'tutor_id' => ['sometimes', 'integer', 'exists:tutors,id'],
            'year_group_id' => ['sometimes', 'integer', 'exists:year_groups,id'],
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
            'course_id' => ['sometimes', 'nullable', 'integer', 'exists:courses,id'],
            'term_ids' => ['sometimes', 'array'],
            'term_ids.*' => ['integer', 'exists:academic_terms,id'],
            'capacity' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:draft,active,completed,archived'],
            'description' => ['sometimes', 'nullable', 'string'],
            'level' => ['sometimes', 'nullable', 'string', 'max:30'],
        ]);

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

            $class->update($data);

            return response()->json($class->fresh()->load(['subject', 'yearGroup', 'tutor.user', 'academicYear', 'course', 'terms']));
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
