<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds annotation_data so the PDFAnnotatorPage can auto-save mid-work.
 * Final submission still flattens to annotated_pdf_path; this column
 * is the in-progress vector store for the draft state (e-ink devices
 * lose context easily, students need their work to survive a sleep).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            // SQLite-compatible; on Postgres this would be jsonb. Treated as opaque JSON string.
            $table->longText('annotation_data')->nullable()->after('annotated_pdf_original_name');
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn('annotation_data');
        });
    }
};
