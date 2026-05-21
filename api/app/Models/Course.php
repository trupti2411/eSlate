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

    protected $fillable = ['business_id', 'name', 'description'];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function offerings(): HasMany
    {
        return $this->hasMany(CourseOffering::class);
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
