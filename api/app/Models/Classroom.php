<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Classroom extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'business_id',
        'tutor_id',
        'course_offering_id',     // deprecated; kept for back-compat
        'course_id',
        'academic_year_id',
        'year_group_id',
        'subject_id',
        'name',
        'starts_on',
        'ends_on',
        'capacity',
        'status',
        'description',
        'level',
        'schedule_day_of_week',
        'schedule_start_time',
        'schedule_end_time',
        'location',
    ];

    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'ends_on' => 'date',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function yearGroup(): BelongsTo
    {
        return $this->belongsTo(YearGroup::class);
    }

    /** Legacy single-subject link — kept as the "primary" subject (mirrors class_subjects.is_primary=true row). */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * All subjects this class teaches. Classes linked to a multi-subject course (e.g. WEMT)
     * will have several rows here; classic single-subject classes have one row with is_primary=true.
     */
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'class_subjects', 'class_id', 'subject_id')
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    /** Optional link — class belongs to a course offering when it's a course cohort. */
    public function courseOffering(): BelongsTo
    {
        return $this->belongsTo(CourseOffering::class, 'course_offering_id');
    }

    /** Parent catalogue Course (e.g. Foundation, OC Test Prep). Replaces courseOffering link for new classes. */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /** Terms this class runs within. starts_on / ends_on are derived from the union of these terms. */
    public function terms(): BelongsToMany
    {
        return $this->belongsToMany(AcademicTerm::class, 'class_terms', 'class_id', 'academic_term_id')
            ->withTimestamps();
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'student_class_assignments', 'class_id', 'student_id')
            ->withPivot('enrolled_at')
            ->withTimestamps();
    }
}
