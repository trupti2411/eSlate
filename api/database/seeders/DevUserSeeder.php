<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Dev-only seeded accounts for local login. Password is "password".
 *
 *   admin@eslate.com — the single platform admin. All other accounts
 *   (owner, tutor, solo) are created through the admin invite flow at
 *   /admin/companies so each test exercises the real onboarding path.
 */
class DevUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        User::updateOrCreate(
            ['email' => 'admin@eslate.com'],
            ['name' => 'eSlate Admin', 'password' => $password, 'role' => User::ROLE_ADMIN]
        );
    }
}
