<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('year_groups', function (Blueprint $table) {
            $table->id();
            $table->string('state_code', 3);
            $table->unsignedTinyInteger('order');
            $table->string('label');
            $table->string('code', 10);
            $table->timestamps();

            $table->unique(['state_code', 'order']);
            $table->unique(['state_code', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('year_groups');
    }
};
