<?php

namespace App\Http\Controllers;

use App\Models\Waitlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Captures non-NSW Australian signup attempts (per v3 §5.1, §7.6).
 * International signups are blocked at the country gate before reaching this endpoint.
 */
class WaitlistController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'         => ['required', 'email'],
            'first_name'    => ['nullable', 'string', 'max:60'],
            'last_name'     => ['nullable', 'string', 'max:60'],
            'state'         => ['required', Rule::in(['VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'])],
            'intended_role' => ['nullable', Rule::in(['individual_tutor', 'multi_tutor_owner', 'other'])],
        ]);

        $row = Waitlist::create([
            'email'         => $data['email'],
            'first_name'    => $data['first_name'] ?? null,
            'last_name'     => $data['last_name'] ?? null,
            'country'       => 'AU',
            'state'         => $data['state'],
            'intended_role' => $data['intended_role'] ?? null,
        ]);

        return response()->json([
            'message'      => "We're launching in NSW first — we'll let you know when {$data['state']} is ready.",
            'waitlist_id'  => $row->id,
        ], 201);
    }
}
