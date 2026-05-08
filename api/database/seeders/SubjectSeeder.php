<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        // v1 ships NSW master list only.
        $nswSubjects = [
            ['code' => 'MATH',        'name' => 'Mathematics'],
            ['code' => 'MATH-STD',    'name' => 'Mathematics Standard'],
            ['code' => 'MATH-ADV',    'name' => 'Mathematics Advanced'],
            ['code' => 'ENG',         'name' => 'English'],
            ['code' => 'ENG-STD',     'name' => 'English Standard'],
            ['code' => 'ENG-ADV',     'name' => 'English Advanced'],
            ['code' => 'SCI',         'name' => 'Science'],
            ['code' => 'PHYS',        'name' => 'Physics'],
            ['code' => 'CHEM',        'name' => 'Chemistry'],
            ['code' => 'BIO',         'name' => 'Biology'],
            ['code' => 'HIST',        'name' => 'History'],
            ['code' => 'GEO',         'name' => 'Geography'],
            ['code' => 'ART',         'name' => 'Visual Arts'],
            ['code' => 'MUS',         'name' => 'Music'],
            ['code' => 'PE',          'name' => 'Physical Education'],
            ['code' => 'HEALTH',      'name' => 'Health'],
            ['code' => 'LANG',        'name' => 'Languages'],
            ['code' => 'DRAMA',       'name' => 'Drama'],
            ['code' => 'TECH',        'name' => 'Technology'],
            ['code' => 'ECON',        'name' => 'Economics & Business'],
        ];

        foreach ($nswSubjects as $s) {
            Subject::updateOrCreate(
                ['state_code' => 'NSW', 'code' => $s['code']],
                ['name' => $s['name']]
            );
        }
    }
}
