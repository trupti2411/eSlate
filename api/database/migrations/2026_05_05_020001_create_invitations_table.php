<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Single-use signed invitations for Multi-tutor onboarding (v3 §10.3).
 * - kind=business_owner: admin invites company owner; on accept owner sets password & claims business.
 * - kind=tutor: business owner invites a tutor; on accept tutor sets password & captures WWCC inline.
 * Tokens expire in 7 days. accepted_at is set once on acceptance; revoked_at can be set to invalidate.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 20);                                  // business_owner | tutor
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->string('email');
            $table->string('first_name', 60)->nullable();
            $table->string('last_name', 60)->nullable();
            $table->string('token', 80)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->foreignId('accepted_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index('business_id');
            $table->index('email');
            $table->index(['kind', 'business_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
