<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Dev-only seeded accounts for local login. Password is "password" for all.
 *
 *   admin@eslate.local         — platform admin
 *   solo@eslate.local          — solo tutor (Individual; hidden business auto-created)
 *   owner@eslate.local         — multi-tutor business owner
 *   tutor@eslate.local         — invited tutor inside the multi-tutor business
 */
class DevUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        // Platform admin (no business)
        User::updateOrCreate(
            ['email' => 'admin@eslate.local'],
            ['name' => 'Admin Test', 'password' => $password, 'role' => User::ROLE_ADMIN]
        );

        // Multi-tutor business + owner
        $ownerUser = User::updateOrCreate(
            ['email' => 'owner@eslate.local'],
            ['name' => 'Owner Test', 'password' => $password, 'role' => User::ROLE_BUSINESS]
        );

        $multiBusiness = Business::updateOrCreate(
            ['name' => 'Acme Tutoring (Dev)'],
            [
                'type' => Business::TYPE_MULTI_TUTOR,
                'state_code' => 'NSW',
                'tier' => Business::TIER_STARTER,
                'owner_user_id' => $ownerUser->id,
            ]
        );

        // Invited tutor inside the multi-tutor business
        $tutorUser = User::updateOrCreate(
            ['email' => 'tutor@eslate.local'],
            ['name' => 'Tutor Test', 'password' => $password, 'role' => User::ROLE_TUTOR]
        );

        Tutor::updateOrCreate(
            ['user_id' => $tutorUser->id],
            [
                'business_id' => $multiBusiness->id,
                'status' => Tutor::STATUS_PENDING_COMPLIANCE,
                'compliance_status' => Tutor::COMPLIANCE_PENDING,
            ]
        );

        // Solo tutor — Individual business is hidden in the UI but real in the DB
        $soloUser = User::updateOrCreate(
            ['email' => 'solo@eslate.local'],
            ['name' => 'Solo Tutor', 'password' => $password, 'role' => User::ROLE_TUTOR]
        );

        $soloBusiness = Business::updateOrCreate(
            ['owner_user_id' => $soloUser->id],
            [
                'type' => Business::TYPE_INDIVIDUAL,
                'name' => 'Solo Tutor Tutoring',
                'state_code' => 'NSW',
                'tier' => Business::TIER_INDIVIDUAL,
            ]
        );

        Tutor::updateOrCreate(
            ['user_id' => $soloUser->id],
            [
                'business_id' => $soloBusiness->id,
                'status' => Tutor::STATUS_PENDING_COMPLIANCE,
                'compliance_status' => Tutor::COMPLIANCE_PENDING,
            ]
        );
    }
}
