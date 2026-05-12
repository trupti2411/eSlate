<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    use ResolvesScope;

    public function index(Request $request): JsonResponse
    {
        $query = Classroom::query()->with(['subject', 'yearGroup', 'tutor.user', 'academicYear']);
        $scoper = $this->ownedScope($request->user());

        return response()->json($scoper($query)->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tutor_id' => ['required', 'integer', 'exists:tutors,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'year_group_id' => ['required', 'integer', 'exists:year_groups,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'course_offering_id' => ['nullable', 'integer', 'exists:course_offerings,id'],
            'name' => ['required', 'string', 'max:100'],
            'business_id' => ['nullable', 'integer', 'exists:businesses,id'],
        ]);

        $scope = $this->resolveOwnerScope(
            $request->user(),
            $data['business_id'] ?? null,
            $data['tutor_id']
        );

        // Spec §8.2.1 style check: if linked to a course offering, the offering must be in this business.
        if (! empty($data['course_offering_id'])) {
            $offering = \App\Models\CourseOffering::findOrFail($data['course_offering_id']);
            if ($offering->business_id !== $scope['business_id']) {
                return response()->json([
                    'message' => 'Course offering not in your business.',
                    'errors'  => ['course_offering_id' => ['Cross-business link not allowed.']],
                ], 422);
            }
        }

        $classroom = Classroom::create([
            'business_id' => $scope['business_id'],
            'tutor_id' => $data['tutor_id'],
            'course_offering_id' => $data['course_offering_id'] ?? null,
            'academic_year_id' => $data['academic_year_id'],
            'year_group_id' => $data['year_group_id'],
            'subject_id' => $data['subject_id'],
            'name' => $data['name'],
        ]);

        return response()->json($classroom->load(['subject', 'yearGroup', 'tutor.user', 'academicYear', 'courseOffering']), 201);
    }

    public function show(Request $request, Classroom $class): JsonResponse
    {
        $this->authorizeClass($request->user(), $class);

        return response()->json($class->load(['subject', 'yearGroup', 'tutor.user', 'academicYear', 'students.user']));
    }

    public function update(Request $request, Classroom $class): JsonResponse
    {
        $this->authorizeClass($request->user(), $class);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'tutor_id' => ['sometimes', 'integer', 'exists:tutors,id'],
            'year_group_id' => ['sometimes', 'integer', 'exists:year_groups,id'],
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
        ]);

        $class->update($data);

        return response()->json($class->load(['subject', 'yearGroup', 'tutor.user', 'academicYear']));
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
