<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 4: bridge classes ↔ course offerings.
 *
 * A class can optionally belong to a course offering. Standard year-level classes
 * (e.g. "Year 7 Maths") have null course_offering_id; test-prep classes (e.g.
 * "Year 4 OC Saturday cohort") point at their owning offering.
 *
 * Loose link — assignment XOR is still enforced at the application layer
 * (an assignment belongs to a class OR an offering, never both).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->foreignId('course_offering_id')
                ->nullable()
                ->after('tutor_id')
                ->constrained('course_offerings')
                ->nullOnDelete();

            $table->index('course_offering_id');
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign(['course_offering_id']);
            $table->dropIndex(['course_offering_id']);
            $table->dropColumn('course_offering_id');
        });
    }
};
