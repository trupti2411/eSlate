<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\Assignment;
use App\Models\Classroom;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AssignmentController extends Controller
{
    use ResolvesScope;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Assignment::query()->with(['classroom.subject', 'classroom.yearGroup', 'week']);

        if (! $user->isAdmin()) {
            $scope = $this->resolveOwnerScope($user);
            $query->where(function ($q) use ($scope) {
                if ($scope['tutor_id']) {
                    $q->where('tutor_id', $scope['tutor_id']);
                }
                if ($scope['business_id']) {
                    $q->orWhere('business_id', $scope['business_id']);
                }
            });
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->integer('class_id'));
        }
        if ($request->filled('week_id')) {
            $query->where('week_id', $request->integer('week_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'class_id' => ['nullable', 'integer', 'exists:classes,id'],
            'week_id' => ['nullable', 'integer', 'exists:weeks,id'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'exists:students,id'],
        ]);

        $scope = $this->resolveOwnerScope($request->user());
        if (! $scope['tutor_id']) {
            abort(403, 'Only tutors can create assignments.');
        }

        if (! empty($data['class_id'])) {
            $class = Classroom::findOrFail($data['class_id']);
            $this->assertClassOwnedByScope($class, $scope);
            $businessId = $class->business_id;
        } else {
            $businessId = $scope['business_id'];
        }

        $file = $request->file('pdf');
        $assignment = Assignment::create([
            'business_id' => $businessId,
            'tutor_id' => $scope['tutor_id'],
            'class_id' => $data['class_id'] ?? null,
            'week_id' => $data['week_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'pdf_path' => '',
            'pdf_original_name' => $file->getClientOriginalName(),
            'due_date' => $data['due_date'] ?? null,
            'status' => $data['status'] ?? Assignment::STATUS_DRAFT,
        ]);

        $path = $file->storeAs(
            "assignments/{$assignment->id}",
            Str::uuid() . '.pdf',
            'local'
        );

        $assignment->update(['pdf_path' => $path]);

        if (! empty($data['student_ids']) && empty($data['class_id'])) {
            $assignment->targetStudents()->sync($data['student_ids']);
        }

        return response()->json(
            $assignment->load(['classroom.subject', 'classroom.yearGroup', 'week', 'targetStudents.user']),
            201
        );
    }

    public function show(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorizeRead($request->user(), $assignment);

        return response()->json(
            $assignment->load(['classroom.subject', 'classroom.yearGroup', 'week', 'targetStudents.user'])
        );
    }

    public function update(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorizeWrite($request->user(), $assignment);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string'],
            'week_id' => ['sometimes', 'nullable', 'integer', 'exists:weeks,id'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'in:draft,published,archived'],
        ]);

        $assignment->update($data);

        return response()->json($assignment->fresh()->load(['classroom.subject', 'week']));
    }

    public function destroy(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorizeWrite($request->user(), $assignment);

        if ($assignment->pdf_path && Storage::disk('local')->exists($assignment->pdf_path)) {
            Storage::disk('local')->delete($assignment->pdf_path);
        }
        $assignment->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function downloadPdf(Request $request, Assignment $assignment): StreamedResponse
    {
        $this->authorizeRead($request->user(), $assignment);

        if (! Storage::disk('local')->exists($assignment->pdf_path)) {
            abort(404, 'PDF not found on disk.');
        }

        return Storage::disk('local')->download(
            $assignment->pdf_path,
            $assignment->pdf_original_name,
            ['Content-Type' => 'application/pdf']
        );
    }

    public function myAssignments(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isStudent()) {
            abort(403, 'Only students have a "my assignments" view.');
        }
        $student = $user->student;
        if (! $student) {
            abort(403, 'No student record for this user.');
        }

        $query = Assignment::query()
            ->visibleTo($student)
            ->with(['classroom.subject', 'classroom.yearGroup', 'week']);

        if ($request->filled('week_id')) {
            $query->where('week_id', $request->integer('week_id'));
        }

        $assignments = $query->orderBy('due_date')->get();

        $submissionsByAssignmentId = Submission::where('student_id', $student->id)
            ->whereIn('assignment_id', $assignments->pluck('id'))
            ->get()
            ->keyBy('assignment_id');

        $assignments->each(function ($a) use ($submissionsByAssignmentId) {
            $a->setAttribute('my_submission', $submissionsByAssignmentId->get($a->id));
        });

        return response()->json($assignments);
    }

    private function authorizeRead($user, Assignment $assignment): void
    {
        if ($user->isAdmin()) {
            return;
        }

        if ($user->isStudent()) {
            $student = $user->student;
            if (! $student) {
                abort(403);
            }

            $isClassMember = $assignment->class_id
                && $student->classrooms()->where('classes.id', $assignment->class_id)->exists();
            $isTargeted = $assignment->targetStudents()->where('students.id', $student->id)->exists();

            if (! $isClassMember && ! $isTargeted) {
                abort(403);
            }

            if ($assignment->status !== Assignment::STATUS_PUBLISHED) {
                abort(403);
            }

            return;
        }

        $this->authorizeWrite($user, $assignment);
    }

    private function authorizeWrite($user, Assignment $assignment): void
    {
        if ($user->isAdmin()) {
            return;
        }

        $scope = $this->resolveOwnerScope($user);

        $owned = ($scope['tutor_id'] !== null && $assignment->tutor_id === $scope['tutor_id'])
            || ($scope['business_id'] !== null && $assignment->business_id === $scope['business_id']);

        if (! $owned) {
            abort(403);
        }
    }

    private function assertClassOwnedByScope(Classroom $class, array $scope): void
    {
        $owned = ($scope['tutor_id'] !== null && $class->tutor_id === $scope['tutor_id'])
            || ($scope['business_id'] !== null && $class->business_id === $scope['business_id']);

        if (! $owned) {
            abort(403, 'Cannot create assignment for a class you do not own.');
        }
    }
}
