<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Invitation extends Model
{
    use HasFactory;

    public const KIND_BUSINESS_OWNER = 'business_owner';
    public const KIND_TUTOR = 'tutor';

    public const TTL_DAYS = 7;

    protected $fillable = [
        'kind', 'business_id', 'email', 'first_name', 'last_name',
        'token', 'expires_at', 'accepted_at', 'accepted_by_user_id', 'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at'  => 'datetime',
            'accepted_at' => 'datetime',
            'revoked_at'  => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function acceptedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by_user_id');
    }

    public static function generateToken(): string
    {
        return Str::random(64);
    }

    public function isUsable(): bool
    {
        return $this->accepted_at === null
            && $this->revoked_at === null
            && $this->expires_at !== null
            && $this->expires_at->isFuture();
    }
}
