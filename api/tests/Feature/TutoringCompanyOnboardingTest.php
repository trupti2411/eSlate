<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Invitation;
use App\Models\PolicyAcceptance;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\User;
use Database\Seeders\SubjectSeeder;
use Database\Seeders\YearGroupSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * End-to-end coverage of the tutoring-company onboarding journey, one entity
 * at a time, so a regression in any single step is caught:
 *
 *   1. Admin invites a Tutoring Company           (POST /api/admin/businesses/invite)
 *   2. Owner accepts + sets password              (POST /api/onboarding/accept-business-invite)
 *   3. Owner accepts the three policies           (POST /api/users/accept-terms)            — ESLATE-11
 *   4. Owner edits the company profile            (PATCH /api/businesses/{id})              — ESLATE-3/12
 *   5. Owner invites a tutor                      (POST /api/businesses/{id}/tutors/invite)
 *   6. Tutor accepts + captures WWCC              (POST /api/onboarding/accept-tutor-invite) — ESLATE-WWCC
 *   7. Owner adds a student                       (POST /api/businesses/{id}/students)      — ESLATE-5/7/10
 *   8. Everything is visible on the company        (GET /api/companies/{id}/tutors|students)
 *
 * Plus the guard rails: admin can't create a solo tutor (ESLATE-1), and a WWCC
 * expiring within 30 days is rejected.
 */
class TutoringCompanyOnboardingTest extends TestCase
{
    use RefreshDatabase;

