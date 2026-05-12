<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseTemplate extends Model
{
    use HasFactory;

    public const KIND_FOUNDATIONS = 'foundations';
    public const KIND_THEORY = 'theory';
    public const KIND_MOCK_TESTS = 'mock_tests';
    public const KINDS = [self::KIND_FOUNDATIONS, self::KIND_THEORY, self::KIND_MOCK_TESTS];

    public const ALIGN_OC = 'oc';
    public const ALIGN_SELECTIVE = 'selective';
    public const ALIGN_NAPLAN_Y3 = 'naplan_y3';
    public const ALIGN_NAPLAN_Y5 = 'naplan_y5';
    public const ALIGN_NAPLAN_Y7 = 'naplan_y7';
    public const ALIGN_NAPLAN_Y9 = 'naplan_y9';
    public const ALIGNMENTS = [
        self::ALIGN_OC, self::ALIGN_SELECTIVE,
        self::ALIGN_NAPLAN_Y3, self::ALIGN_NAPLAN_Y5, self::ALIGN_NAPLAN_Y7, self::ALIGN_NAPLAN_Y9,
    ];

    protected $fillable = [
        'state_code', 'year_group_code', 'kind', 'test_alignment',
        'code', 'name', 'short_name', 'description',
        'sort_order', 'pack_version', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function components(): HasMany
    {
        return $this->hasMany(CourseComponent::class)->orderBy('sort_order');
    }

    public function offerings(): HasMany
    {
        return $this->hasMany(CourseOffering::class);
    }
}
