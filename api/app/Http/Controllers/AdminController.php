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
     * POST /api/admin/businesses/invite — Path A step 1 (v3 §5.2).
     * Admin creates a Multi-tutor business shell + signed invitation token for the owner email.
     * The business has no owner_user_id until the owner accepts the invite.
     */
    public function inviteBusiness(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Admin only.'], 403);
        }

        $data = $request->validate([
            'name'        => ['required', 'string', 'min:2', 'max:255'],
            'owner_email' => ['required', 'email'],
            'state_code'  => ['required', Rule::in(['NSW'])],   // v1: NSW only
        ]);

        return DB::transaction(function () use ($data, $user) {
            $business = Business::create([
                'type'       => Business::TYPE_MULTI_TUTOR,
                'name'       => $data['name'],
                'state_code' => $data['state_code'],
                'tier'       => Business::TIER_STARTER,
                // owner_user_id intentionally null until the owner accepts.
            ]);

            $invitation = Invitation::create([
                'kind'        => Invitation::KIND_BUSINESS_OWNER,
                'business_id' => $business->id,
                'email'       => $data['owner_email'],
                'token'       => Invitation::generateToken(),
                'expires_at'  => now()->addDays(Invitation::TTL_DAYS),
            ]);

            $this->audit->log(
                event: 'business_invited',
                businessId: $business->id,
                actor: $user,
                entityType: 'invitation',
                entityId: $invitation->id,
                payload: ['email' => $data['owner_email'], 'state_code' => $data['state_code']],
            );

            return response()->json([
                'invitation_id' => $invitation->id,
                'business_id'   => $business->id,
                'token'         => $invitation->token,           // dev only — production sends via email
                'expires_at'    => $invitation->expires_at->toIso8601String(),
            ], 201);
        });
    }
}
