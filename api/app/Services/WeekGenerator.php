<?php

namespace App\Services;

use App\Models\AcademicTerm;
use App\Models\Week;
use Carbon\Carbon;

/**
 * Generates Week rows for an AcademicTerm per v3 §6.
 *
 * Rules:
 * - Weeks are Mon–Sun.
 * - Week 1 begins on the term's start_date (whether it's a Monday or mid-week).
 * - If the start_date is mid-week, week 1 is partial; week 2 begins the following Monday.
 * - The final week may also be partial when end_date < the containing Sunday.
 * - Public holidays from the state pack are flagged on the containing week (NOT skipped).
 */
class WeekGenerator
{
    /**
     * @param array<int, array{date: string, name: string}> $publicHolidays
     * @return array<int, Week>
     */
    public function generate(AcademicTerm $term, int $businessId, array $publicHolidays = []): array
    {
        $termStart = Carbon::parse($term->start_date);
        $termEnd   = Carbon::parse($term->end_date);

        $weeks = [];
        $weekNumber = 1;
        $weekStart  = $termStart->copy();

        while ($weekStart->lte($termEnd)) {
            $weekEnd = $this->endOfWeek($weekStart);
            if ($weekEnd->gt($termEnd)) {
                $weekEnd = $termEnd->copy();
            }

            $isPartial = ! ($weekStart->isMonday() && $weekEnd->isSunday());

            $weeks[] = Week::create([
                'business_id'      => $businessId,
                'academic_term_id' => $term->id,
                'week_number'      => $weekNumber,
                'start_date'       => $weekStart->toDateString(),
                'end_date'         => $weekEnd->toDateString(),
                'is_partial'       => $isPartial,
                'start_dow'        => $isPartial ? $weekStart->dayOfWeekIso : null,  // 1=Mon..7=Sun
                'public_holidays'  => $this->holidaysInWindow($publicHolidays, $weekStart, $weekEnd) ?: null,
            ]);

            $weekNumber++;
            // Next week always starts on the Monday after the current week's end.
            $weekStart = $weekEnd->copy()->addDay();
            if (! $weekStart->isMonday()) {
                while (! $weekStart->isMonday()) {
                    $weekStart->addDay();
                }
            }
        }

        return $weeks;
    }

    /** Sunday at the end of the week containing $start. */
    private function endOfWeek(Carbon $start): Carbon
    {
        $d = $start->copy();
        while (! $d->isSunday()) {
            $d->addDay();
        }
        return $d;
    }

    /**
     * @param array<int, array{date: string, name: string}> $holidays
     * @return array<int, array{date: string, name: string}>
     */
    private function holidaysInWindow(array $holidays, Carbon $start, Carbon $end): array
    {
        return array_values(array_filter($holidays, function ($h) use ($start, $end) {
            $d = Carbon::parse($h['date']);
            return $d->gte($start) && $d->lte($end);
        }));
    }
}
