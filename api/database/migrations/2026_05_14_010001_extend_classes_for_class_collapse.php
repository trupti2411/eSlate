<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Class collapse — Step 1.
 *
 * Class becomes the single runnable unit (Course → Class), absorbing
 * the fields that used to live on course_offerings. All new fields are
 * nullable to keep existing classes valid.
 *
 * Adds:
 * - course_id        — direct FK to courses (the catalogue parent). Replaces
 *                      the indirection via course_offering_id for new work.
 *                      course_offering_id is kept for back-compat with rows
 *                      created during the offering era; new code only uses course_id.
 * - starts_on / ends_on  — denormalised; derived from picked terms at write time
 * - capacity         — soft cap on roster size
 * - status           — draft | active | completed | archived (default draft)
 * - description      — free text shown to students/parents
 * - level            — beginner | intermediate | advanced | (free-form)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('course_offering_id')->constrained('courses')->nullOnDelete();
            $table->date('starts_on')->nullable()->after('name');
            $table->date('ends_on')->nullable()->after('starts_on');
            $table->integer('capacity')->nullable()->after('ends_on');
            $table->string('status', 20)->default('draft')->after('capacity');
            $table->text('description')->nullable()->after('status');
            $table->string('level', 30)->nullable()->after('description');

            $table->index(['course_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropIndex(['course_id', 'status']);
            $table->dropIndex(['status']);
            $table->dropColumn(['course_id', 'starts_on', 'ends_on', 'capacity', 'status', 'description', 'level']);
        });
    }
};
