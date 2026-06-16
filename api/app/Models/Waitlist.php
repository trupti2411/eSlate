<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Waitlist extends Model
{
    use HasFactory;

    protected $table = 'waitlist';

    protected $fillable = [
        'email', 'first_name', 'last_name',
        'country', 'state', 'intended_role',
        'notified_at',
    ];

    protected function casts(): array
    {
        return ['notified_at' => 'datetime'];
    }
}
