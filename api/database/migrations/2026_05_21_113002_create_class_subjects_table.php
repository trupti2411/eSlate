<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pivot: a class can be tagged with multiple subjects.
 *
 * WEMT-style bundled classes hold 4 subjects (Writing, English, Maths, Thinking) — one class,
 * one timeslot, one tutor, multiple subjects taught in rotation. Each class also has a primary
 * subject (mirrored on classes.subject_id for back-compat with code that reads a single subject).
 * Exactly one row per class may have is_primary=true.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['class_id', 'subject_id']);
            $table->index('class_id');
        });

        // Backfill: every existing class gets one class_subjects row using its current subject_id,
        // marked is_primary=true so the post-migration model matches today's reads.
        // Use raw SQL so this works in SQLite + Postgres + MySQL identically.
        \DB::statement(<<<'SQL'
            INSERT INTO class_subjects (class_id, subject_id, is_primary, created_at, updated_at)
            SELECT id, subject_id, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM classes
            WHERE subject_id IS NOT NULL
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('class_subjects');
    }
};
