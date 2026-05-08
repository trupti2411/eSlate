<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20);                            // individual | multi_tutor
            $table->string('name');
            $table->string('legal_name')->nullable();
            $table->string('logo')->nullable();
            $table->string('abn', 20)->nullable();
            $table->string('state_code', 3);                       // 'NSW' in v1
            $table->string('timezone', 50)->default('Australia/Sydney');
            $table->string('currency', 3)->default('AUD');
            $table->string('tier', 20)->default('individual');     // individual | starter | pro | enterprise
            $table->string('pack_version', 20)->nullable();
            $table->foreignId('owner_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('state_code');
            $table->index('type');
            $table->index('owner_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
