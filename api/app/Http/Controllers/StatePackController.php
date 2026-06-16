<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Tutor;
use App\Models\User;
use App\Services\StatePackApplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use RuntimeException;

class StatePackController extends Controller
{
    public function __construct(
        private readonly StatePackApplier $applier,
    ) {}

    /** GET /api/state-packs/{state}/{year} — preview JSON for review before apply. */
    public function show(Request $request, string $state, int $year): JsonResponse
    {
        try {
            $pack = $this->applier->loadPack($state, $year);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
        return response()->json($pack);
    }

    /** POST /api/state-packs/apply — applies the pack to the caller's business. */
    public function apply(Request $request): JsonResponse
    {
        $data = $request->validate([
            'state_code' => ['required', 'string', 'size:3', Rule::in(Business::STATES)],
            'year'       => ['required', 'integer', 'min:2020', 'max:2100'],
        ]);

        $business = $this->resolveCallerBusiness($request->user());
        if (! $business) {
            return response()->json(['message' => 'No business found for the current user.'], 422);
        }

        try {
            $year = $this->applier->apply($data['state_code'], $data['year'], $business);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($year);
    }

    private function resolveCallerBusiness(User $user): ?Business
    {
        // Owner → owns a business directly
        $owned = Business::where('owner_user_id', $user->id)->first();
        if ($owned) return $owned;

        // Tutor → fetch via tutors row
        $tutor = Tutor::where('user_id', $user->id)->first();
        return $tutor?->business;
    }
}
