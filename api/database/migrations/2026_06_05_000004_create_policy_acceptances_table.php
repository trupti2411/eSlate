<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ESLATE-11: per-policy acceptance audit trail. One row per (user, policy)
 * acceptance event, with the version that was accepted so future policy
 * updates can prompt re-acceptance without losing the historical record.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('policy_acceptances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('business_id')->nullable()->constrained('businesses')->nullOnDelete();
            $table->string('policy_type', 40);     // terms_of_service | privacy_policy | user_agreement
            $table->string('policy_version', 20);
            $table->timestamp('accepted_at');
            $table->timestamps();

            $table->index(['user_id', 'policy_type']);
            $table->index('business_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('policy_acceptances');
    }
};
