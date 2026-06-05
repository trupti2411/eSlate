<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ESLATE-11: a single policy-acceptance event (one row per policy per accept).
 */
class PolicyAcceptance extends Model
{
    public const TYPE_TERMS_OF_SERVICE = 'terms_of_service';
    public const TYPE_PRIVACY_POLICY   = 'privacy_policy';
    public const TYPE_USER_AGREEMENT   = 'user_agreement';

    public const TYPES = [
        self::TYPE_TERMS_OF_SERVICE,
        self::TYPE_PRIVACY_POLICY,
        self::TYPE_USER_AGREEMENT,
    ];

    protected $fillable = [
        'user_id', 'business_id', 'policy_type', 'policy_version', 'accepted_at',
    ];

    protected function casts(): array
    {
        return ['accepted_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
