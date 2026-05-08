<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken($data['device_name'] ?? 'api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->shapeUser($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($this->shapeUser($request->user()));
    }

    /**
     * Self-registration. v3 §5.3 Path B (Individual) is the canonical self-serve path;
     * we also allow Multi-tutor owners to self-register (deviation from v3 §5.2 which says
     * Multi-tutor is admin-invite-only — relaxed for v1 user demand).
     * Country=AU + state=NSW gated; international blocked; non-NSW AU → /api/waitlist.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'first_name'    => ['required', 'string', 'max:60'],
            'last_name'     => ['required', 'string', 'max:60'],
            'email'         => ['required', 'email', 'unique:users,email'],
            'password'      => ['required', 'string', 'min:8'],
            'country'       => ['required', Rule::in(['AU'])],
            'state'         => ['required', Rule::in(['NSW'])],
            'suburb'        => ['nullable', 'string', 'max:120'],
            'postcode'      => ['nullable', 'string', 'max:10'],
            'account_type'  => ['nullable', Rule::in([Business::TYPE_INDIVIDUAL, Business::TYPE_MULTI_TUTOR])],
            'business_name' => ['nullable', 'string', 'min:2', 'max:255', 'required_if:account_type,' . Business::TYPE_MULTI_TUTOR],
        ]);

        $accountType = $data['account_type'] ?? Business::TYPE_INDIVIDUAL;
        $isCompany = $accountType === Business::TYPE_MULTI_TUTOR;

        return DB::transaction(function () use ($data, $accountType, $isCompany) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => $data['password'],   // hashed via cast
                'role'     => $isCompany ? User::ROLE_BUSINESS : User::ROLE_TUTOR,
            ]);

            $business = Business::create([
                'type'          => $accountType,
                'name'          => $isCompany
                    ? $data['business_name']
                    : trim($data['first_name'] . ' ' . $data['last_name']) . ' Tutoring',
                'state_code'    => $data['state'],
                'tier'          => $isCompany ? Business::TIER_STARTER : Business::TIER_INDIVIDUAL,
                'owner_user_id' => $user->id,
            ]);

            // Per v3 §5.4: Owner is always a tutor for Individual; optional for Multi-tutor.
            // For self-serve company signup we don't create a tutor row for the owner —
            // they'll invite tutors separately.
            if (! $isCompany) {
                Tutor::create([
                    'user_id'           => $user->id,
                    'business_id'       => $business->id,
                    'status'            => Tutor::STATUS_PENDING_COMPLIANCE,
                    'compliance_status' => Tutor::COMPLIANCE_PENDING,
                ]);
            }

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user'  => $this->shapeUser($user),
            ], 201);
        });
    }

    private function shapeUser(User $user): array
    {
        $name = (string) ($user->name ?? '');
        $space = strpos($name, ' ');
        $firstName = $space === false ? $name : substr($name, 0, $space);
        $lastName = $space === false ? '' : trim(substr($name, $space + 1));

        return [
            'id' => $user->id,
            'email' => $user->email,
            'name' => $name,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'profileImageUrl' => null,
            'role' => $user->role === 'business' ? 'company_admin' : $user->role,
        ];
    }
}
