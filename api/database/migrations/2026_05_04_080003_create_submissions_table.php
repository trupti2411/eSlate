<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('status', 20)->default('draft');
            $table->string('annotated_pdf_path')->nullable();
            $table->string('annotated_pdf_original_name')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('marked_at')->nullable();
            $table->foreignId('marked_by_tutor_id')->nullable()->constrained('tutors')->nullOnDelete();
            $table->text('mark_comment')->nullable();
            $table->decimal('mark_score', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['assignment_id', 'student_id']);
            $table->index(['student_id', 'status']);
            $table->index(['assignment_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
