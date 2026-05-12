<?php

use App\Http\Controllers\AcademicTermController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\CourseOfferingController;
use App\Http\Controllers\CourseTemplateController;
use App\Http\Controllers\LegacyCompanyController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\StatePackController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\WaitlistController;
use App\Http\Controllers\YearGroupController;
use Illuminate\Support\Facades\Route;

// Public — no auth required
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/waitlist', [WaitlistController::class, 'store']);   // non-NSW AU signup capture (v3 §5.1)
Route::post('/onboarding/accept-business-invite', [OnboardingController::class, 'acceptBusinessInvite']);
Route::post('/onboarding/accept-tutor-invite', [OnboardingController::class, 'acceptTutorInvite']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Onboarding — self-service for the authenticated tutor (v3 Path B steps 2 + 5; §8 WWCC)
    Route::post('/me/wwcc', [OnboardingController::class, 'captureWwcc']);
    Route::get('/me/tutor-profile', [OnboardingController::class, 'showTutorProfile']);
    Route::patch('/me/tutor-profile', [OnboardingController::class, 'updateTutorProfile']);

    // State packs (v3 §4 + Path A step 3 / Path B step 3)
    Route::get('/state-packs/{state}/{year}', [StatePackController::class, 'show']);
    Route::post('/state-packs/apply', [StatePackController::class, 'apply']);

    // Path A — Multi-tutor onboarding (v3 §5.2)
    Route::post('/admin/businesses/invite', [AdminController::class, 'inviteBusiness']);
    Route::get('/businesses/{id}', [BusinessController::class, 'show']);
    Route::patch('/businesses/{id}', [BusinessController::class, 'update']);
    Route::patch('/businesses/{id}/subjects', [BusinessController::class, 'updateSubjects']);
    Route::post('/businesses/{id}/tutors/invite', [BusinessController::class, 'inviteTutor']);
    Route::post('/businesses/{id}/students', [BusinessController::class, 'addStudent']);

    // Reference data
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/year-groups', [YearGroupController::class, 'index']);

    // Academic structure
    Route::apiResource('academic-years', AcademicYearController::class);
    Route::post('/academic-years/{academicYear}/terms', [AcademicTermController::class, 'store']);
    Route::patch('/academic-terms/{term}', [AcademicTermController::class, 'update']);
    Route::delete('/academic-terms/{term}', [AcademicTermController::class, 'destroy']);

    // Classes
    Route::apiResource('classes', ClassroomController::class)->parameters(['classes' => 'class']);
    Route::post('/classes/{class}/enrol', [ClassroomController::class, 'enrol']);
    Route::delete('/classes/{class}/students/{student}', [ClassroomController::class, 'unenrol']);

    // Course catalogue (test-prep)
    Route::get('/course-templates', [CourseTemplateController::class, 'index']);
    Route::get('/course-templates/{template}', [CourseTemplateController::class, 'show']);
    Route::get('/course-templates/{template}/components', [CourseTemplateController::class, 'components']);

    Route::get('/course-offerings', [CourseOfferingController::class, 'index']);
    Route::post('/course-offerings', [CourseOfferingController::class, 'store']);
    Route::get('/course-offerings/{offering}', [CourseOfferingController::class, 'show']);
    Route::patch('/course-offerings/{offering}', [CourseOfferingController::class, 'update']);
    Route::delete('/course-offerings/{offering}', [CourseOfferingController::class, 'destroy']);
    Route::post('/course-offerings/{offering}/enrolments', [CourseOfferingController::class, 'enrol']);
    Route::delete('/course-offerings/{offering}/enrolments/{enrolment}', [CourseOfferingController::class, 'withdraw']);

    // Student-facing
    Route::get('/me/assignments', [AssignmentController::class, 'myAssignments']);

    // Assignments (tutor-facing)
    Route::apiResource('assignments', AssignmentController::class);
    Route::get('/assignments/{assignment}/pdf', [AssignmentController::class, 'downloadPdf']);

    // Submissions
    Route::post('/assignments/{assignment}/submissions', [SubmissionController::class, 'submit']);
    Route::get('/submissions', [SubmissionController::class, 'index']);
    Route::get('/submissions/{submission}', [SubmissionController::class, 'show']);
    Route::get('/submissions/{submission}/pdf', [SubmissionController::class, 'downloadPdf']);
    Route::patch('/submissions/{submission}/mark', [SubmissionController::class, 'mark']);

    // Legacy compatibility shim for existing React dashboards
    Route::get('/admin/company-admin/{userId}', [LegacyCompanyController::class, 'companyAdmin']);
    Route::get('/tutor/submissions', [LegacyCompanyController::class, 'tutorSubmissions']);
    Route::get('/tutor/incomplete-homework', [LegacyCompanyController::class, 'incompleteHomework']);
    Route::get('/companies/{companyId}/students', [LegacyCompanyController::class, 'companyStudents']);
    Route::get('/companies/{companyId}/classes', [LegacyCompanyController::class, 'companyClasses']);
    Route::get('/companies/{companyId}/audit-log', [LegacyCompanyController::class, 'companyAuditLog']);
    Route::post('/homework/upload-direct', [LegacyCompanyController::class, 'uploadDirect']);
    Route::post('/tutor/remind-student', [LegacyCompanyController::class, 'remindStudent']);
    Route::patch('/tutor/submissions/{submission}/grade', [LegacyCompanyController::class, 'gradeSubmission']);
    Route::post('/submissions/{submission}/ai-check', [LegacyCompanyController::class, 'aiCheckSubmission']);
    Route::get('/uploads/{name}', [LegacyCompanyController::class, 'downloadUpload']);

    // Classic dashboard additions
    Route::get('/companies', [LegacyCompanyController::class, 'listCompanies']);
    Route::get('/companies/{companyId}/tutors', [LegacyCompanyController::class, 'companyTutors']);
    Route::get('/companies/{companyId}/academic-hierarchy', [LegacyCompanyController::class, 'companyAcademicHierarchy']);
    Route::get('/admin/company-settings', [LegacyCompanyController::class, 'companySettings']);
    Route::patch('/admin/company-settings', [LegacyCompanyController::class, 'updateCompanySettings']);
    Route::get('/admin/support-contacts', [LegacyCompanyController::class, 'supportContacts']);
    Route::post('/admin/support-contacts', [LegacyCompanyController::class, 'addSupportContact']);
    Route::delete('/admin/support-contacts/{contactId}', [LegacyCompanyController::class, 'removeSupportContact']);
    Route::post('/admin/create-tutor', [LegacyCompanyController::class, 'createTutor']);
    Route::get('/reports/types', [LegacyCompanyController::class, 'reportTypes']);
    Route::get('/reports/history', [LegacyCompanyController::class, 'reportHistory']);
    Route::post('/reports/run', [LegacyCompanyController::class, 'runReport']);
    Route::get('/company/submissions', [LegacyCompanyController::class, 'companySubmissions']);
    Route::patch('/company/submissions/{submission}/grade', [LegacyCompanyController::class, 'gradeSubmission']);
    Route::patch('/submissions/{submission}/reviewer-annotations', [LegacyCompanyController::class, 'reviewerAnnotations']);
    Route::patch('/students/{student}', [LegacyCompanyController::class, 'updateStudent']);
});
