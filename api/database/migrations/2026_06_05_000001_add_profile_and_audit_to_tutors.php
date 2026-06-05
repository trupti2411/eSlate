<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ESLATE-13 — admin view/edit of a tutor profile.
 *
 * Tutors keep name/email on their User row; phone + address had no home, and
 * there was no audit column. Mirrors the students table (ESLATE-7) so the
 * "Last updated by … on …" footer works the same way.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->string('phone', 40)->nullable()->after('bio');
            $table->string('address', 255)->nullable()->after('phone');
            $table->foreignId('updated_by')->nullable()->after('address')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->dropConstrainedForeignId('updated_by');
            $table->dropColumn(['phone', 'address']);
        });
    }
};
