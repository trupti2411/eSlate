<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Student profile fields backing three stories:
 *   ESLATE-10  notes          — general free-form notes (distinct from learning_goals)
 *   ESLATE-5   address        — required on the Add Student form going forward
 *   ESLATE-7   phone, email   — optional student contact captured on the Edit form
 *   ESLATE-7   updated_by     — audit: which admin last edited the record
 *
 * All columns are nullable so existing rows are untouched; the "required"
 * rules for address live in request validation, not the schema.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('learning_goals');
            $table->string('address', 255)->nullable()->after('notes');
            $table->string('phone', 40)->nullable()->after('address');
            $table->string('email', 255)->nullable()->after('phone');
            $table->foreignId('updated_by')->nullable()->after('status')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropConstrainedForeignId('updated_by');
            $table->dropColumn(['notes', 'address', 'phone', 'email']);
        });
    }
};
