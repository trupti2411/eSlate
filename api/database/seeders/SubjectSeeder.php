<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        // v1 ships NSW K–6 master list only. Each subject is tagged with the year bands it serves.
        // Reading / Writing / Thinking Skills are K–6-only — they're not NESA KLAs but they're
        // real subjects in OC + Selective prep tutoring, which mirrors the OC/Selective test sections.
        // Y7–12 subjects will be added in a later pass.
        $K6 = ['K', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'];

        $nswSubjects = [
            ['code' => 'ENG',   'name' => 'English',         'year_levels' => $K6],
            ['code' => 'MATH',  'name' => 'Mathematics',     'year_levels' => $K6],
            ['code' => 'READ',  'name' => 'Reading',         'year_levels' => $K6],
            ['code' => 'WRITE', 'name' => 'Writing',         'year_levels' => $K6],
            ['code' => 'SCI',   'name' => 'Science',         'year_levels' => $K6],
            ['code' => 'THINK', 'name' => 'Thinking Skills', 'year_levels' => $K6],
        ];

        foreach ($nswSubjects as $s) {
            Subject::updateOrCreate(
                ['state_code' => 'NSW', 'code' => $s['code']],
                ['name' => $s['name'], 'year_levels' => $s['year_levels']]
            );
        }
    }
}
