<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();   // NOT NULL — Shadow Business
            $table->string('status', 30)->default('pending_compliance');    // invited | pending_compliance | active | archived
            $table->text('wwcc_number')->nullable();                        // encrypted via model cast
            $table->date('wwcc_expiry')->nullable();
            $table->string('wwcc_state', 3)->nullable();
            $table->string('compliance_status', 30)->default('pending_compliance');  // compliant | pending_compliance | compliance_hold
            $table->text('bio')->nullable();
            $table->decimal('hourly_rate', 8, 2)->nullable();
            $table->json('qualifications')->nullable();
            $table->json('delivery_modes')->nullable();
            $table->json('year_levels')->nullable();
            $table->timestamps();

            $table->index('business_id');
            $table->index('compliance_status');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutors');
    }
};
