<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('relationship', 40)->nullable();  // Mother, Father, Guardian, Self, Step-mother, etc.
            $table->string('email', 255)->nullable();
            $table->string('phone', 40)->nullable();
            $table->boolean('is_primary')->default(false);   // primary contact for comms / invoicing
            $table->timestamps();

            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_parents');
    }
};
