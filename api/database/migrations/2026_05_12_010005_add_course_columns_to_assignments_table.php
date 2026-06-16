<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            // Course attachment (alternative to class_id).
            // Per spec §4.5: exactly one of {class_id, course_offering_id} must be non-null —
            // this is enforced at the application layer (AssignmentController) since SQLite's
            // ALTER TABLE doesn't support adding a CHECK constraint to an existing table.
            $table->foreignId('course_offering_id')->nullable()->after('class_id')->constrained('course_offerings')->nullOnDelete();
            $table->foreignId('course_component_id')->nullable()->after('course_offering_id')->constrained('course_components')->nullOnDelete();

            $table->index(['course_offering_id', 'status']);
            $table->index('course_component_id');
        });
    }

    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['course_offering_id']);
            $table->dropForeign(['course_component_id']);
            $table->dropIndex(['course_offering_id', 'status']);
            $table->dropIndex(['course_component_id']);
            $table->dropColumn(['course_offering_id', 'course_component_id']);
        });
    }
};
