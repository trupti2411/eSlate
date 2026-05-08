<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Tutor;

/**
 * Enforces subscription tier caps at the service layer (v3 §9).
 * Individual tier is hard-capped at 1 tutor (the Owner). Starter=5, Pro=20, Enterprise=∞.
 * Archived tutors don't count toward the cap.
 */
class TierEnforcer
{
    public function activeTutorCount(Business $business): int
    {
        return $business->tutors()
            ->where('status', '!=', Tutor::STATUS_ARCHIVED)
            ->count();
    }

    /** True if the business can add another (active) tutor without exceeding its tier cap. */
    public function canAddTutor(Business $business): bool
    {
        $cap = $business->tutorCap();
        if ($cap === null) {
            return true;     // Enterprise — unlimited
        }
        return $this->activeTutorCount($business) < $cap;
    }

    /** Throws on cap exceeded — for use in controllers that should 422 on hit. */
    public function assertCanAddTutor(Business $business): void
    {
        if (! $this->canAddTutor($business)) {
            $cap = $business->tutorCap();
            throw new TierLimitExceededException(
                $business->isIndividual()
                    ? 'Upgrade to Multi-tutor to add team members.'
                    : "Tier cap of {$cap} tutors reached. Upgrade to add more."
            );
        }
    }
}
