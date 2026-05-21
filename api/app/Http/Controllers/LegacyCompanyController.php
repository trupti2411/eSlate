<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\AcademicYear;
use App\Models\Assignment;
use App\Models\Business;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Submission;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Compatibility shim for legacy Node-era endpoints used by the
 * existing React dashboards. New code should use the canonical
 * controllers (Assignment/Submission/Classroom).
 */
class LegacyCompanyController extends Controller
{
    use ResolvesScope;

    public function companyAdmin(Request $request, int $userId): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && $user->id !== $userId) {
            abort(403);
        }

        $business = Business::where('owner_user_id', $userId)->first();

        return response()->json([
            'userId' => (string) $userId,
            'companyId' => $business ? (string) $business->id : null,
            'companyName' => $business?->name,
            'tier' => $business?->tier,
            'businessType' => $business?->type,
        ]);
    }

    public function tutorSubmissions(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Submission::query()->with(['assignment.classroom', 'student.user']);

        if (! $user->isAdmin()) {
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

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function companyStudents(Request $request, int $companyId): JsonResponse
    {
        $this->assertCanAccessBusiness($request->user(), $companyId);

        $students = Student::where('business_id', $companyId)
            ->with(['user', 'parents'])
            ->get();

        return response()->json($students);
    }

    public function companyClasses(Request $request, int $companyId): JsonResponse
    {
        $this->assertCanAccessBusiness($request->user(), $companyId);

        $classes = Classroom::where('business_id', $companyId)
            ->with(['subject', 'yearGroup', 'tutor.user'])
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id' => (string) $c->id,
                'name' => $c->name,
                'description' => null,
                'gradeLevel' => $c->yearGroup?->label,
                'subject' => $c->subject?->name,
            ]);

        return response()->json($classes);
    }

    public function incompleteHomework(Request $request): JsonResponse
    {
        return response()->json([]);
    }

    public function uploadDirect(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480'],
        ]);

        $file = $request->file('file');
        $name = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('uploads', $name, 'local');

        return response()->json([
            'fileUrl' => "/api/uploads/{$name}",
            'fileName' => $file->getClientOriginalName(),
            'storedAs' => $path,
        ]);
    }

    public function remindStudent(Request $request): JsonResponse
    {
        $request->validate(['studentUserId' => ['nullable']]);

        return response()->json(['message' => 'Reminder queued (stubbed; messaging is out of MVP scope).']);
    }

    public function gradeSubmission(Request $request, Submission $submission): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isTutor() && ! $user->isBusiness()) {
            abort(403);
        }

        $this->assertCanAccessBusiness($user, $submission->assignment->business_id);

        $data = $request->validate([
            'score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'feedback' => ['nullable', 'string'],
        ]);

        $submission->update([
            'mark_score' => $data['score'] ?? $submission->mark_score,
            'mark_comment' => $data['feedback'] ?? $submission->mark_comment,
            'marked_at' => now(),
            'marked_by_tutor_id' => $user->isTutor() ? $user->tutor?->id : null,
            'status' => Submission::STATUS_MARKED,
        ]);

        return response()->json($submission->fresh()->load(['assignment', 'student.user']));
    }

    public function aiCheckSubmission(Request $request, Submission $submission): JsonResponse
    {
        return response()->json([
            'completionStatus' => 'unknown',
            'whatIsMissing' => [],
            'suggestedNextSteps' => [],
            'canFullyCheck' => false,
            'warnings' => ['AI grading is not enabled in MVP.'],
        ]);
    }

    public function downloadUpload(string $name)
    {
        $path = "uploads/{$name}";
        if (! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        return Storage::disk('local')->response($path);
    }

    // ---------- Classic dashboard additions ----------

    public function listCompanies(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Business::query();

        if (! $user->isAdmin()) {
            $query->where('owner_user_id', $user->id);
        }

        return response()->json($query->orderBy('name')->get()->map(fn ($b) => [
            'id'        => (string) $b->id,
            'name'      => $b->name,
            'state'     => $b->state_code,
            'type'      => $b->type,                   // individual | multi_tutor
            'tier'      => $b->tier,
            'hasOwner'  => $b->owner_user_id !== null, // false until the invitee accepts
            'companyId' => (string) $b->id,
        ]));
    }

    /**
     * GET /api/companies/{companyId}/audit-log — last N events scoped to this business.
     * Returned newest-first. Limited to 20 by default to keep dashboard payload tight.
     */
    public function companyAuditLog(Request $request, int $companyId): JsonResponse
    {
        $this->assertCanAccessBusiness($request->user(), $companyId);

        $limit = (int) $request->query('limit', 10);
        $limit = max(1, min(50, $limit));

        $entries = \App\Models\AuditLog::where('business_id', $companyId)
            ->with('actor:id,name,email')
            ->orderByDesc('occurred_at')
            ->limit($limit)
            ->get();

        return response()->json($entries->map(fn ($e) => [
            'id'         => $e->id,
            'event'      => $e->event,
            'entity'     => $e->entity_type,
            'entityId'   => $e->entity_id,
            'occurredAt' => $e->occurred_at?->toIso8601String(),
            'actor'      => $e->actor ? ['id' => $e->actor->id, 'name' => $e->actor->name] : null,
            'payload'    => $e->payload,
        ]));
    }

    public function companyTutors(Request $request, int $companyId): JsonResponse
    {
        $this->assertCanAccessBusiness($request->user(), $companyId);

        $tutors = Tutor::where('business_id', $companyId)->with('user')->get();

        return response()->json($tutors->map(fn ($t) => [
            'id' => (string) $t->id,
            'userId' => (string) $t->user_id,
            'firstName' => explode(' ', $t->user?->name ?? '')[0] ?? '',
            'lastName' => $this->lastNameOf($t->user?->name ?? ''),
            'email' => $t->user?->email,
            'role' => 'tutor',
            'status' => $t->status,
            'complianceStatus' => $t->compliance_status,
            'wwccExpiry' => $t->wwcc_expiry?->toDateString(),
        ]));
    }

    public function companyAcademicHierarchy(Request $request, int $companyId): JsonResponse
    {
        $this->assertCanAccessBusiness($request->user(), $companyId);

        $years = AcademicYear::where('business_id', $companyId)
            ->with('terms.weeks')
            ->orderByDesc('year')
            ->get();

        return response()->json([
            'years' => $years,
            'terms' => $years->flatMap(fn ($y) => $y->terms),
            'weeks' => $years->flatMap(fn ($y) => $y->terms->flatMap(fn ($t) => $t->weeks)),
        ]);
    }

    public function companySettings(Request $request): JsonResponse
    {
        return response()->json([
            'tutorChatEnabled' => true,
        ]);
    }

    public function updateCompanySettings(Request $request): JsonResponse
    {
        $request->validate(['tutorChatEnabled' => ['nullable', 'boolean']]);

        return response()->json([
            'tutorChatEnabled' => (bool) $request->input('tutorChatEnabled', true),
        ]);
    }

    public function supportContacts(Request $request): JsonResponse
    {
        return response()->json([]);
    }

    public function addSupportContact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'roleLabel' => ['required', 'string'],
        ]);

        return response()->json([
            'id' => (string) Str::uuid(),
            'firstName' => '',
            'lastName' => '',
            'email' => $data['email'],
            'roleLabel' => $data['roleLabel'],
        ], 201);
    }

    public function removeSupportContact(Request $request, string $contactId): JsonResponse
    {
        return response()->json(['message' => 'Removed (stub).']);
    }

    public function createTutor(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isBusiness() && ! $user->isAdmin()) {
            abort(403);
        }

        $data = $request->validate([
            'firstName' => ['required', 'string'],
            'lastName' => ['nullable', 'string'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:8'],
            'companyId' => ['nullable'],
        ]);

        $business = $user->isBusiness()
            ? Business::where('owner_user_id', $user->id)->firstOrFail()
            : Business::findOrFail($data['companyId']);

        $newUser = User::create([
            'name' => trim(($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? '')),
            'email' => $data['email'],
            'password' => Hash::make($data['password'] ?? Str::random(12)),
            'role' => User::ROLE_TUTOR,
        ]);

        $tutor = Tutor::create([
            'user_id' => $newUser->id,
            'business_id' => $business->id,
        ]);

        return response()->json([
            'id' => (string) $tutor->id,
            'userId' => (string) $newUser->id,
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'] ?? '',
            'email' => $newUser->email,
            'role' => 'tutor',
        ], 201);
    }

    public function reportTypes(Request $request): JsonResponse
    {
        return response()->json([]);
    }

    public function reportHistory(Request $request): JsonResponse
    {
        return response()->json([]);
    }

    public function runReport(Request $request): JsonResponse
    {
        return response()->json([
            'id' => (string) Str::uuid(),
            'status' => 'completed',
            'summary' => 'Reports are not available in MVP.',
            'data' => [],
        ]);
    }

    public function companySubmissions(Request $request): JsonResponse
    {
        return $this->tutorSubmissions($request);
    }

    public function reviewerAnnotations(Request $request, Submission $submission): JsonResponse
    {
        $request->validate(['reviewerAnnotations' => ['nullable']]);

        return response()->json([
            'submission' => $submission->fresh(),
            'message' => 'Reviewer annotations stubbed (storage TBD).',
        ]);
    }

    public function updateStudent(Request $request, Student $student): JsonResponse
    {
        $this->assertCanAccessBusiness($request->user(), $student->business_id);

        $data = $request->validate([
            'tutorId' => ['nullable', 'integer', 'exists:tutors,id'],
        ]);

        if (array_key_exists('tutorId', $data) && $data['tutorId']) {
            $student->tutors()->syncWithoutDetaching([
                $data['tutorId'] => ['is_primary' => true],
            ]);
        }

        return response()->json($student->fresh()->load('user'));
    }

    private function lastNameOf(string $name): string
    {
        $space = strpos($name, ' ');

        return $space === false ? '' : trim(substr($name, $space + 1));
    }

    private function assertCanAccessBusiness($user, ?int $businessId): void
    {
        if ($businessId === null || $user->isAdmin()) {
            return;
        }

        if ($user->isBusiness()) {
            $owned = Business::where('owner_user_id', $user->id)->where('id', $businessId)->exists();
            if (! $owned) {
                abort(403);
            }

            return;
        }

        if ($user->isTutor()) {
            $tutor = $user->tutor;
            if (! $tutor || $tutor->business_id !== $businessId) {
                abort(403);
            }

            return;
        }

        abort(403);
    }
}
