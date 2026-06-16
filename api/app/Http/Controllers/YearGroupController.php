<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\YearGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class YearGroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'state' => ['required', Rule::in(Business::STATES)],
        ]);

        return response()->json(
            YearGroup::where('state_code', $data['state'])->orderBy('order')->get()
        );
    }
}
