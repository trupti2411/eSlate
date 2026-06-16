<?php

namespace App\Http\Controllers;

use App\Models\CourseTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only access to the platform-seeded course template catalogue.
 * Templates are global; auth is required but no business scoping applies.
 */
class CourseTemplateController extends Controller
{
    /** GET /api/course-templates */
    public function index(Request $request): JsonResponse
    {
        $query = CourseTemplate::query()->with('components');

        if ($state = $request->query('state')) {
            $query->where('state_code', strtoupper($state));
        }
        if ($yearGroup = $request->query('year_group_code')) {
            $query->where('year_group_code', $yearGroup);
        }
        if ($kind = $request->query('kind')) {
            $query->where('kind', $kind);
        }
        if ($request->has('test_alignment')) {
            $alignment = $request->query('test_alignment');
            $alignment === 'null' || $alignment === ''
                ? $query->whereNull('test_alignment')
                : $query->where('test_alignment', $alignment);
        }
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        } else {
            $query->where('is_active', true);
        }

        return response()->json($query->orderBy('sort_order')->get());
    }

    /** GET /api/course-templates/{template} */
    public function show(CourseTemplate $template): JsonResponse
    {
        return response()->json($template->load('components'));
    }

    /** GET /api/course-templates/{template}/components — convenience endpoint. */
    public function components(CourseTemplate $template): JsonResponse
    {
        return response()->json($template->components);
    }
}
