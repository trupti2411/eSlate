<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubmissionController extends Controller
{
    use ResolvesScope;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Submission::query()->with(['assignment', 'student.user']);

        if ($user->isStudent()) {
            $student = $user->student;
            if (! $student) {
                abort(403);
            }
            $query->where('student_id', $student->id);
        } elseif (! $user->isAdmin()) {
            $scope = $this->resolveOwnerScope($user);
            $query->whereHas('assignment', function ($q) use ($scope) {
                $q->where(function ($qq) use ($scope) {
                    if ($scope['tutor_id']) {
                        $qq->where('tutor_id', $scope['tutor_id']);
                    }
                    if ($scope['business_id']) {
                        $qq->orWhere('business_id', $scope['business_id']);
                    }
                });
            });
        }

        if ($request->filled('assignment_id')) {
            $query->where('assignment_id', $request->integer('assignment_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function submit(Request $request, Assignment $assignment): JsonResponse
    {
        $user = $request->user();
        if (! $user->isStudent()) {
            abort(403, 'Only students can submit.');
        }
        $student = $user->student;
        if (! $student) {
            abort(403);
        }

        $isClassMember = $assignment->class_id
            && $student->classrooms()->where('classes.id', $assignment->class_id)->exists();
        $isTargeted = $assignment->targetStudents()->where('students.id', $student->id)->exists();
        if (! $isClassMember && ! $isTargeted) {
            abort(403, 'This assignment is not for you.');
        }
        if ($assignment->status !== Assignment::STATUS_PUBLISHED) {
            abort(403, 'Assignment not published.');
        }

        $data = $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:20480'],
        ]);

        $submission = Submission::firstOrNew([
            'assignment_id' => $assignment->id,
            'student_id' => $student->id,
        ]);

        if ($submission->annotated_pdf_path && Storage::disk('local')->exists($submission->annotated_pdf_path)) {
            Storage::disk('local')->delete($submission->annotated_pdf_path);
        }

        $file = $data['pdf'];
        $submission->annotated_pdf_path = '';
        $submission->annotated_pdf_original_name = $file->getClientOriginalName();
        $submission->status = Submission::STATUS_SUBMITTED;
        $submission->submitted_at = now();
        $submission->save();

        $path = $file->storeAs(
            "submissions/{$submission->id}",
            Str::uuid() . '.pdf',
            'local'
        );
        $submission->update(['annotated_pdf_path' => $path]);

        return response()->json($submission->fresh()->load(['assignment', 'student.user']), 201);
    }

    public function show(Request $request, Submission $submission): JsonResponse
    {
        $this->authorizeRead($request->user(), $submission);

        return response()->json($submission->load(['assignment', 'student.user', 'markedBy.user']));
    }

    public function downloadPdf(Request $request, Submission $submission): StreamedResponse
    {
        $this->authorizeRead($request->user(), $submission);

        if (! $submission->annotated_pdf_path || ! Storage::disk('local')->exists($submission->annotated_pdf_path)) {
            abort(404, 'No annotated PDF on disk.');
        }

        return Storage::disk('local')->download(
            $submission->annotated_pdf_path,
            $submission->annotated_pdf_original_name,
            ['Content-Type' => 'application/pdf']
        );
    }

    public function mark(Request $request, Submission $submission): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isTutor() && ! $user->isBusiness()) {
            abort(403);
        }

        $this->authorizeMark($user, $submission);

        $data = $request->validate([
            'mark_comment' => ['nullable', 'string'],
            'mark_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'return_to_student' => ['nullable', 'boolean'],
        ]);

        $tutorId = $user->isTutor() ? $user->tutor?->id : null;

        $submission->update([
            'mark_comment' => $data['mark_comment'] ?? $submission->mark_comment,
            'mark_score' => $data['mark_score'] ?? $submission->mark_score,
            'marked_at' => now(),
            'marked_by_tutor_id' => $tutorId,
            'status' => ($data['return_to_student'] ?? false)
                ? Submission::STATUS_RETURNED
                : Submission::STATUS_MARKED,
        ]);

        return response()->json($submission->fresh()->load(['assignment', 'student.user', 'markedBy.user']));
    }

    private function authorizeRead($user, Submission $submission): void
    {
        if ($user->isAdmin()) {
            return;
        }

        if ($user->isStudent()) {
            $student = $user->student;
            if (! $student || $submission->student_id !== $student->id) {
                abort(403);
            }

            return;
        }

        $this->authorizeMark($user, $submission);
    }

    private function authorizeMark($user, Submission $submission): void
    {
        if ($user->isAdmin()) {
            return;
        }

        $scope = $this->resolveOwnerScope($user);
        $assignment = $submission->assignment;

        $owned = ($scope['tutor_id'] !== null && $assignment->tutor_id === $scope['tutor_id'])
            || ($scope['business_id'] !== null && $assignment->business_id === $scope['business_id']);

        if (! $owned) {
            abort(403);
        }
    }
}
