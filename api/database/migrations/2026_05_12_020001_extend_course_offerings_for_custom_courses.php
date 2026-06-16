<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 4: support custom (non-template-backed) course offerings.
 * - course_template_id becomes nullable — an offering with null template is a custom course
 *   created by the tutor/owner that doesn't map to a platform-seeded test-prep programme.
 * - description column for free-text on custom offerings (templates carry their own).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_offerings', function (Blueprint $table) {
            $table->foreignId('course_template_id')->nullable()->change();
            $table->text('description')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('course_offerings', function (Blueprint $table) {
            $table->dropColumn('description');
            // Note: reverting course_template_id to NOT NULL would fail if any custom
            // (template-less) offerings exist. Manual cleanup required in that case.
            $table->foreignId('course_template_id')->nullable(false)->change();
        });
    }
};
