<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ESLATE-12: audit which admin last edited the company profile.
 * (`updated_at` already exists via timestamps; this records the who.)
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->foreignId('updated_by')->nullable()->after('is_active')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('updated_by');
        });
    }
};
