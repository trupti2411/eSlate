<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();   // NOT NULL — Shadow Business
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->cascadeOnDelete(); // record-only profiles allowed
            $table->string('first_name', 60);
            $table->string('last_name', 60);
            $table->date('date_of_birth')->nullable();                  // optional; used to suggest year_group
            $table->string('year_group_code', 10);                      // required; user picks directly (NSW K, 1..12)
            $table->string('school', 120)->nullable();
            $table->text('learning_goals')->nullable();
            $table->text('special_needs_notes')->nullable();            // encrypted via model cast
            $table->string('status', 20)->default('active');            // active | inactive | archived
            $table->timestamps();

            $table->index('business_id');
            $table->index('year_group_code');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
