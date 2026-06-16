<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('state_code', 3);                  // global master list scoped per state
            $table->string('code', 30);
            $table->string('name');
            $table->json('year_levels')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['state_code', 'code']);
            $table->index('state_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
