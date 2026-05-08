<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class YearGroup extends Model
{
    use HasFactory;

    protected $fillable = ['state_code', 'order', 'label', 'code'];

    public function classrooms(): HasMany
    {
        return $this->hasMany(Classroom::class);
    }
}
