<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseComponent extends Model
{
    use HasFactory;

    public const FORMAT_MULTIPLE_CHOICE = 'multiple_choice';
    public const FORMAT_MULTI_PART_MCQ = 'multi_part_mcq';
    public const FORMAT_CLOZE = 'cloze';
    public const FORMAT_FREE_RESPONSE_WRITING = 'free_response_writing';
    public const FORMAT_MIXED = 'mixed';
    public const FORMATS = [
        self::FORMAT_MULTIPLE_CHOICE, self::FORMAT_MULTI_PART_MCQ,
        self::FORMAT_CLOZE, self::FORMAT_FREE_RESPONSE_WRITING, self::FORMAT_MIXED,
    ];

    protected $fillable = [
        'course_template_id', 'code', 'name',
        'weight_pct', 'duration_minutes', 'question_count',
        'question_format', 'sort_order', 'pack_version',
    ];

    protected function casts(): array
    {
        return [
            'weight_pct' => 'decimal:2',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CourseTemplate::class, 'course_template_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'course_component_id');
    }
}
