<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;

/**
 * Append-only audit logger for onboarding events, compliance transitions, and tier rejections (v3 §10.4).
 */
class AuditLogger
{
    public function log(
        string $event,
        ?int $businessId = null,
        ?User $actor = null,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $payload = null,
    ): AuditLog {
        return AuditLog::create([
            'event'         => $event,
            'business_id'   => $businessId,
            'actor_user_id' => $actor?->id,
            'entity_type'   => $entityType,
            'entity_id'     => $entityId,
            'payload'       => $payload,
            'occurred_at'   => now(),
        ]);
    }
}
