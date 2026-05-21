<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pivot: a Course (e.g. WEMT) declares which subjects it serves.
 * When a class is linked to that course, its subjects must be a subset of the course's subjects.
 * For WEMT-style bundles, this is Reading + Maths + Thinking Skills + Writing (+ optionally English).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['course_id', 'subject_id']);
            $table->index('course_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_subjects');
    }
};
