<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();   // NOT NULL — Shadow Business
            $table->foreignId('tutor_id')->constrained('tutors')->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('classes')->cascadeOnDelete();
            $table->foreignId('week_id')->nullable()->constrained('weeks')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('pdf_path');
            $table->string('pdf_original_name');
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->index(['tutor_id', 'status']);
            $table->index(['class_id', 'status']);
            $table->index('week_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
