<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicTermController extends Controller
{
    use ResolvesScope;

    public function store(Request $request, AcademicYear $academicYear): JsonResponse
    {
        $this->authorizeYear($request->user(), $academicYear);

        $data = $request->validate([
            'term_number' => ['required', 'integer', 'min:1', 'max:4'],
            'name' => ['required', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
        ]);

        $term = $academicYear->terms()->create($data);
        $term->regenerateWeeks();

        return response()->json($term->load('weeks'), 201);
    }

    public function update(Request $request, AcademicTerm $term): JsonResponse
    {
        $this->authorizeYear($request->user(), $term->academicYear);

        $data = $request->validate([
            'term_number' => ['sometimes', 'integer', 'min:1', 'max:4'],
            'name' => ['sometimes', 'string', 'max:50'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after:start_date'],
        ]);

        $datesChanged = isset($data['start_date']) || isset($data['end_date']);

        // Owner-edited terms should be skipped by the annual pack refresh (v3 §6).
        if ($datesChanged) {
            $data['is_manually_edited'] = true;
        }

        $term->update($data);

        if ($datesChanged) {
            $term->refresh()->regenerateWeeks();
        }

        return response()->json($term->load('weeks'));
    }

    public function destroy(Request $request, AcademicTerm $term): JsonResponse
    {
        $this->authorizeYear($request->user(), $term->academicYear);
        $term->delete();

        return response()->json(['message' => 'Deleted']);
    }

    private function authorizeYear($user, AcademicYear $year): void
    {
        if ($user->isAdmin()) {
            return;
        }

        $scope = $this->resolveOwnerScope($user);

        $owned = ($scope['business_id'] !== null && $year->business_id === $scope['business_id'])
            || ($scope['tutor_id'] !== null && $year->tutor_id === $scope['tutor_id']);

        if (! $owned) {
            abort(403);
        }
    }
}
