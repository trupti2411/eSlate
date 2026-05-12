<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfferingEnrolment extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_WITHDRAWN = 'withdrawn';
    public const STATUS_COMPLETED = 'completed';
    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_WITHDRAWN, self::STATUS_COMPLETED];

    protected $fillable = [
        'business_id', 'course_offering_id', 'student_id',
        'status', 'enrolled_at', 'withdrew_at', 'completed_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'enrolled_at' => 'datetime',
            'withdrew_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function offering(): BelongsTo
    {
        return $this->belongsTo(CourseOffering::class, 'course_offering_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
