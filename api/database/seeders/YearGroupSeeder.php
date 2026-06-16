<?php

namespace Database\Seeders;

use App\Models\YearGroup;
use Illuminate\Database\Seeder;

class YearGroupSeeder extends Seeder
{
    public function run(): void
    {
        $foundationByState = [
            'NSW' => ['label' => 'Kindergarten', 'code' => 'K'],
            'VIC' => ['label' => 'Prep', 'code' => 'P'],
            'QLD' => ['label' => 'Prep', 'code' => 'P'],
            'WA'  => ['label' => 'Pre-primary', 'code' => 'PP'],
            'SA'  => ['label' => 'Reception', 'code' => 'R'],
            'TAS' => ['label' => 'Prep', 'code' => 'P'],
            'ACT' => ['label' => 'Kindergarten', 'code' => 'K'],
            'NT'  => ['label' => 'Transition', 'code' => 'T'],
        ];

        foreach ($foundationByState as $state => $foundation) {
            YearGroup::updateOrCreate(
                ['state_code' => $state, 'order' => 0],
                ['label' => $foundation['label'], 'code' => $foundation['code']]
            );

            for ($year = 1; $year <= 12; $year++) {
                YearGroup::updateOrCreate(
                    ['state_code' => $state, 'order' => $year],
                    ['label' => "Year {$year}", 'code' => "Y{$year}"]
                );
            }
        }
    }
}
