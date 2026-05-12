<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offering_enrolments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();          // NOT NULL — Shadow Business
            $table->foreignId('course_offering_id')->constrained('course_offerings')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('status', 20);                                                            // active | withdrawn | completed
            $table->timestamp('enrolled_at');
            $table->timestamp('withdrew_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index(['course_offering_id', 'status']);
            $table->index('student_id');
        });

        // Partial unique: at most one active enrolment per (offering, student).
        // Historical withdrawn/completed rows are retained so we can audit cohort moves.
        // (Supported on SQLite and Postgres; MySQL would need a workaround per spec §8.1.)
        \DB::statement(
            'CREATE UNIQUE INDEX offering_enrolments_one_active_per_student '
            . 'ON offering_enrolments (course_offering_id, student_id) '
            . "WHERE status = 'active'"
        );
    }

    public function down(): void
    {
        \DB::statement('DROP INDEX IF EXISTS offering_enrolments_one_active_per_student');
        Schema::dropIfExists('offering_enrolments');
    }
};
