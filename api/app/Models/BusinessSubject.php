<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessSubject extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id', 'subject_id',
        'name', 'name_normalized', 'year_levels', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'year_levels' => 'array',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function isCustom(): bool
    {
        return $this->subject_id === null;
    }

    public static function normalize(string $name): string
    {
        return mb_strtolower(trim($name));
    }
}
