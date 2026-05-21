<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Owner-authored catalogue. A Course is a top-level category that the
 * owner creates (e.g. "Foundation", "OC Test Prep"). Course offerings —
 * the (year × subject × optional level) leaves — point at their parent
 * Course via course_offerings.course_id.
 */
class CourseController extends Controller
{
    use ResolvesScope;

    /** GET /api/courses — list courses in the caller's business (admins see all). */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Course::query()
            ->with([
                'subjects:id,code,name',
                'offerings' => fn ($q) => $q->select(
                    'id', 'course_id', 'name', 'year_group_id', 'subject_id', 'level', 'status', 'tutor_id'
                )->with([
                    'yearGroup:id,code,label',
                    'subject:id,code,name',
                ]),
            ]);

        if (! $user->isAdmin()) {
            $scope = $this->resolveOwnerScope($user);
            if (! $scope['business_id']) {
                return response()->json([]);
            }
            $query->where('business_id', $scope['business_id']);
        }

        return response()->json($query->orderBy('name')->get());
    }

    /** POST /api/courses */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'min:2', 'max:120'],
            'description'  => ['nullable', 'string'],
            'subject_ids'  => ['nullable', 'array'],
            'subject_ids.*'=> ['integer', 'exists:subjects,id'],
        ]);

        $user = $request->user();
        $scope = $this->resolveOwnerScope($user);
        if (! $scope['business_id']) {
            abort(403, 'No business scope.');
        }

        $course = Course::create([
            'business_id' => $scope['business_id'],
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        if (! empty($data['subject_ids'])) {
            $course->subjects()->sync($data['subject_ids']);
        }

        return response()->json($course->load('subjects:id,code,name'), 201);
    }

    /** GET /api/courses/{course} */
    public function show(Request $request, Course $course): JsonResponse
    {
        $this->authorizeCourse($request->user(), $course);
        return response()->json($course->load([
            'subjects:id,code,name',
            'offerings.yearGroup',
            'offerings.subject',
            'offerings.tutor.user:id,name',
        ]));
    }

    /** PATCH /api/courses/{course} */
    public function update(Request $request, Course $course): JsonResponse
    {
        $this->authorizeCourse($request->user(), $course);
        $data = $request->validate([
            'name'         => ['sometimes', 'string', 'min:2', 'max:120'],
            'description'  => ['nullable', 'string'],
            'subject_ids'  => ['sometimes', 'array'],
            'subject_ids.*'=> ['integer', 'exists:subjects,id'],
        ]);

        if (array_key_exists('subject_ids', $data)) {
            $course->subjects()->sync($data['subject_ids']);
            unset($data['subject_ids']);
        }

        if (! empty($data)) {
            $course->update($data);
        }
        return response()->json($course->fresh()->load('subjects:id,code,name'));
    }

    /** DELETE /api/courses/{course} */
    public function destroy(Request $request, Course $course): JsonResponse
    {
        $this->authorizeCourse($request->user(), $course);
        // Offerings keep their data; course_id becomes null via nullOnDelete.
        $course->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function authorizeCourse($user, Course $course): void
    {
        if ($user->isAdmin()) {
            return;
        }
        $scope = $this->resolveOwnerScope($user);
        if (! $scope['business_id'] || $course->business_id !== $scope['business_id']) {
            abort(403);
        }
    }
}
