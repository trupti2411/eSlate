<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Invitation;
use App\Models\Tutor;
use App\Models\User;
use App\Services\AuditLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Self-onboarding endpoints. Mix of authenticated (WWCC, tutor profile)
 * and public token-based (accept invitation) endpoints.
 * Per v3 §5.2 (Path A steps 2 & 7), §5.3 (Path B steps 2 + 5), §8 (WWCC).
 */
class OnboardingController extends Controller
{
    public function __construct(
        private readonly AuditLogger $audit,
    ) {}

    /**
     * POST /api/onboarding/accept-business-invite — Path A step 2 (v3 §5.2).
     * Public; consumes a single-use token. Owner sets password and claims the business.
     */
    public function acceptBusinessInvite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token'      => ['required', 'string'],
            'password'   => ['required', 'string', 'min:8'],
            'first_name' => ['required', 'string', 'max:60'],
            'last_name'  => ['required', 'string', 'max:60'],
        ]);

        $invitation = Invitation::where('token', $data['token'])
            ->where('kind', Invitation::KIND_BUSINESS_OWNER)
            ->first();

        if (! $invitation || ! $invitation->isUsable()) {
            return response()->json(['message' => 'Invitation invalid or expired.'], 422);
        }

        return DB::transaction(function () use ($invitation, $data) {
            $business = Business::findOrFail($invitation->business_id);

            // Solo tutors get role=tutor + an attached Tutor row so they go through the WWCC + state-pack
            // onboarding. Multi-tutor owners get role=business (wire-renamed to 'company_admin' on /api/me).
            $isIndividual = $business->isIndividual();

            $user = User::create([
                'name'     => trim("{$data['first_name']} {$data['last_name']}"),
                'email'    => $invitation->email,
                'password' => $data['password'],          // hashed via cast
                'role'     => $isIndividual ? User::ROLE_TUTOR : User::ROLE_BUSINESS,
            ]);

            $business->update(['owner_user_id' => $user->id]);

            if ($isIndividual) {
                Tutor::create([
                    'user_id'           => $user->id,
                    'business_id'       => $business->id,
                    'status'            => Tutor::STATUS_PENDING_COMPLIANCE,
                    'compliance_status' => Tutor::COMPLIANCE_PENDING,
                ]);
            }

            $invitation->update([
                'accepted_at'         => now(),
                'accepted_by_user_id' => $user->id,
            ]);

            $this->audit->log(
                event: 'owner_password_set',
                businessId: $business->id,
                actor: $user,
                entityType: 'invitation',
                entityId: $invitation->id,
            );

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'token'        => $token,
                'user'         => $this->shapeUser($user),
                'business_id'  => $business->id,
                'business_type'=> $business->type,
            ], 201);
        });
    }

    /**
     * POST /api/onboarding/accept-tutor-invite — Path A step 7 (v3 §5.2 + §8).
     * Public; consumes a single-use token. Tutor sets password and captures WWCC inline.
     * Tutor row already exists from the invite step (status=invited); this activates it.
     */
    public function acceptTutorInvite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token'       => ['required', 'string'],
            'password'    => ['required', 'string', 'min:8'],
            'wwcc_number' => ['required', 'string', 'max:120'],
            'wwcc_expiry' => ['required', 'date'],
            'wwcc_state'  => ['required', 'string', 'size:3'],
        ]);

        $invitation = Invitation::where('token', $data['token'])
            ->where('kind', Invitation::KIND_TUTOR)
            ->first();

        if (! $invitation || ! $invitation->isUsable()) {
            return response()->json(['message' => 'Invitation invalid or expired.'], 422);
        }

        if (Carbon::parse($data['wwcc_expiry'])->lt(now()->addDays(30)->startOfDay())) {
            return response()->json([
                'message' => 'WWCC expiry must be at least 30 days in the future.',
                'errors'  => ['wwcc_expiry' => ['Expiry too soon.']],
            ], 422);
        }

        return DB::transaction(function () use ($invitation, $data) {
            $user = User::where('email', $invitation->email)->firstOrFail();
            $user->update(['password' => $data['password']]);    // hashed via cast

            $tutor = Tutor::where('user_id', $user->id)->firstOrFail();
            $tutor->update([
                'wwcc_number'       => $data['wwcc_number'],
                'wwcc_expiry'       => $data['wwcc_expiry'],
                'wwcc_state'        => $data['wwcc_state'],
                'compliance_status' => Tutor::COMPLIANCE_COMPLIANT,
                'status'            => Tutor::STATUS_ACTIVE,
            ]);

            $invitation->update([
                'accepted_at'         => now(),
                'accepted_by_user_id' => $user->id,
            ]);

            $this->audit->log(
                event: 'tutor_activated',
                businessId: $tutor->business_id,
                actor: $user,
                entityType: 'tutor',
                entityId: $tutor->id,
            );

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user'  => $this->shapeUser($user),
                'tutor' => [
                    'id'                => $tutor->id,
                    'business_id'       => $tutor->business_id,
                    'status'            => $tutor->status,
                    'compliance_status' => $tutor->compliance_status,
                ],
            ], 201);
        });
    }

    private function shapeUser(User $user): array
    {
        return [
            'id'    => $user->id,
            'email' => $user->email,
            'name'  => $user->name,
            'role'  => $user->role === User::ROLE_BUSINESS ? 'company_admin' : $user->role,
        ];
    }

    /** POST /api/me/wwcc — capture WWCC. Mandatory before tutor can be assigned to classes involving minors. */
    public function captureWwcc(Request $request): JsonResponse
    {
        $tutor = Tutor::where('user_id', $request->user()->id)->firstOrFail();

        $data = $request->validate([
            'wwcc_number' => ['required', 'string', 'max:120'],
            'wwcc_expiry' => ['required', 'date'],
            'wwcc_state'  => ['required', 'string', 'size:3'],
        ]);

        // v3 §8.1: expiry must be ≥30 days in the future at point of capture.
        if (Carbon::parse($data['wwcc_expiry'])->lt(now()->addDays(30)->startOfDay())) {
            return response()->json([
                'message' => 'WWCC expiry must be at least 30 days in the future.',
                'errors'  => ['wwcc_expiry' => ['Expiry too soon.']],
            ], 422);
        }

        $tutor->update([
            'wwcc_number'       => $data['wwcc_number'],
            'wwcc_expiry'       => $data['wwcc_expiry'],
            'wwcc_state'        => $data['wwcc_state'],
            'compliance_status' => Tutor::COMPLIANCE_COMPLIANT,
            'status'            => Tutor::STATUS_ACTIVE,
        ]);

        return response()->json([
            'compliance_status' => $tutor->compliance_status,
            'status'            => $tutor->status,
            'wwcc_expiry'       => $tutor->wwcc_expiry?->toDateString(),
        ]);
    }

    /** GET /api/me/tutor-profile — return the authenticated tutor's full profile + business + WWCC. */
    public function showTutorProfile(Request $request): JsonResponse
    {
        $tutor = Tutor::where('user_id', $request->user()->id)
            ->with(['user:id,name,email', 'business:id,name,type,tier,state_code'])
            ->firstOrFail();

        return response()->json([
            'id'                 => (string) $tutor->id,
            'business'           => $tutor->business ? [
                'id'         => (string) $tutor->business->id,
                'name'       => $tutor->business->name,
                'type'       => $tutor->business->type,
                'tier'       => $tutor->business->tier,
                'state_code' => $tutor->business->state_code,
            ] : null,
            'name'               => $tutor->user?->name,
            'email'              => $tutor->user?->email,
            'bio'                => $tutor->bio,
            'hourly_rate'        => $tutor->hourly_rate,
            'qualifications'     => $tutor->qualifications,
            'delivery_modes'     => $tutor->delivery_modes,
            'year_levels'        => $tutor->year_levels,
            'wwcc_number'        => $tutor->wwcc_number,
            'wwcc_expiry'        => $tutor->wwcc_expiry?->toDateString(),
            'wwcc_state'         => $tutor->wwcc_state,
            'compliance_status'  => $tutor->compliance_status,
            'status'             => $tutor->status,
        ]);
    }

    /** PATCH /api/me/tutor-profile — solo tutor or invited tutor sets their teaching profile. */
    public function updateTutorProfile(Request $request): JsonResponse
    {
        $tutor = Tutor::where('user_id', $request->user()->id)->firstOrFail();

        $data = $request->validate([
            'bio'             => ['nullable', 'string'],
            'hourly_rate'     => ['nullable', 'numeric', 'min:0'],
            'qualifications'  => ['nullable', 'array'],
            'delivery_modes'  => ['nullable', 'array'],
            'year_levels'     => ['nullable', 'array'],
        ]);

        $tutor->update($data);

        return response()->json($tutor->fresh());
    }
}
