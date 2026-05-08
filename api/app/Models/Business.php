<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    use HasFactory;

    public const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

    public const TYPE_INDIVIDUAL = 'individual';
    public const TYPE_MULTI_TUTOR = 'multi_tutor';
    public const TYPES = [self::TYPE_INDIVIDUAL, self::TYPE_MULTI_TUTOR];

    public const TIER_INDIVIDUAL = 'individual';
    public const TIER_STARTER = 'starter';
    public const TIER_PRO = 'pro';
    public const TIER_ENTERPRISE = 'enterprise';
    public const TIERS = [self::TIER_INDIVIDUAL, self::TIER_STARTER, self::TIER_PRO, self::TIER_ENTERPRISE];

    public const TIER_TUTOR_CAPS = [
        self::TIER_INDIVIDUAL => 1,
        self::TIER_STARTER => 5,
        self::TIER_PRO => 20,
        self::TIER_ENTERPRISE => null,    // unlimited
    ];

    protected $fillable = [
        'type', 'name', 'legal_name', 'logo', 'abn',
        'state_code', 'timezone', 'currency', 'tier', 'pack_version',
        'owner_user_id',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function tutors(): HasMany
    {
        return $this->hasMany(Tutor::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function isIndividual(): bool
    {
        return $this->type === self::TYPE_INDIVIDUAL;
    }

    public function isMultiTutor(): bool
    {
        return $this->type === self::TYPE_MULTI_TUTOR;
    }

    public function tutorCap(): ?int
    {
        return self::TIER_TUTOR_CAPS[$this->tier] ?? null;
    }
}
