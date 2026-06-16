<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Business;
use App\Models\Tutor;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\HttpException;

trait ResolvesScope
{
    /**
     * Returns ['business_id' => ?int, 'tutor_id' => ?int] representing
     * the academic-resource scope the current user owns.
     *
     * - Admin: must pass business_id or tutor_id explicitly via request.
     * - Business: their owned business.
     * - Tutor: their tutor row + business_id (if any).
     * - Student: not allowed to write academic resources.
     */
    protected function resolveOwnerScope(User $user, ?int $forBusinessId = null, ?int $forTutorId = null): array
    {
        if ($user->isAdmin()) {
            if ($forBusinessId === null && $forTutorId === null) {
                abort(422, 'Admin must specify business_id or tutor_id.');
            }

            return ['business_id' => $forBusinessId, 'tutor_id' => $forTutorId];
        }

        if ($user->isBusiness()) {
            $business = Business::where('owner_user_id', $user->id)->first();
            if (! $business) {
                abort(403, 'No business owned by this user.');
            }

            return ['business_id' => $business->id, 'tutor_id' => null];
        }

        if ($user->isTutor()) {
            $tutor = $user->tutor;
            if (! $tutor) {
                abort(403, 'No tutor record for this user.');
            }

            return ['business_id' => $tutor->business_id, 'tutor_id' => $tutor->id];
        }

        abort(403, 'Students cannot manage academic resources.');
    }

    /**
     * Returns a query-scoping closure for academic resources matching
     * the user's ownership.
     */
    protected function ownedScope(User $user): \Closure
    {
        return function ($query) use ($user) {
            if ($user->isAdmin()) {
                return $query;
            }

            if ($user->isBusiness()) {
                $business = Business::where('owner_user_id', $user->id)->first();
                if (! $business) {
                    return $query->whereRaw('0=1');
                }

                return $query->where('business_id', $business->id);
            }

            if ($user->isTutor()) {
                $tutor = $user->tutor;
                if (! $tutor) {
                    return $query->whereRaw('0=1');
                }

                return $query->where(function ($q) use ($tutor) {
                    $q->where('tutor_id', $tutor->id);
                    if ($tutor->business_id) {
                        $q->orWhere('business_id', $tutor->business_id);
                    }
                });
            }

            return $query->whereRaw('0=1');
        };
    }
}
