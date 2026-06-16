<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
            $table->unsignedTinyInteger('term_number');
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_manually_edited')->default(false);    // blocks pack-refresh overwrite
            $table->timestamps();

            $table->unique(['academic_year_id', 'term_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_terms');
    }
};
