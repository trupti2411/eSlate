<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Courses parent — Step 1.
 *
 * Each course offering becomes a leaf node in a course's catalogue tree:
 *   course → year_group → subject → (optional level)
 *
 * All four columns are nullable so existing offerings keep working unchanged.
 * Owners adopt the catalogue by setting these on new offerings.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_offerings', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('business_id')->constrained('courses')->nullOnDelete();
            $table->foreignId('year_group_id')->nullable()->after('course_id')->constrained('year_groups')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->after('year_group_id')->constrained('subjects')->nullOnDelete();
            $table->string('level', 30)->nullable()->after('subject_id');  // beginner | intermediate | advanced | (free-form)

            $table->index(['course_id', 'year_group_id']);
        });
    }

    public function down(): void
    {
        Schema::table('course_offerings', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropForeign(['year_group_id']);
            $table->dropForeign(['subject_id']);
            $table->dropIndex(['course_id', 'year_group_id']);
            $table->dropColumn(['course_id', 'year_group_id', 'subject_id', 'level']);
        });
    }
};
