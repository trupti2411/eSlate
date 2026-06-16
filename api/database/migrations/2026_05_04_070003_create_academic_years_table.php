<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();   // NOT NULL — Shadow Business
            $table->string('state_code', 3);                                                    // inherited from business; locked
            $table->unsignedSmallInteger('year');
            $table->string('pack_version', 20)->nullable();
            $table->string('status', 20)->default('draft');                                    // draft | active | archived
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();

            $table->unique(['business_id', 'year']);
            $table->index('business_id');
            $table->index('state_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_years');
    }
};
