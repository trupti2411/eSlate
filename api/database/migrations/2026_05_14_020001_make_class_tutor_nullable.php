<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Owner can now create a class without assigning a tutor upfront —
 * tutor can be assigned later from the class detail page.
 *
 * Existing foreign key to tutors stays; we just relax NOT NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->foreignId('tutor_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->foreignId('tutor_id')->nullable(false)->change();
        });
    }
};
