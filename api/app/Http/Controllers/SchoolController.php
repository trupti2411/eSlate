<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * ESLATE-5: Australian schools typeahead.
 *
 * GET /api/schools/search?q=bondi
 *
 * Proxies to a configurable Australian Schools dataset (data.gov.au CKAN
 * datastore_search by default — see config/services.php `schools`). The
 * frontend always permits free-text entry, so if the upstream source is
 * unconfigured, times out, or errors, we return `available: false` with an
 * empty list and the field gracefully falls back to a plain text input.
 */
class SchoolController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:80'],
        ]);

        $q = trim($request->query('q'));

        $url      = config('services.schools.url');
        $resource = config('services.schools.resource_id');

        // No upstream configured → tell the client to fall back to free text.
        if (! $url || ! $resource) {
            return response()->json(['available' => false, 'schools' => []]);
        }

        // Cache identical queries briefly to keep the typeahead snappy and
        // avoid hammering the upstream while the user types.
        $cacheKey = 'schools:' . md5($resource . '|' . strtolower($q));

        try {
            $schools = Cache::remember($cacheKey, now()->addHours(6), function () use ($url, $resource, $q) {
                $response = Http::timeout(4)->get($url, [
                    'resource_id' => $resource,
                    'q'           => $q,
                    'limit'       => 15,
                ]);

                if (! $response->successful()) {
                    return null;
                }

                $records = $response->json('result.records') ?? [];

                return collect($records)->map(fn ($r) => [
                    'name'     => $r['School Name'] ?? $r['school_name'] ?? $r['name'] ?? null,
                    'suburb'   => $r['Suburb'] ?? $r['suburb'] ?? $r['Town'] ?? null,
                    'state'    => $r['State'] ?? $r['state'] ?? null,
                    'postcode' => $r['Postcode'] ?? $r['postcode'] ?? null,
                ])->filter(fn ($r) => ! empty($r['name']))->values()->all();
            });
        } catch (\Throwable $e) {
            $schools = null;
        }

        if ($schools === null) {
            return response()->json(['available' => false, 'schools' => []]);
        }

        return response()->json(['available' => true, 'schools' => $schools]);
    }
}
