<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesScope;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            // ESLATE-8: name ≤150, description ≤500.
            'name'         => ['required', 'string', 'min:2', 'max:150'],
            'description'  => ['nullable', 'string', 'max:500'],
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

    /** GET /api/courses/{course} — detail view incl. linked classes + audit (ESLATE-15). */
    public function show(Request $request, Course $course): JsonResponse
    {
        $this->authorizeCourse($request->user(), $course);

        return response()->json($this->serializeCourse($course));
    }

    /**
     * PATCH /api/courses/{course} (ESLATE-15).
     *
     * A course rename is non-destructive and propagates by reference (classes
     * read the name off the course). Removing a subject is destructive: it must
     * be stripped from every linked class that uses it. We do the cascade
     * server-side inside a transaction and return an `impact` summary so the
     * UI can surface which classes changed and which were left with no subject.
     */
    public function update(Request $request, Course $course): JsonResponse
    {
        $this->authorizeCourse($request->user(), $course);
        $data = $request->validate([
            'name'         => ['sometimes', 'string', 'min:2', 'max:150'],
            'description'  => ['nullable', 'string', 'max:500'],
            'subject_ids'  => ['sometimes', 'array'],
            'subject_ids.*'=> ['integer', 'exists:subjects,id'],
        ]);

        $impact = ['affectedClasses' => [], 'classesLeftEmpty' => []];

        DB::transaction(function () use (&$impact, $course, &$data, $request) {
            if (array_key_exists('subject_ids', $data)) {
                $newIds     = array_map('intval', $data['subject_ids']);
                $currentIds = $course->subjects()->pluck('subjects.id')->all();
                $removed    = array_values(array_diff($currentIds, $newIds));

                if ($removed) {
                    foreach ($course->classes()->with('subjects:id,name')->get() as $class) {
                        $classSubjectIds = $class->subjects->pluck('id')->all();
                        $toRemove = array_values(array_intersect($classSubjectIds, $removed));
                        if (! $toRemove) {
                            continue;
                        }

                        $class->subjects()->detach($toRemove);
                        $impact['affectedClasses'][] = [
                            'id'              => (string) $class->id,
                            'name'            => $class->name,
                            'removedSubjects' => $class->subjects->whereIn('id', $toRemove)->pluck('name')->values()->all(),
                        ];
                        if (count($classSubjectIds) === count($toRemove)) {
                            $impact['classesLeftEmpty'][] = $class->name;
                        }
                    }
                }

                $course->subjects()->sync($newIds);
                unset($data['subject_ids']);
            }

            $data['updated_by'] = $request->user()->id;
            $course->update($data);
        });

        return response()->json([
            'course' => $this->serializeCourse($course->fresh()),
            'impact' => $impact,
        ]);
    }

    /** Detail payload: course + subjects + linked classes (with subjects) + audit. */
    private function serializeCourse(Course $course): array
    {
        $course->loadMissing([
            'subjects:id,code,name',
            'classes:id,course_id,name,year_group_id',
            'classes.subjects:id,name',
            'classes.yearGroup:id,label',
            'updatedBy:id,name',
        ]);

        return array_merge($course->toArray(), [
            'updated_by' => $course->updated_by,
            'updatedBy'  => $course->updatedBy ? ['name' => $course->updatedBy->name] : null,
            'classes'    => $course->classes->map(fn ($c) => [
                'id'         => (string) $c->id,
                'name'       => $c->name,
                'yearGroup'  => $c->yearGroup?->label,
                'subjects'   => $c->subjects->pluck('name')->values()->all(),
                'subjectIds' => $c->subjects->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
            ])->values()->all(),
        ]);
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
