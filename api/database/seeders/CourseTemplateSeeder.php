<?php

namespace Database\Seeders;

use App\Models\CourseComponent;
use App\Models\CourseTemplate;
use Illuminate\Database\Seeder;

/**
 * Seeds the NSW test-prep course catalogue per spec v1 section 5.
 *
 * 36 templates total:
 * - 13 Foundations (K, Y1..Y12)
 * - 13 WEMT/Theory (K, Y1..Y12)
 * - 10 Mock Tests (Y3..Y12)
 *
 * Test alignments seed component breakdowns:
 * - Y4 → OC (3 sections, no writing)
 * - Y6 → Selective (4 sections incl. writing)
 * - Y3/Y5/Y7/Y9 → NAPLAN (4 sections)
 * - everything else → single "General" component
 */
class CourseTemplateSeeder extends Seeder
{
    private const PACK_VERSION = '1.0.0';
    private const STATE = 'NSW';

    private const KIND_PRIORITY = [
        CourseTemplate::KIND_FOUNDATIONS => 0,
        CourseTemplate::KIND_THEORY      => 1,
        CourseTemplate::KIND_MOCK_TESTS  => 2,
    ];

    public function run(): void
    {
        $years = ['K', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10', 'Y11', 'Y12'];

        foreach ($years as $yearOrder => $yearCode) {
            // Foundations: every year level
            $this->seedTemplate(
                year: $yearCode,
                yearOrder: $yearOrder,
                kind: CourseTemplate::KIND_FOUNDATIONS,
                alignment: null,
            );

            // WEMT / Theory: every year level, alignment varies
            $wemtAlignment = $this->wemtAlignmentFor($yearCode);
            $this->seedTemplate(
                year: $yearCode,
                yearOrder: $yearOrder,
                kind: CourseTemplate::KIND_THEORY,
                alignment: $wemtAlignment,
            );

            // Mock Tests: Y3..Y12 only
            if (in_array($yearCode, ['Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10', 'Y11', 'Y12'], true)) {
                $mockAlignment = $this->mockTestAlignmentFor($yearCode);
                $this->seedTemplate(
                    year: $yearCode,
                    yearOrder: $yearOrder,
                    kind: CourseTemplate::KIND_MOCK_TESTS,
                    alignment: $mockAlignment,
                );
            }
        }
    }

    private function seedTemplate(string $year, int $yearOrder, string $kind, ?string $alignment): void
    {
        $code = $this->codeFor($year, $kind, $alignment);

        $template = CourseTemplate::updateOrCreate(
            ['code' => $code],
            [
                'state_code'      => self::STATE,
                'year_group_code' => $year,
                'kind'            => $kind,
                'test_alignment'  => $alignment,
                'name'            => $this->nameFor($year, $kind, $alignment),
                'short_name'      => $this->shortNameFor($year, $kind, $alignment),
                'description'     => $this->descriptionFor($year, $kind, $alignment),
                'sort_order'      => $yearOrder * 10 + self::KIND_PRIORITY[$kind],
                'pack_version'    => self::PACK_VERSION,
                'is_active'       => true,
            ]
        );

        // Wipe and reseed components so re-running the seeder is idempotent.
        $template->components()->delete();
        foreach ($this->componentsFor($alignment) as $i => $component) {
            CourseComponent::create([
                'course_template_id' => $template->id,
                'code'               => $component['code'],
                'name'               => $component['name'],
                'weight_pct'         => $component['weight_pct'] ?? null,
                'duration_minutes'   => $component['duration_minutes'] ?? null,
                'question_count'     => $component['question_count'] ?? null,
                'question_format'    => $component['question_format'],
                'sort_order'         => $i,
                'pack_version'       => self::PACK_VERSION,
            ]);
        }
    }

    private function wemtAlignmentFor(string $year): ?string
    {
        return match ($year) {
            'Y3' => CourseTemplate::ALIGN_NAPLAN_Y3,
            'Y4' => CourseTemplate::ALIGN_OC,
            'Y5' => CourseTemplate::ALIGN_NAPLAN_Y5,
            'Y6' => CourseTemplate::ALIGN_SELECTIVE,
            'Y7' => CourseTemplate::ALIGN_NAPLAN_Y7,
            'Y9' => CourseTemplate::ALIGN_NAPLAN_Y9,
            default => null,
        };
    }

    private function mockTestAlignmentFor(string $year): ?string
    {
        // Y8/Y10/Y11/Y12 mock tests are general (per spec 5.1)
        return $this->wemtAlignmentFor($year);
    }

    private function codeFor(string $year, string $kind, ?string $alignment): string
    {
        // Convert year code to spec format: K → yk, Y4 → y4
        $yearSlug = $year === 'K' ? 'yk' : strtolower($year);
        $kindSlug = match ($kind) {
            CourseTemplate::KIND_FOUNDATIONS => 'foundations',
            CourseTemplate::KIND_THEORY      => 'wemt',
            CourseTemplate::KIND_MOCK_TESTS  => 'mock_tests',
        };
        return "nsw_{$yearSlug}_{$kindSlug}";
    }

    private function nameFor(string $year, string $kind, ?string $alignment): string
    {
        $yearLabel = $year === 'K' ? 'Kindergarten' : "Year " . substr($year, 1);
        $alignLabel = $this->alignmentLabel($alignment);

        return match ($kind) {
            CourseTemplate::KIND_FOUNDATIONS => "{$yearLabel} Foundations",
            CourseTemplate::KIND_THEORY      => $alignLabel
                ? "{$yearLabel} {$alignLabel} WEMT (Theory)"
                : "{$yearLabel} WEMT (Theory)",
            CourseTemplate::KIND_MOCK_TESTS  => match ($alignment) {
                CourseTemplate::ALIGN_OC        => "{$yearLabel} OCTT (OC Mock Tests)",
                CourseTemplate::ALIGN_SELECTIVE => "{$yearLabel} STTC (Selective Mock Tests)",
                CourseTemplate::ALIGN_NAPLAN_Y3,
                CourseTemplate::ALIGN_NAPLAN_Y5,
                CourseTemplate::ALIGN_NAPLAN_Y7,
                CourseTemplate::ALIGN_NAPLAN_Y9 => "{$yearLabel} NAPLAN Mock Tests",
                default                          => "{$yearLabel} Mock Tests",
            },
        };
    }

    private function shortNameFor(string $year, string $kind, ?string $alignment): string
    {
        $yearShort = $year === 'K' ? 'K' : $year;     // Y4 stays as Y4
        $alignShort = match ($alignment) {
            CourseTemplate::ALIGN_OC        => 'OC',
            CourseTemplate::ALIGN_SELECTIVE => 'Selective',
            CourseTemplate::ALIGN_NAPLAN_Y3,
            CourseTemplate::ALIGN_NAPLAN_Y5,
            CourseTemplate::ALIGN_NAPLAN_Y7,
            CourseTemplate::ALIGN_NAPLAN_Y9 => 'NAPLAN',
            default                          => null,
        };

        return match ($kind) {
            CourseTemplate::KIND_FOUNDATIONS => "{$yearShort} Foundations",
            CourseTemplate::KIND_THEORY      => $alignShort
                ? "{$yearShort} {$alignShort} WEMT"
                : "{$yearShort} WEMT",
            CourseTemplate::KIND_MOCK_TESTS  => match ($alignment) {
                CourseTemplate::ALIGN_OC        => "{$yearShort} OCTT",
                CourseTemplate::ALIGN_SELECTIVE => "{$yearShort} STTC",
                CourseTemplate::ALIGN_NAPLAN_Y3,
                CourseTemplate::ALIGN_NAPLAN_Y5,
                CourseTemplate::ALIGN_NAPLAN_Y7,
                CourseTemplate::ALIGN_NAPLAN_Y9 => "{$yearShort} NAPLAN Mock",
                default                          => "{$yearShort} Mocks",
            },
        };
    }

    private function descriptionFor(string $year, string $kind, ?string $alignment): string
    {
        $yearLabel = $year === 'K' ? 'Kindergarten' : 'Year ' . substr($year, 1);
        return match ($kind) {
            CourseTemplate::KIND_FOUNDATIONS => "Foundational skills for {$yearLabel} students. Year-appropriate content not tied to any specific test.",
            CourseTemplate::KIND_THEORY      => match ($alignment) {
                CourseTemplate::ALIGN_OC        => 'Theory and practice for the NSW Opportunity Class Placement Test. Three sections: Reading, Mathematical Reasoning, Thinking Skills.',
                CourseTemplate::ALIGN_SELECTIVE => 'Theory and practice for the NSW Selective High School Placement Test. Four sections: Reading, Mathematical Reasoning, Thinking Skills, Writing.',
                CourseTemplate::ALIGN_NAPLAN_Y3,
                CourseTemplate::ALIGN_NAPLAN_Y5,
                CourseTemplate::ALIGN_NAPLAN_Y7,
                CourseTemplate::ALIGN_NAPLAN_Y9 => "Theory and practice for the {$yearLabel} NAPLAN assessment. Four domains: Reading, Writing, Conventions of Language, Numeracy.",
                default                          => "Weekly theory for {$yearLabel} students. General year-level content.",
            },
            CourseTemplate::KIND_MOCK_TESTS  => match ($alignment) {
                CourseTemplate::ALIGN_OC        => 'Mock OC Placement Tests in the same section structure as the real test.',
                CourseTemplate::ALIGN_SELECTIVE => 'Mock Selective High School Placement Tests in the same section structure as the real test.',
                CourseTemplate::ALIGN_NAPLAN_Y3,
                CourseTemplate::ALIGN_NAPLAN_Y5,
                CourseTemplate::ALIGN_NAPLAN_Y7,
                CourseTemplate::ALIGN_NAPLAN_Y9 => "Mock NAPLAN tests in the four NAPLAN domains for {$yearLabel}.",
                default                          => "General timed practice tests for {$yearLabel} students.",
            },
        };
    }

    private function alignmentLabel(?string $alignment): ?string
    {
        return match ($alignment) {
            CourseTemplate::ALIGN_OC        => 'OC',
            CourseTemplate::ALIGN_SELECTIVE => 'Selective',
            CourseTemplate::ALIGN_NAPLAN_Y3,
            CourseTemplate::ALIGN_NAPLAN_Y5,
            CourseTemplate::ALIGN_NAPLAN_Y7,
            CourseTemplate::ALIGN_NAPLAN_Y9 => 'NAPLAN',
            default                          => null,
        };
    }

    /**
     * Per spec §5.2 — components per test alignment.
     * Non-test-aligned templates get a single 'general' component (spec §5.2 fallback).
     */
    private function componentsFor(?string $alignment): array
    {
        return match ($alignment) {
            CourseTemplate::ALIGN_OC => [
                ['code' => 'reading',          'name' => 'Reading',                'weight_pct' => 33.33, 'duration_minutes' => 30, 'question_count' => 25, 'question_format' => CourseComponent::FORMAT_MULTI_PART_MCQ],
                ['code' => 'maths_reasoning',  'name' => 'Mathematical Reasoning', 'weight_pct' => 33.33, 'duration_minutes' => 40, 'question_count' => 35, 'question_format' => CourseComponent::FORMAT_MULTIPLE_CHOICE],
                ['code' => 'thinking_skills',  'name' => 'Thinking Skills',        'weight_pct' => 33.34, 'duration_minutes' => 30, 'question_count' => 30, 'question_format' => CourseComponent::FORMAT_MULTIPLE_CHOICE],
            ],
            CourseTemplate::ALIGN_SELECTIVE => [
                ['code' => 'reading',          'name' => 'Reading',                'weight_pct' => 25.00, 'duration_minutes' => 40, 'question_format' => CourseComponent::FORMAT_MULTI_PART_MCQ],
                ['code' => 'maths_reasoning',  'name' => 'Mathematical Reasoning', 'weight_pct' => 25.00, 'duration_minutes' => 40, 'question_format' => CourseComponent::FORMAT_MULTIPLE_CHOICE],
                ['code' => 'thinking_skills',  'name' => 'Thinking Skills',        'weight_pct' => 25.00, 'duration_minutes' => 40, 'question_format' => CourseComponent::FORMAT_MULTIPLE_CHOICE],
                ['code' => 'writing',          'name' => 'Writing',                'weight_pct' => 25.00, 'duration_minutes' => 30, 'question_format' => CourseComponent::FORMAT_FREE_RESPONSE_WRITING],
            ],
            CourseTemplate::ALIGN_NAPLAN_Y3,
            CourseTemplate::ALIGN_NAPLAN_Y5,
            CourseTemplate::ALIGN_NAPLAN_Y7,
            CourseTemplate::ALIGN_NAPLAN_Y9 => [
                ['code' => 'reading',                  'name' => 'Reading',                  'question_format' => CourseComponent::FORMAT_MIXED],
                ['code' => 'writing',                  'name' => 'Writing',                  'question_format' => CourseComponent::FORMAT_FREE_RESPONSE_WRITING],
                ['code' => 'conventions_of_language',  'name' => 'Conventions of Language',  'question_format' => CourseComponent::FORMAT_CLOZE],
                ['code' => 'numeracy',                 'name' => 'Numeracy',                 'question_format' => CourseComponent::FORMAT_MIXED],
            ],
            default => [
                ['code' => 'general', 'name' => 'General', 'question_format' => CourseComponent::FORMAT_MIXED],
            ],
        };
    }
}
