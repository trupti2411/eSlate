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
            'name' => ['required', 'string', 'max:100'],
            'business_id' => ['nullable', 'integer', 'exists:businesses,id'],
        ]);

        $scope = $this->resolveOwnerScope(
            $request->user(),
            $data['business_id'] ?? null,
            $data['tutor_id']
        );

        $classroom = Classroom::create([
            'business_id' => $scope['business_id'],
            'tutor_id' => $data['tutor_id'],
            'academic_year_id' => $data['academic_year_id'],
            'year_group_id' => $data['year_group_id'],
            'subject_id' => $data['subject_id'],
            'name' => $data['name'],
        ]);

        return response()->json($classroom->load(['subject', 'yearGroup', 'tutor.user', 'academicYear']), 201);
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
