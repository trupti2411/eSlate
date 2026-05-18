<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Class scheduling: when does the class meet each week?
 *
 * Recurring slot on the class itself — no per-session rows yet. Combined
 * with the class's terms, this gives a complete weekly timetable for
 * conflict detection and the timetable view.
 *
 * All fields nullable so existing classes keep working until owners set
 * them. Conflict detection in ClassroomController only fires when both
 * day-of-week AND start_time are set, plus tutor_id is known.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->unsignedTinyInteger('schedule_day_of_week')->nullable()->after('level');  // 1=Mon..7=Sun (ISO)
            $table->time('schedule_start_time')->nullable()->after('schedule_day_of_week');
            $table->time('schedule_end_time')->nullable()->after('schedule_start_time');
            $table->string('location', 120)->nullable()->after('schedule_end_time');          // "Bondi Room A", "Online", etc.

            $table->index(['schedule_day_of_week', 'schedule_start_time']);
            $table->index(['tutor_id', 'schedule_day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropIndex(['schedule_day_of_week', 'schedule_start_time']);
            $table->dropIndex(['tutor_id', 'schedule_day_of_week']);
            $table->dropColumn(['schedule_day_of_week', 'schedule_start_time', 'schedule_end_time', 'location']);
        });
    }
};
