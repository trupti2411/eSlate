<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Captures non-NSW Australian signup attempts. No users / businesses / tutors row
 * is created when someone lands here — they are notified when their state launches.
 * International (non-AU) signups are blocked at the country gate and NOT recorded.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waitlist', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('first_name', 60)->nullable();
            $table->string('last_name', 60)->nullable();
            $table->string('country', 2)->default('AU');
            $table->string('state', 3);                              // VIC | QLD | SA | WA | TAS | ACT | NT
            $table->string('intended_role', 30)->nullable();         // individual_tutor | multi_tutor_owner | other
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->index('state');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist');
    }
};
