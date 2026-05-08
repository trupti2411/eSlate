<?php

namespace App\Models;

use App\Services\WeekGenerator;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicTerm extends Model
{
    use HasFactory;

    protected $fillable = ['academic_year_id', 'term_number', 'name', 'start_date', 'end_date', 'is_manually_edited'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function weeks(): HasMany
    {
        return $this->hasMany(Week::class)->orderBy('week_number');
    }

    /**
     * Rebuild this term's weeks for its current start/end dates, preserving any
     * public holidays already attached to existing weeks. Holidays are re-bucketed
     * into the new week ranges by date — anything outside the new term boundaries
     * is dropped (calendar facts, not term notes).
     */
    public function regenerateWeeks(): void
    {
        // 1. Aggregate holidays from existing weeks before we delete them.
        $existing = $this->weeks()->get();
        $publicHolidays = $this->mergeDateEntries($existing->pluck('public_holidays')->all());

        // 2. Wipe and regenerate using the same service that the state pack uses,
        //    so partial-week + start_dow + holiday-bucketing rules stay consistent.
        $this->weeks()->delete();

        $businessId = $this->academicYear->business_id;

        app(WeekGenerator::class)->generate($this, $businessId, $publicHolidays);
    }

    /**
     * Flatten a list of nullable holiday arrays from each week, deduped by date so
     * we don't carry forward duplicates after multiple edits.
     *
     * @param  array<int, mixed>  $perWeek
     * @return array<int, array{date: string, name?: string}>
     */
    private function mergeDateEntries(array $perWeek): array
    {
        $byDate = [];
        foreach ($perWeek as $list) {
            if (! is_array($list)) continue;
            foreach ($list as $entry) {
                if (! is_array($entry) || empty($entry['date'])) continue;
                $byDate[$entry['date']] = $entry; // last write wins on dup dates
            }
        }
        return array_values($byDate);
    }
}
