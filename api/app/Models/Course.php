<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Owner-authored catalogue category. A Course (e.g. "Foundation",
 * "OC Test Preparation") groups many CourseOfferings underneath, each
 * scoped by (year_group × subject × optional level).
 */
class Course extends Model
{
    use HasFactory;

    protected $fillable = ['business_id', 'name', 'description', 'updated_by'];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function offerings(): HasMany
    {
        return $this->hasMany(CourseOffering::class);
    }

    /** Classes that use this course as their catalogue parent (ESLATE-15). */
    public function classes(): HasMany
    {
        return $this->hasMany(Classroom::class, 'course_id');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Subjects this course teaches. A class linked to this course can only pick from this set.
     * WEMT, for example, would have {Reading, Mathematics, Thinking Skills, Writing}.
     */
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'course_subjects')
            ->withTimestamps();
    }
}
