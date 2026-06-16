<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_template_id')->constrained('course_templates')->cascadeOnDelete();
            $table->string('code', 40);                                  // reading, maths_reasoning, thinking_skills, writing, general, etc.
            $table->string('name', 80);
            $table->decimal('weight_pct', 5, 2)->nullable();             // null for non-test-aligned
            $table->integer('duration_minutes')->nullable();
            $table->integer('question_count')->nullable();
            $table->string('question_format', 30);                       // multiple_choice | multi_part_mcq | cloze | free_response_writing | mixed
            $table->integer('sort_order');
            $table->string('pack_version', 20);
            $table->timestamps();

            $table->unique(['course_template_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_components');
    }
};
