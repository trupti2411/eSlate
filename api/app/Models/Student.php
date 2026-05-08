<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'business_id', 'user_id',
        'first_name', 'last_name', 'date_of_birth',
        'year_group_code', 'school',
        'learning_goals', 'special_needs_notes', 'status',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'special_needs_notes' => 'encrypted',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function tutors(): BelongsToMany
    {
        return $this->belongsToMany(Tutor::class, 'student_tutors')
            ->withPivot(['subject_id', 'is_primary', 'started_at', 'ended_at'])
            ->withTimestamps();
    }

    /** Per-subject primary tutor (v3): one row per (student, subject) where is_primary=true. */
    public function primaryTutorForSubject(int $subjectId): ?Tutor
    {
        return $this->tutors()
            ->wherePivot('subject_id', $subjectId)
            ->wherePivot('is_primary', true)
            ->first();
    }

    public function classrooms(): BelongsToMany
    {
        return $this->belongsToMany(Classroom::class, 'student_class_assignments', 'student_id', 'class_id')
            ->withPivot('enrolled_at')
            ->withTimestamps();
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}
