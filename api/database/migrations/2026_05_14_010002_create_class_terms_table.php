<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Class collapse — Step 1.
 *
 * Many-to-many pivot between classes and academic_terms.
 * A class always runs within one or more terms (no free-form date ranges).
 * Picking terms drives classes.starts_on / classes.ends_on at write time.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('academic_term_id')->constrained('academic_terms')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['class_id', 'academic_term_id']);
            $table->index('academic_term_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_terms');
    }
};
