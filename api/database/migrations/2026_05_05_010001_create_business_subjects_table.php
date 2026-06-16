<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * business_subjects acts as both a toggle table (subject_id set, name NULL)
 * and a custom-subject store (subject_id NULL, name + name_normalized populated).
 * Custom subjects are surfaced to Platform Admin grouped by name_normalized for
 * potential manual promotion to the master subjects list.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->cascadeOnDelete();
            $table->string('name')->nullable();              // set only for custom subjects
            $table->string('name_normalized')->nullable();   // lowercased+trimmed; for Admin grouping
            $table->json('year_levels')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('business_id');
            $table->index('subject_id');
            $table->index('name_normalized');
            // A given master subject is toggled at most once per business.
            // Multiple custom rows (subject_id=NULL) are allowed because NULL ≠ NULL in unique indexes.
            $table->unique(['business_id', 'subject_id'], 'business_master_subject_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_subjects');
    }
};
