<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'business_id', 'tutor_id', 'class_id', 'week_id',
        'course_offering_id', 'course_component_id',
        'title', 'description', 'pdf_path', 'pdf_original_name',
        'due_date', 'status',
    ];

    protected function casts(): array
    {
        return ['due_date' => 'date'];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    public function week(): BelongsTo
    {
        return $this->belongsTo(Week::class);
    }

    public function courseOffering(): BelongsTo
    {
        return $this->belongsTo(CourseOffering::class, 'course_offering_id');
    }

    public function courseComponent(): BelongsTo
    {
        return $this->belongsTo(CourseComponent::class, 'course_component_id');
    }

    public function targetStudents(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'assignment_students')
            ->withTimestamps();
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function scopeVisibleTo(Builder $query, Student $student): Builder
    {
        return $query->where('status', self::STATUS_PUBLISHED)
            ->where(function ($q) use ($student) {
                $classIds = $student->classrooms()->pluck('classes.id');
                $q->whereIn('class_id', $classIds)
                    ->orWhereHas('targetStudents', fn ($qq) => $qq->where('students.id', $student->id));
            });
    }
}