    // Canonical valid Australian Business Number (passes the ATO checksum).
    private const VALID_ABN = '51824753556';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SubjectSeeder::class);
        $this->seed(YearGroupSeeder::class);
    }

    private function admin(): User
    {
        return User::create([
            'name'     => 'Platform Admin',
            'email'    => 'admin-test@eslate.com',
            'password' => 'password',
            'role'     => User::ROLE_ADMIN,
        ]);
    }

    public function test_full_tutoring_company_onboarding_flow(): void
    {
        // 1. Admin invites a Tutoring Company.
        $invite = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/admin/businesses/invite', [
            'name'        => 'Northern Tutoring Academy',
            'owner_email' => 'owner@northern.example',
            'state_code'  => 'NSW',
        ]);
        $invite->assertCreated()
            ->assertJsonStructure(['invitation_id', 'business_id', 'business_type', 'token'])
            ->assertJsonPath('business_type', Business::TYPE_MULTI_TUTOR);

        $businessId = $invite->json('business_id');
        $ownerToken = $invite->json('token');
        $this->assertNotEmpty($ownerToken, 'Invite must return a usable token.');

        // 2. Owner accepts the invite and sets a password.
        $accept = $this->postJson('/api/onboarding/accept-business-invite', [
            'token'      => $ownerToken,
            'password'   => 'sup3rsecret',
            'first_name' => 'Olivia',
            'last_name'  => 'Owner',
        ]);
        $accept->assertCreated()
            ->assertJsonPath('business_id', $businessId)
            ->assertJsonPath('business_type', Business::TYPE_MULTI_TUTOR)
            ->assertJsonPath('user.role', 'company_admin');  // role=business wire-renamed
        $this->assertNotEmpty($accept->json('token'), 'Accept must return an auth token.');

        $owner = User::where('email', 'owner@northern.example')->firstOrFail();
        $this->assertSame(User::ROLE_BUSINESS, $owner->role);
        $this->assertSame($owner->id, Business::find($businessId)->owner_user_id);

        // 3. Policy acceptance gate (ESLATE-11): starts unaccepted, then recorded.
        $this->actingAs($owner, 'sanctum')->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('termsAcceptedAt', null);

        $this->actingAs($owner, 'sanctum')->postJson('/api/users/accept-terms', ['version' => '1.0'])
            ->assertOk()
            ->assertJsonPath('user.termsVersion', '1.0');

        $owner->refresh();
        $this->assertNotNull($owner->terms_accepted_at);
        // One row per policy type recorded against the business.
        $this->assertSame(
            count(PolicyAcceptance::TYPES),
            PolicyAcceptance::where('user_id', $owner->id)->count(),
        );

        // 4. Owner edits the company profile (ESLATE-12) — ABN checksum enforced.
        $this->actingAs($owner, 'sanctum')->patchJson("/api/businesses/{$businessId}", [
            'abn'           => self::VALID_ABN,
            'address'       => '1 George St, Sydney NSW 2000',
            'contact_email' => 'hello@northern.example',
            'contact_phone' => '02 9000 0000',
            'description'   => 'Selective and OC test preparation.',
        ])->assertOk();

        $business = Business::find($businessId);
        $this->assertSame('1 George St, Sydney NSW 2000', $business->address);
        $this->assertSame('hello@northern.example', $business->contact_email);

        // 5. Owner invites a tutor.
        $tutorInvite = $this->actingAs($owner, 'sanctum')->postJson("/api/businesses/{$businessId}/tutors/invite", [
            'email'      => 'tutor@northern.example',
            'first_name' => 'Tara',
            'last_name'  => 'Tutor',
        ]);
        $tutorInvite->assertCreated()->assertJsonStructure(['invitation_id', 'tutor_id', 'token']);
        $tutorToken = $tutorInvite->json('token');

        // 6. Tutor accepts and captures a valid (>30 day) WWCC.
        $tutorAccept = $this->postJson('/api/onboarding/accept-tutor-invite', [
            'token'       => $tutorToken,
            'password'    => 'tutorpass123',
            'wwcc_number' => 'WWC1234567E',
            'wwcc_expiry' => now()->addYear()->toDateString(),
            'wwcc_state'  => 'NSW',
        ]);
        $tutorAccept->assertCreated()
            ->assertJsonPath('tutor.status', Tutor::STATUS_ACTIVE)
            ->assertJsonPath('tutor.compliance_status', Tutor::COMPLIANCE_COMPLIANT);

        // 7. Owner adds a student (ESLATE-5/7/10).
        $student = $this->actingAs($owner, 'sanctum')->postJson("/api/businesses/{$businessId}/students", [
            'first_name'      => 'Sam',
            'last_name'       => 'Student',
            'year_group_code' => 'Y5',
            'address'         => '2 Pitt St, Sydney NSW 2000',
            'school'          => 'Sydney Public School',
            'notes'           => 'Prefers afternoon sessions.',
            'parents'         => [
                ['name' => 'Pat Parent', 'relationship' => 'Mother', 'email' => 'pat@northern.example', 'is_primary' => true],
            ],
        ]);
        $student->assertCreated();

        // 8. Everything is now visible on the company.
        $this->actingAs($owner, 'sanctum')->getJson("/api/companies/{$businessId}/tutors")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.complianceStatus', Tutor::COMPLIANCE_COMPLIANT);

        $this->actingAs($owner, 'sanctum')->getJson("/api/companies/{$businessId}/students")
            ->assertOk()
            ->assertJsonCount(1);

        // Sanity on the persisted graph.
        $this->assertSame(1, Tutor::where('business_id', $businessId)->count());
        $this->assertSame(1, Student::where('business_id', $businessId)->count());
    }

    public function test_admin_cannot_create_solo_tutor_profile(): void
    {
        // ESLATE-1: admins may only create multi_tutor (Tutoring Company) profiles.
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/admin/businesses/invite', [
            'type'        => Business::TYPE_INDIVIDUAL,
            'name'        => 'Solo Sam',
            'owner_email' => 'solo@example.com',
            'state_code'  => 'NSW',
        ])->assertStatus(422)->assertJsonValidationErrors(['type']);
    }

    public function test_business_invite_requires_nsw_state(): void
    {
        // v1 is NSW-only — other states must be rejected at invite time.
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/admin/businesses/invite', [
            'name'        => 'Victoria Tutoring',
            'owner_email' => 'vic@example.com',
            'state_code'  => 'VIC',
        ])->assertStatus(422)->assertJsonValidationErrors(['state_code']);
    }

    public function test_tutor_accept_rejects_wwcc_expiring_within_30_days(): void
    {
        // Stand up an accepted company with an owner.
        $invite = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/admin/businesses/invite', [
            'name' => 'WWCC Co', 'owner_email' => 'wwcc@example.com', 'state_code' => 'NSW',
        ]);
        $businessId = $invite->json('business_id');
        $this->postJson('/api/onboarding/accept-business-invite', [
            'token' => $invite->json('token'), 'password' => 'sup3rsecret',
            'first_name' => 'Wendy', 'last_name' => 'Owner',
        ])->assertCreated();
        $owner = User::where('email', 'wwcc@example.com')->firstOrFail();

        $tutorInvite = $this->actingAs($owner, 'sanctum')->postJson("/api/businesses/{$businessId}/tutors/invite", [
            'email' => 'late@example.com', 'first_name' => 'Late', 'last_name' => 'Tutor',
        ]);

        // Expiry only 10 days out → rejected.
        $this->postJson('/api/onboarding/accept-tutor-invite', [
            'token'       => $tutorInvite->json('token'),
            'password'    => 'tutorpass123',
            'wwcc_number' => 'WWC0000001E',
            'wwcc_expiry' => now()->addDays(10)->toDateString(),
            'wwcc_state'  => 'NSW',
        ])->assertStatus(422)->assertJsonValidationErrors(['wwcc_expiry']);
    }
}
