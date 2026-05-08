<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_MARKED = 'marked';
    public const STATUS_RETURNED = 'returned';

    protected $fillable = [
        'assignment_id', 'student_id', 'status',
        'annotated_pdf_path', 'annotated_pdf_original_name',
        'submitted_at', 'marked_at', 'marked_by_tutor_id',
        'mark_comment', 'mark_score',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'marked_at' => 'datetime',
            'mark_score' => 'decimal:2',
        ];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(Tutor::class, 'marked_by_tutor_id');
    }
}
