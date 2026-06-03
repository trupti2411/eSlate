<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_tutors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('tutor_id')->constrained('tutors')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();   // per-subject scope
            $table->boolean('is_primary')->default(false);
            $table->date('started_at');
            $table->date('ended_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'tutor_id'], 'student_tutor_subject_unique');
            $table->index('tutor_id');
            $table->index(['student_id', 'subject_id']);
        });

        // Partial unique: at most one primary tutor per (student, subject).
        // SQLite and Postgres support partial indexes; MySQL does not (would need a workaround there).
        $driver = DB::getDriverName();
        if (in_array($driver, ['sqlite', 'pgsql'], true)) {
            $predicate = $driver === 'sqlite' ? 'is_primary = 1' : 'is_primary = true';
            DB::statement(
                "CREATE UNIQUE INDEX student_tutors_one_primary_per_subject
                 ON student_tutors (student_id, subject_id) WHERE {$predicate}"
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('student_tutors');
    }
};
