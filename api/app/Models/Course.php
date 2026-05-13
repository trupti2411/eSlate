<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
}
