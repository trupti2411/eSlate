<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_templates', function (Blueprint $table) {
            $table->id();
            $table->string('state_code', 3);                                   // NSW only in v1; schema is state-aware
            $table->string('year_group_code', 10);                             // K, 1..12
            $table->string('kind', 20);                                        // foundations | theory | mock_tests
            $table->string('test_alignment', 30)->nullable();                  // oc | selective | naplan_y3/5/7/9 | null (general)
            $table->string('code', 40)->unique();                              // stable identifier e.g. nsw_y4_oc_wemt
            $table->string('name', 120);
            $table->string('short_name', 40);
            $table->text('description')->nullable();
            $table->integer('sort_order');
            $table->string('pack_version', 20);                                // seed version stamp
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['state_code', 'year_group_code', 'kind', 'test_alignment'], 'course_templates_state_year_kind_align_unique');
            $table->index(['state_code', 'year_group_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_templates');
    }
};
