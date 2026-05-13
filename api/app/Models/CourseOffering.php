<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseOffering extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_ARCHIVED = 'archived';
    public const STATUSES = [self::STATUS_DRAFT, self::STATUS_ACTIVE, self::STATUS_COMPLETED, self::STATUS_ARCHIVED];

    protected $fillable = [
        'business_id', 'course_id', 'course_template_id', 'tutor_id',
        'year_group_id', 'subject_id', 'level',
        'academic_year_id', 'created_by_user_id',
        'name', 'description', 'target_test_date', 'starts_on', 'ends_on',
        'capacity', 'status', 'notes',
    ];

    /** True when this is a custom owner-defined course (no platform template). */
    public function isCustom(): bool
    {
        return $this->course_template_id === null;
    }

    protected function casts(): array
    {
        return [
            'target_test_date' => 'date',
            'starts_on' => 'date',
            'ends_on' => 'date',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function yearGroup(): BelongsTo
    {
        return $this->belongsTo(YearGroup::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CourseTemplate::class, 'course_template_id');
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function enrolments(): HasMany
    {
        return $this->hasMany(OfferingEnrolment::class);
    }

    public function activeEnrolments(): HasMany
    {
        return $this->hasMany(OfferingEnrolment::class)->where('status', OfferingEnrolment::STATUS_ACTIVE);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'course_offering_id');
    }
}
