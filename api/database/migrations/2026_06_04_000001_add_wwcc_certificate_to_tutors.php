<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds private-disk path for the tutor's WWCC certificate scan.
 *
 * Files live under storage/app/private/wwcc/{tutor_id}/{uuid}.{ext} and are
 * served only via a Laravel-auth-gated endpoint (never directly).
 * Path string is fine in plain text — the file ACL is what matters.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->string('wwcc_certificate_path')->nullable()->after('wwcc_state');
            $table->string('wwcc_certificate_original_name')->nullable()->after('wwcc_certificate_path');
            $table->timestamp('wwcc_certificate_uploaded_at')->nullable()->after('wwcc_certificate_original_name');
        });
    }

    public function down(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->dropColumn(['wwcc_certificate_path', 'wwcc_certificate_original_name', 'wwcc_certificate_uploaded_at']);
        });
    }
};
