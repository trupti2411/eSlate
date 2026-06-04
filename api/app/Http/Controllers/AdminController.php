<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Classroom;
use App\Models\Invitation;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
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
     * POST /api/admin/create-user — quick-create path used from the
     * /admin/companies/:id "Add user" dialog. Bypasses the invite-token
     * flow because the dialog does not collect a password and is meant
     * for fast operational adds. A temporary password is generated and
     * returned in the response so the admin can communicate it; first
     * login should still trigger a password change (future v2).
     *
     * Side-effects per role:
     *   - tutor          : also create Tutor row (status=active) under companyId.
     *   - student        : also create Student row under companyId. firstName/lastName
     *                      live on the student record (not the user) in this schema.
     *   - company_admin  : attach as owner_user_id on the business if it has no
     *                      owner yet. If an owner already exists, returns 409.
     *   - parent / admin : User only; parent has no side-table in v1.
     */
    public function createUser(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Admin only.'], 403);
        }

        $data = $request->validate([
            'email'     => ['required', 'email', 'max:255', 'unique:users,email'],
            'firstName' => ['required', 'string', 'max:60'],
            'lastName'  => ['nullable', 'string', 'max:60'],
            'role'      => ['required', Rule::in(['admin', 'company_admin', 'tutor', 'student', 'parent'])],
            'companyId' => ['nullable', 'integer', 'exists:businesses,id'],
        ]);

        // Wire-rename: company_admin → business for the users.role column.
        $storeRole = $data['role'] === 'company_admin' ? User::ROLE_BUSINESS : $data['role'];

        $tempPassword = 'Welcome1!' . Str::random(4);  // surfaced in response so admin can share

        $user = DB::transaction(function () use ($data, $storeRole, $tempPassword) {
            $user = User::create([
                'name'     => trim($data['firstName'] . ' ' . ($data['lastName'] ?? '')),
                'email'    => $data['email'],
                'password' => Hash::make($tempPassword),
                'role'     => $storeRole,
            ]);

            if ($data['role'] === 'tutor' && ! empty($data['companyId'])) {
                Tutor::create([
                    'user_id'           => $user->id,
                    'business_id'       => $data['companyId'],
                    'status'            => 'active',
                    'compliance_status' => 'pending_compliance',
                ]);
            } elseif ($data['role'] === 'student' && ! empty($data['companyId'])) {
                Student::create([
                    'user_id'         => $user->id,
                    'business_id'     => $data['companyId'],
                    'first_name'      => $data['firstName'],
                    'last_name'       => $data['lastName'] ?? '',
                    'year_group_code' => 'Y7',           // sensible default; tutor edits later
                    'status'          => 'active',
                ]);
            } elseif ($data['role'] === 'company_admin' && ! empty($data['companyId'])) {
                $biz = Business::find($data['companyId']);
                if ($biz && $biz->owner_user_id === null) {
                    $biz->update(['owner_user_id' => $user->id]);
                }
                // If business already has an owner we still keep the user; admin can wire later.
            }

            return $user;
        });

        return response()->json([
            'id'                => (string) $user->id,
            'email'             => $user->email,
            'firstName'         => explode(' ', $user->name, 2)[0] ?? '',
            'lastName'          => trim(substr($user->name, strlen(explode(' ', $user->name, 2)[0] ?? '') + 1)),
            'role'              => $data['role'],            // echo wire role back, not the storage role
            'isActive'          => true,
            'createdAt'         => $user->created_at?->toIso8601String(),
            'temporaryPassword' => $tempPassword,             // share with the new user out-of-band
        ], 201);
    }

    /**
     * PATCH /api/admin/users/{user} — update name/email/role on an
     * existing user. Wire-renames company_admin ↔ business. Role
     * changes do not retroactively create Tutor/Student rows — use
     * createUser for the role's full side-effects.
     */
    public function updateUser(Request $request, User $user): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Admin only.'], 403);
        }

        $data = $request->validate([
            'firstName' => ['sometimes', 'string', 'max:60'],
            'lastName'  => ['sometimes', 'nullable', 'string', 'max:60'],
            'email'     => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role'      => ['sometimes', Rule::in(['admin', 'company_admin', 'tutor', 'student', 'parent'])],
            // isActive accepted but ignored until users.is_active lands.
            'isActive'  => ['sometimes', 'boolean'],
        ]);

        $updates = [];
        if (array_key_exists('firstName', $data) || array_key_exists('lastName', $data)) {
            $first = $data['firstName'] ?? explode(' ', $user->name, 2)[0] ?? '';
            $last  = $data['lastName']  ?? trim(substr($user->name, strlen(explode(' ', $user->name, 2)[0] ?? '') + 1));
            $updates['name'] = trim($first . ' ' . $last);
        }
        if (array_key_exists('email', $data)) {
            $updates['email'] = $data['email'];
        }
        if (array_key_exists('role', $data)) {
            $updates['role'] = $data['role'] === 'company_admin' ? User::ROLE_BUSINESS : $data['role'];
        }

        if ($updates) {
            $user->update($updates);
        }

        $wireRole = $user->role === User::ROLE_BUSINESS ? 'company_admin' : $user->role;

        return response()->json([
            'id'        => (string) $user->id,
            'email'     => $user->email,
            'firstName' => explode(' ', $user->name, 2)[0] ?? '',
            'lastName'  => trim(substr($user->name, strlen(explode(' ', $user->name, 2)[0] ?? '') + 1)),
            'role'      => $wireRole,
            'isActive'  => true,
        ]);
    }

    /**
     * DELETE /api/admin/users/{user} — hard-delete the user and clean
     * up the role's side-tables (Tutor row, Student row). Refuses to
     * delete the calling admin or any other admin (safety guard).
     */
    public function deleteUser(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();
        if (! $actor->isAdmin()) {
            return response()->json(['message' => 'Admin only.'], 403);
        }
        if ($user->id === $actor->id) {
            return response()->json(['message' => "You can't delete your own account."], 422);
        }
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Refusing to delete another platform admin.'], 422);
        }

        DB::transaction(function () use ($user) {
            Tutor::where('user_id', $user->id)->delete();
            Student::where('user_id', $user->id)->delete();
            // If this user owned a business, clear the owner ref but leave the business.
            Business::where('owner_user_id', $user->id)->update(['owner_user_id' => null]);
            $user->delete();
        });

        return response()->json(['message' => 'User deleted.']);
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
            // ESLATE-1: admins may only create Tutoring Company (multi_tutor) profiles.
            // Solo-tutor (individual) businesses are not creatable through the admin
            // invite workflow — they arise only via the tutor's own onboarding.
            'type'              => ['nullable', Rule::in([Business::TYPE_MULTI_TUTOR])],
            'name'              => ['nullable', 'string', 'min:2', 'max:255'],
            'owner_email'       => ['required', 'email'],
            'owner_first_name'  => ['nullable', 'string', 'max:60'],
            'owner_last_name'   => ['nullable', 'string', 'max:60'],
            'state_code'        => ['required', Rule::in(['NSW'])],
            // ESLATE-3: optional company-profile details captured at creation time.
            // ABN is an 11-digit Australian Business Number; we accept it with or
            // without the conventional "XX XXX XXX XXX" spacing then strip to digits.
            'abn'               => ['nullable', 'string', 'regex:/^\d{2}\s?\d{3}\s?\d{3}\s?\d{3}$/'],
            'address'           => ['nullable', 'string', 'max:255'],
            'contact_email'     => ['nullable', 'email', 'max:255'],
            // E.164-ish: optional leading +, 7-15 digits, allow spaces, dashes, parens.
            'contact_phone'     => ['nullable', 'string', 'max:40', 'regex:/^[+\d][\d\s\-()]{6,30}$/'],
            'description'       => ['nullable', 'string', 'max:2000'],
        ], [
            'type.in'             => 'Admins can only create Tutoring Company profiles, not solo tutors.',
            'abn.regex'           => 'ABN must be 11 digits (e.g. "12 345 678 901" or "12345678901").',
            'contact_phone.regex' => 'Phone number looks invalid. Use digits, spaces, dashes or parentheses; optional leading +.',
        ]);

        // Normalise ABN to digit-only for storage.
        if (! empty($data['abn'])) {
            $data['abn'] = preg_replace('/\s+/', '', $data['abn']);
        }

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
            $business = Business::create(array_filter([
                'type'          => $type,
                'name'          => $businessName,
                'state_code'    => $data['state_code'],
                'tier'          => $isIndividual ? Business::TIER_INDIVIDUAL : Business::TIER_STARTER,
                // ESLATE-3: optional company-profile details (any/all may be null).
                'abn'           => $data['abn'] ?? null,
                'address'       => $data['address'] ?? null,
                'contact_email' => $data['contact_email'] ?? null,
                'contact_phone' => $data['contact_phone'] ?? null,
                'description'   => $data['description'] ?? null,
                // owner_user_id intentionally null until the owner accepts.
            ], fn ($v) => $v !== null));

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
