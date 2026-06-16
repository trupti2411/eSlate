<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the fields the /admin/companies/:id "Edit details" / "Activate"
 * UI has been asking for since the React dashboards landed. The
 * frontend has shipped a Business edit dialog with description /
 * contact_email / contact_phone / address inputs and a status
 * toggle, but the `businesses` table never had backing columns —
 * /api/companies/{id} stubbed them as empty strings and the toggle
 * 404'd. This migration closes that gap.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->text('description')->nullable()->after('legal_name');
            $table->string('contact_email')->nullable()->after('description');
            $table->string('contact_phone', 40)->nullable()->after('contact_email');
            $table->string('address')->nullable()->after('contact_phone');
            $table->boolean('is_active')->default(true)->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn(['description', 'contact_email', 'contact_phone', 'address', 'is_active']);
        });
    }
};
