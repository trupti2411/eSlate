<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\BusinessSubject;
use App\Models\Invitation;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Tutor;
use App\Models\User;
use App\Models\YearGroup;
use App\Services\AuditLogger;
use App\Services\TierEnforcer;
use App\Services\TierLimitExceededException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    public function __construct(
        private readonly TierEnforcer $tier,
        private readonly AuditLogger $audit,
    ) {}

    /** GET /api/businesses/{id} — full business profile + active subject ids for the Settings page. */
    public function show(Request $request, int $id): JsonResponse
    {
        $business = Business::findOrFail($id);
        $this->assertCanManage($request->user(), $business);

        $activeSubjectIds = BusinessSubject::where('business_id', $business->id)
            ->where('is_active', true)
            ->whereNotNull('subject_id')
            ->pluck('subject_id');

        return response()->json([
            'id'                 => $business->id,
            'type'               => $business->type,
            'name'               => $business->name,
            'legal_name'         => $business->legal_name,
            'logo'               => $business->logo,
            'abn'                => $business->abn,
            'state_code'         => $business->state_code,
            'timezone'           => $business->timezone,
            'currency'           => $business->currency,
            'tier'               => $business->tier,
            'pack_version'       => $business->pack_version,
            'active_subject_ids' => $activeSubjectIds,
        ]);
    }

    /** PATCH /api/businesses/{id} — owner profile (logo, ABN, timezone, etc.) per v3 Path A step 5. */
    public function update(Request $request, int $id): JsonResponse
    {
        $business = Business::findOrFail($id);
        $this->assertCanManage($request->user(), $business);

        $data = $request->validate([
            'name'       => ['sometimes', 'string', 'min:2', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'logo'       => ['nullable', 'string', 'max:500'],
            'abn'        => ['nullable', 'string', 'max:20'],
            'timezone'   => ['sometimes', 'string', 'max:50'],
            'currency'   => ['sometimes', 'string', 'size:3'],
        ]);

        // ABN required for multi_tutor (v3 §3.2)
        if ($business->isMultiTutor() && array_key_exists('abn', $data) && empty($data['abn'])) {
            return response()->json([
                'message' => 'ABN is required for multi-tutor businesses.',
                'errors'  => ['abn' => ['ABN required.']],
            ], 422);
        }

        $business->update($data);

        return response()->json($business->fresh());
    }

    /** PATCH /api/businesses/{id}/subjects — toggle active master subjects (v3 Path A step 4 / Path B step 4). */
    public function updateSubjects(Request $request, int $id): JsonResponse
    {
        $business = Business::findOrFail($id);
        $this->assertCanManage($request->user(), $business);

        $data = $request->validate([
            'active_subject_ids'   => ['required', 'array'],
            'active_subject_ids.*' => ['integer', 'exists:subjects,id'],
        ]);

        return DB::transaction(function () use ($business, $data) {
            // Disable all existing master-subject toggles for this business...
            BusinessSubject::where('business_id', $business->id)
                ->whereNotNull('subject_id')
                ->update(['is_active' => false]);

            // ...then upsert the requested ones as active.
            foreach ($data['active_subject_ids'] as $subjectId) {
                BusinessSubject::updateOrCreate(
                    ['business_id' => $business->id, 'subject_id' => $subjectId],
                    ['is_active' => true]
                );
            }

            $active = BusinessSubject::where('business_id', $business->id)
                ->where('is_active', true)
                ->with('subject:id,code,name,state_code')
                ->get();

            return response()->json($active);
        });
    }

    /**
     * POST /api/businesses/{id}/tutors/invite — Path A step 6 (v3 §5.2).
     * Owner invites a tutor by email. Creates a placeholder users + tutors row in
     * status=invited / pending_compliance, plus a single-use invitation token.
     * Tier cap is enforced at the service layer.
     */
    public function inviteTutor(Request $request, int $id): JsonResponse
    {
        $business = Business::findOrFail($id);
        $caller = $request->user();
        $this->assertCanManage($caller, $business);

        try {
            $this->tier->assertCanAddTutor($business);
        } catch (TierLimitExceededException $e) {
            $this->audit->log('tier_limit_rejected', $business->id, $caller, payload: ['reason' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $data = $request->validate([
            'email'      => ['required', 'email'],
            'first_name' => ['required', 'string', 'max:60'],
            'last_name'  => ['required', 'string', 'max:60'],
        ]);

        // Reject if a user with this email already exists (per-business identity is allowed,
        // but at v1 we don't reuse users across businesses for invited tutors).
        if (User::where('email', $data['email'])->exists()) {
            return response()->json([
                'message' => 'A user with this email already exists.',
                'errors'  => ['email' => ['Email taken.']],
            ], 422);
        }

        return DB::transaction(function () use ($business, $caller, $data) {
            $user = User::create([
                'name'     => trim("{$data['first_name']} {$data['last_name']}"),
                'email'    => $data['email'],
                'password' => Str::random(64),    // unusable until accept sets a real password
                'role'     => User::ROLE_TUTOR,
            ]);

            $tutor = Tutor::create([
                'user_id'           => $user->id,
                'business_id'       => $business->id,
                'status'            => Tutor::STATUS_INVITED,
                'compliance_status' => Tutor::COMPLIANCE_PENDING,
            ]);

            $invitation = Invitation::create([
                'kind'        => Invitation::KIND_TUTOR,
                'business_id' => $business->id,
                'email'       => $data['email'],
                'first_name'  => $data['first_name'],
                'last_name'   => $data['last_name'],
                'token'       => Invitation::generateToken(),
                'expires_at'  => now()->addDays(Invitation::TTL_DAYS),
            ]);

            $this->audit->log(
                event: 'tutor_invited',
                businessId: $business->id,
                actor: $caller,
                entityType: 'tutor',
                entityId: $tutor->id,
                payload: ['email' => $data['email']],
            );

            return response()->json([
                'invitation_id' => $invitation->id,
                'tutor_id'      => $tutor->id,
                'token'         => $invitation->token,            // dev only — production sends via email
                'expires_at'    => $invitation->expires_at->toIso8601String(),
            ], 201);
        });
    }

    /** POST /api/businesses/{id}/students — owner adds a record-only student profile (no User row). */
    public function addStudent(Request $request, int $id): JsonResponse
    {
        $business = Business::findOrFail($id);
        $this->assertCanManage($request->user(), $business);

        $data = $request->validate([
            'first_name'                  => ['required', 'string', 'max:60'],
            'last_name'                   => ['required', 'string', 'max:60'],
            'year_group_code'             => ['required', 'string', 'max:10'],
            'date_of_birth'               => ['nullable', 'date'],
            'school'                      => ['nullable', 'string', 'max:120'],
            'learning_goals'              => ['nullable', 'string'],
            'parents'                     => ['nullable', 'array'],
            'parents.*.name'              => ['required_with:parents.*', 'string', 'max:120'],
            'parents.*.relationship'      => ['nullable', 'string', 'max:40'],
            'parents.*.email'             => ['nullable', 'email', 'max:255'],
            'parents.*.phone'             => ['nullable', 'string', 'max:40'],
            'parents.*.is_primary'        => ['nullable', 'boolean'],
        ]);

        // Validate year group exists for this business's state
        $yg = YearGroup::where('state_code', $business->state_code)
            ->where('code', $data['year_group_code'])
            ->first();
        if (! $yg) {
            return response()->json([
                'message' => 'Year group not valid for this state.',
                'errors'  => ['year_group_code' => ['Not a valid year group.']],
            ], 422);
        }

        return DB::transaction(function () use ($business, $request, $data) {
            $student = Student::create([
                'business_id'     => $business->id,
                'user_id'         => null, // record-only profile
                'first_name'      => $data['first_name'],
                'last_name'       => $data['last_name'],
                'year_group_code' => $data['year_group_code'],
                'date_of_birth'   => $data['date_of_birth'] ?? null,
                'school'          => $data['school'] ?? null,
                'learning_goals'  => $data['learning_goals'] ?? null,
                'status'          => Student::STATUS_ACTIVE,
            ]);

            $parents = $data['parents'] ?? [];
            // If no parent flagged primary, the first one wins by default.
            $anyPrimary = collect($parents)->contains(fn ($p) => ! empty($p['is_primary']));
            foreach ($parents as $i => $p) {
                $student->parents()->create([
                    'name'         => $p['name'],
                    'relationship' => $p['relationship'] ?? null,
                    'email'        => $p['email'] ?? null,
                    'phone'        => $p['phone'] ?? null,
                    'is_primary'   => $anyPrimary ? (bool) ($p['is_primary'] ?? false) : ($i === 0),
                ]);
            }

            $this->audit->log(
                event: 'student_added',
                businessId: $business->id,
                actor: $request->user(),
                entityType: 'student',
                entityId: $student->id,
                payload: ['parent_count' => count($parents)],
            );

            return response()->json($student->load('parents'), 201);
        });
    }

    private function assertCanManage(User $user, Business $business): void
    {
        $canManage = $user->isAdmin() || $business->owner_user_id === $user->id;
        if (! $canManage) {
            abort(403, 'Not authorised for this business.');
        }
    }
}
