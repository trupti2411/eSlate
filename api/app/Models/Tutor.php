<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tutor extends Model
{
    use HasFactory;

    public const STATUS_INVITED = 'invited';
    public const STATUS_PENDING_COMPLIANCE = 'pending_compliance';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_ARCHIVED = 'archived';

    public const COMPLIANCE_COMPLIANT = 'compliant';
    public const COMPLIANCE_PENDING = 'pending_compliance';
    public const COMPLIANCE_HOLD = 'compliance_hold';

    protected $fillable = [
        'user_id', 'business_id', 'status',
        'wwcc_number', 'wwcc_expiry', 'wwcc_state', 'compliance_status',
        'wwcc_certificate_path', 'wwcc_certificate_original_name', 'wwcc_certificate_uploaded_at',
        'bio', 'hourly_rate', 'qualifications', 'delivery_modes', 'year_levels',
        'phone', 'address', 'updated_by',   // ESLATE-13
    ];

    protected function casts(): array
    {
        return [
            'wwcc_number' => 'encrypted',
            'wwcc_expiry' => 'date',
            'wwcc_certificate_uploaded_at' => 'datetime',
            'hourly_rate' => 'decimal:2',
            'qualifications' => 'array',
            'delivery_modes' => 'array',
            'year_levels' => 'array',
        ];
    }

    public function hasCertificate(): bool
    {
        return ! empty($this->wwcc_certificate_path);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'student_tutors')
            ->withPivot(['subject_id', 'is_primary', 'started_at', 'ended_at'])
            ->withTimestamps();
    }

    /**
     * Solo-tutor classification now lives on the business row, not the tutor row.
     * Under Shadow Business every tutor has a business_id; soloness = business->type=individual.
     */
    public function isSolo(): bool
    {
        return $this->business?->isIndividual() ?? false;
    }

    public function isCompliant(): bool
    {
        return $this->compliance_status === self::COMPLIANCE_COMPLIANT;
    }
}
