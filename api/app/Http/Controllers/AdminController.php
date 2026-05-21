<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Invitation;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function __construct(
        private readonly AuditLogger $audit,
    ) {}

    /**
     * POST /api/admin/businesses/invite — Path A step 1 (v3 §5.2) and Path B admin-created variant.
     * Admin creates a business shell (individual or multi_tutor) + signed invitation token.
     * The business has no owner_user_id until the owner accepts the invite.
     *
     * Solo tutor invites: name is optional; auto-derived from owner_first/last_name as
     * "{First} {Last} Tutoring" per Shadow Business naming convention.
     */
    public function inviteBusiness(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Admin only.'], 403);
        }

        $data = $request->validate([
            'type'              => ['nullable', Rule::in(Business::TYPES)],
            'name'              => ['nullable', 'string', 'min:2', 'max:255'],
            'owner_email'       => ['required', 'email'],
            'owner_first_name'  => ['nullable', 'string', 'max:60'],
            'owner_last_name'   => ['nullable', 'string', 'max:60'],
            'state_code'        => ['required', Rule::in(['NSW'])],
        ]);

        $type = $data['type'] ?? Business::TYPE_MULTI_TUTOR;
        $isIndividual = $type === Business::TYPE_INDIVIDUAL;

        // Name validation per type: multi_tutor requires explicit name; individual can derive.
        if (! $isIndividual && empty($data['name'])) {
            return response()->json([
                'message' => 'Business name is required for tutoring companies.',
                'errors'  => ['name' => ['Required for multi-tutor businesses.']],
            ], 422);
        }
        if ($isIndividual && empty($data['name']) && empty($data['owner_first_name']) && empty($data['owner_last_name'])) {
            return response()->json([
                'message' => 'Provide either a business name or owner first/last name for solo tutors.',
                'errors'  => ['owner_first_name' => ['Required when name is empty.']],
            ], 422);
        }

        $businessName = $data['name']
            ?? trim(($data['owner_first_name'] ?? '') . ' ' . ($data['owner_last_name'] ?? '')) . ' Tutoring';

        return DB::transaction(function () use ($data, $user, $type, $isIndividual, $businessName) {
            $business = Business::create([
                'type'       => $type,
                'name'       => $businessName,
                'state_code' => $data['state_code'],
                'tier'       => $isIndividual ? Business::TIER_INDIVIDUAL : Business::TIER_STARTER,
                // owner_user_id intentionally null until the owner accepts.
            ]);

            $invitation = Invitation::create([
                'kind'        => Invitation::KIND_BUSINESS_OWNER,
                'business_id' => $business->id,
                'email'       => $data['owner_email'],
                'first_name'  => $data['owner_first_name'] ?? null,
                'last_name'   => $data['owner_last_name'] ?? null,
                'token'       => Invitation::generateToken(),
                'expires_at'  => now()->addDays(Invitation::TTL_DAYS),
            ]);

            $this->audit->log(
                event: 'business_invited',
                businessId: $business->id,
                actor: $user,
                entityType: 'invitation',
                entityId: $invitation->id,
                payload: [
                    'email'      => $data['owner_email'],
                    'state_code' => $data['state_code'],
                    'type'       => $type,
                ],
            );

            return response()->json([
                'invitation_id' => $invitation->id,
                'business_id'   => $business->id,
                'business_type' => $type,
                'business_name' => $business->name,
                'token'         => $invitation->token,           // dev only — production sends via email
                'expires_at'    => $invitation->expires_at->toIso8601String(),
            ], 201);
        });
    }
}
