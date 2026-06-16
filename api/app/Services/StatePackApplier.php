<?php

namespace App\Services;

use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use App\Models\Business;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Applies a state pack to a Business (creates academic_years + academic_terms + weeks).
 * Idempotent on (business_id, year) — re-applying for the same pair is a no-op.
 * Per v3 §4.2 / §5.2 / §5.3.
 */
class StatePackApplier
{
    public function __construct(
        private readonly WeekGenerator $weekGenerator,
    ) {}

    public function apply(string $stateCode, int $year, Business $business): AcademicYear
    {
        if (strcasecmp($business->state_code, $stateCode) !== 0) {
            throw new RuntimeException("Business state ({$business->state_code}) does not match requested state ({$stateCode}).");
        }

        $pack = $this->loadPack($stateCode, $year);

        return DB::transaction(function () use ($pack, $year, $business) {
            // Idempotent
            $existing = AcademicYear::where('business_id', $business->id)
                ->where('year', $year)
                ->first();
            if ($existing) {
                return $existing->load('terms');
            }

            $terms = $pack['academic_year']['terms'] ?? [];
            if (empty($terms)) {
                throw new RuntimeException('State pack has no terms.');
            }

            $start = Carbon::parse($terms[0]['start_date']);
            $end   = Carbon::parse(end($terms)['end_date']);
            $packVersion = $pack['pack_version'] ?? null;

            $academicYear = AcademicYear::create([
                'business_id'  => $business->id,
                'state_code'   => $business->state_code,
                'year'         => $year,
                'pack_version' => $packVersion,
                'status'       => AcademicYear::STATUS_DRAFT,
                'start_date'   => $start->toDateString(),
                'end_date'     => $end->toDateString(),
            ]);

            $business->update(['pack_version' => $packVersion]);

            $publicHolidays = $pack['public_holidays'] ?? [];

            foreach ($terms as $i => $t) {
                $term = AcademicTerm::create([
                    'academic_year_id'   => $academicYear->id,
                    'term_number'        => $i + 1,
                    'name'               => $t['name'] ?? 'Term ' . ($i + 1),
                    'start_date'         => $t['start_date'],
                    'end_date'           => $t['end_date'],
                    'is_manually_edited' => false,
                ]);

                $this->weekGenerator->generate($term, $business->id, $publicHolidays);
            }

            return $academicYear->load('terms');
        });
    }

    public function loadPack(string $stateCode, int $year): array
    {
        $path = base_path('resources/academic-calendars/' . strtolower($stateCode) . '-' . $year . '.json');
        if (! file_exists($path)) {
            throw new RuntimeException("No state pack found for {$stateCode} {$year}.");
        }

        $data = json_decode(file_get_contents($path), true);
        if (! is_array($data) || empty($data['academic_year']['terms'])) {
            throw new RuntimeException("Invalid state pack JSON for {$stateCode} {$year}.");
        }

        return $data;
    }
}
