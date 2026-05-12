<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_offerings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();    // NOT NULL — Shadow Business
            $table->foreignId('course_template_id')->constrained('course_templates');          // immutable after creation (enforced app-layer)
            $table->foreignId('tutor_id')->constrained('tutors')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->nullable()->constrained('academic_years')->nullOnDelete();
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->string('name', 120);
            $table->date('target_test_date')->nullable();                                       // drives countdown UI
            $table->date('starts_on');
            $table->date('ends_on');
            $table->integer('capacity')->nullable();                                            // soft cap; null = uncapped
            $table->string('status', 20)->default('draft');                                     // draft | active | completed | archived
            $table->text('notes')->nullable();                                                  // tutor-private
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index(['tutor_id', 'status']);
            $table->index('course_template_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_offerings');
    }
};
