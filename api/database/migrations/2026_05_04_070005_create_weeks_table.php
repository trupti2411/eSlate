<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weeks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->foreignId('academic_term_id')->constrained('academic_terms')->cascadeOnDelete();
            $table->unsignedTinyInteger('week_number');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_partial')->default(false);
            $table->unsignedTinyInteger('start_dow')->nullable();    // 1=Mon..7=Sun (only set when is_partial=true)
            $table->json('public_holidays')->nullable();              // [{date, name}]
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['academic_term_id', 'week_number']);
            $table->index('business_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weeks');
    }
};
