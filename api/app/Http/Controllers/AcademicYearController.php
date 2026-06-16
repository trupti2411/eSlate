<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\AcademicYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    use ResolvesScope;

    public function index(Request $request): JsonResponse
    {
        $query = AcademicYear::query()->with('terms.weeks');
        $scoper = $this->ownedScope($request->user());

        return response()->json($scoper($query)->orderByDesc('year')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'business_id' => ['nullable', 'integer', 'exists:businesses,id'],
            'tutor_id' => ['nullable', 'integer', 'exists:tutors,id'],
        ]);

        $scope = $this->resolveOwnerScope(
            $request->user(),
            $data['business_id'] ?? null,
            $data['tutor_id'] ?? null
        );

        $year = AcademicYear::create([
            'business_id' => $scope['business_id'],
            'tutor_id' => $scope['tutor_id'],
            'year' => $data['year'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
        ]);

        return response()->json($year->load('terms.weeks'), 201);
    }

    public function show(Request $request, AcademicYear $academicYear): JsonResponse
    {
        $this->authorizeOwn($request->user(), $academicYear);

        return response()->json($academicYear->load('terms.weeks'));
    }

    public function update(Request $request, AcademicYear $academicYear): JsonResponse
    {
        $this->authorizeOwn($request->user(), $academicYear);

        $data = $request->validate([
            'year' => ['sometimes', 'integer', 'min:2020', 'max:2100'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after:start_date'],
        ]);

        $academicYear->update($data);

        return response()->json($academicYear->load('terms.weeks'));
    }

    public function destroy(Request $request, AcademicYear $academicYear): JsonResponse
    {
        $this->authorizeOwn($request->user(), $academicYear);

        $academicYear->delete();

        return response()->json(['message' => 'Deleted']);
    }

    private function authorizeOwn($user, AcademicYear $year): void
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
