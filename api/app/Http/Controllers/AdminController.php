<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Classroom;
use App\Models\Invitation;
use App\Models\Tutor;
use App\Models\User;
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
     * GET /api/admin/users — every user on the platform, hydrated with their business
     * attachment (owner / tutor / standalone). Admin-only.
     */
    public function listUsers(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Admin only.'], 403);
        }

        // Pull owner + tutor business linkage in one batch so we don't N+1 the list.
        $ownerBiz = Business::query()
            ->whereNotNull('owner_user_id')
            ->get(['id', 'name', 'type', 'tier', 'owner_user_id'])
            ->keyBy('owner_user_id');

        $tutorBiz = Tutor::query()
            ->with('business:id,name,type,tier')
            ->get(['id', 'user_id', 'business_id', 'status', 'compliance_status'])
            ->keyBy('user_id');

        $users = User::orderBy('role')->orderBy('id')->get();

        return response()->json($users->map(function (User $u) use ($ownerBiz, $tutorBiz) {
            $name = (string) ($u->name ?? '');
            $space = strpos($name, ' ');
            $firstName = $space === false ? $name : substr($name, 0, $space);
            $lastName = $space === false ? '' : trim(substr($name, $space + 1));

            $owned = $ownerBiz[$u->id] ?? null;
            $tutor = $tutorBiz[$u->id] ?? null;
            $tutorBusiness = $tutor?->business;

            // Wire-rename: legacy role=business → company_admin on the API.
            $wireRole = $u->role === User::ROLE_BUSINESS ? 'company_admin' : $u->role;

            return [
                'id'         => (string) $u->id,
                'firstName'  => $firstName,
                'lastName'   => $lastName,
                'email'      => $u->email,
                'role'       => $wireRole,
                'isActive'   => true,                                   // no is_active column yet — treat all as active
                'createdAt'  => $u->created_at?->toIso8601String(),
                'business'   => $owned ? [
                    'id'    => (string) $owned->id,
                    'name'  => $owned->name,
                    'type'  => $owned->type,
                    'tier'  => $owned->tier,
                    'relationship' => 'owner',
                ] : ($tutorBusiness ? [
                    'id'    => (string) $tutorBusiness->id,
                    'name'  => $tutorBusiness->name,
                    'type'  => $tutorBusiness->type,
                    'tier'  => $tutorBusiness->tier,
                    'relationship' => 'tutor',
                ] : null),
                'tutorStatus'      => $tutor?->status,
                'complianceStatus' => $tutor?->compliance_status,
            ];
        }));
    }

    /**
     * GET /api/admin/stats — counts for the admin dashboard cards.
     */
    public function stats(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Admin only.'], 403);
        }

        $byRole = User::select('role', DB::raw('count(*) as c'))
            ->groupBy('role')
            ->pluck('c', 'role');

        $totalUsers = (int) $byRole->sum();
        $businessesByType = Business::select('type', DB::raw('count(*) as c'))
            ->groupBy('type')
            ->pluck('c', 'type');

        return response()->json([
            'totalUsers'       => $totalUsers,
            'admins'           => (int) ($byRole['admin'] ?? 0),
            'companyAdmins'    => (int) ($byRole['business'] ?? 0),
            'tutors'           => (int) ($byRole['tutor'] ?? 0),
            'students'         => (int) ($byRole['student'] ?? 0),
            'parents'          => (int) ($byRole['parent'] ?? 0),
            'totalCompanies'   => (int) Business::count(),
            'individualBusinesses' => (int) ($businessesByType['individual'] ?? 0),
            'multiTutorBusinesses' => (int) ($businessesByType['multi_tutor'] ?? 0),
            'totalClasses'     => (int) Classroom::count(),
            'pendingInvites'   => (int) Invitation::whereNull('accepted_at')->whereNull('revoked_at')->where('expires_at', '>', now())->count(),
            'systemStatus'     => 'Online',
        ]);
    }

    /**
     * PATCH /api/admin/users/{user}/status — placeholder for active/inactive toggle.
     * Users table has no is_active column today; this returns 422 until the schema lands.
     */
    public function toggleUserStatus(Request $request, User $user): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Admin only.'], 403);
        }
        return response()->json([
            'message' => 'is_active column not yet on users table — toggle is a no-op for now.',
        ], 422);
    }

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
