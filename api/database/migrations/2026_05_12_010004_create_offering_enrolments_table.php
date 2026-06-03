<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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

        // Partial unique index: at most one active enrolment per (offering, student).
        // Historical withdrawn/completed rows are retained so we can audit cohort moves.
        //
        // MySQL/MariaDB don't support partial indexes (WHERE clause in CREATE INDEX).
        // On those drivers we fall back to a non-unique composite index; uniqueness of
        // ACTIVE enrolments is enforced at the application layer in
        // OfferingEnrolmentController::store via a defensive check before insert.
        $driver = DB::connection()->getDriverName();
        if (in_array($driver, ['pgsql', 'sqlite'], true)) {
            DB::statement(
                'CREATE UNIQUE INDEX offering_enrolments_one_active_per_student '
                . 'ON offering_enrolments (course_offering_id, student_id) '
                . "WHERE status = 'active'"
            );
        }
        // mysql / mariadb path: the (course_offering_id, status) composite index
        // declared in the Schema::create above is sufficient as a lookup index.
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        if (in_array($driver, ['pgsql', 'sqlite'], true)) {
            DB::statement('DROP INDEX IF EXISTS offering_enrolments_one_active_per_student');
        }
        Schema::dropIfExists('offering_enrolments');
    }
};
