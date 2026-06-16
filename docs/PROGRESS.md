# eSlate — Build Progress & Process Diagrams

**As of:** 2026-05-31 · branch `trupti-dev`
**Source of truth for scope:** [`../mvp-spec.md`](../mvp-spec.md) (and `tutoring_platform_requirements_v3.docx`)

This document is a snapshot of **what has actually been built** — pages, endpoints, migrations — alongside the process flows that the current code supports. It is descriptive, not prescriptive; the spec governs intent, this file reports state.

---

## 1. Snapshot

| Layer | State |
|---|---|
| **Backend** | Laravel 11 + Sanctum at `api/`, port `8001` |
| **Database** | SQLite (`api/database/database.sqlite`) — 37 tables; postgres-shaped schema |
| **Frontend** | React + Vite + TS + Tailwind in `client/`, port `5173` |
| **Auth** | Token (Sanctum); single platform admin `admin@eslate.com / password` |
| **Public signup** | **Closed.** Tutor & company profiles are admin-created via invite |
| **Geography** | NSW only in v1 (schema is multi-state ready) |
| **Roles** | `admin`, `company_admin`, `tutor`, `student`, `parent` |

---

## 2. Domain model

```mermaid
classDiagram
    direction LR
    class User {
      +id
      +email
      +role  // admin | company_admin | tutor | student | parent
    }
    class Business {
      +id
      +type        // individual | multi_tutor
      +name, legal_name
      +state_code  // NSW only in v1
      +tier        // starter | growth | scale
      +owner_user_id
    }
    class Tutor {
      +id
      +user_id, business_id
      +status, compliance_status, wwcc_expiry
    }
    class Student {
      +id
      +business_id
      +first_name, last_name, year_group_code
    }
    class StudentParent
    class Subject
    class YearGroup
    class AcademicYear {
      +business_id, year
    }
    class AcademicTerm {
      +academic_year_id, term_number
      +start_date, end_date
    }
    class Week {
      +academic_term_id, business_id, week_number
    }
    class Course {
      +business_id, name
    }
    class CourseOffering {
      +course_id, business_id
    }
    class OfferingEnrolment
    class Classroom {
      +business_id
      +tutor_id (nullable)
      +course_offering_id (nullable)
    }
    class Assignment {
      +business_id, class_id
      +for_week, due_date, pdf_path
    }
    class Submission {
      +assignment_id, student_id
      +status, annotated_pdf
    }
    class Invitation {
      +token, business_id, kind
      +expires_at
    }
    class Waitlist {
      +email, state_code
    }
    class AuditLog
    User "1" --> "0..*" Business : owns (as company_admin)
    Business "1" --> "0..*" Tutor
    Business "1" --> "0..*" Student
    Business "1" --> "0..*" AcademicYear
    AcademicYear "1" --> "0..*" AcademicTerm
    AcademicTerm "1" --> "0..*" Week
    Business "1" --> "0..*" Course
    Course "1" --> "0..*" CourseOffering
    CourseOffering "1" --> "0..*" OfferingEnrolment
    Classroom "1" --> "0..*" Assignment
    Assignment "1" --> "0..*" Submission
    Student "1" --> "0..*" Submission
    Student "*" --> "*" StudentParent
```

**Shadow Business invariant (v3 §5):** Every tenant — *including solo tutors* — is a `businesses` row. For solo tutors `type=individual` and the row is hidden from the UI. Every owned table (academic, classes, students, …) has a non-nullable `business_id`. One tenancy path, one query pattern.

---

## 3. Process diagrams

### 3.1 Admin-led onboarding (current build)

Public signup is closed. The admin creates every profile via the **invite** flow.

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as Laravel API
    participant DB as DB
    participant O as Owner / Tutor invitee
    participant FE as Frontend

    A->>FE: /admin/companies → "Create Profile"
    FE->>API: POST /api/admin/businesses/invite\n{type, owner_email, name, state_code}
    API->>DB: insert businesses (no owner yet) + invitations(token, expires_at)
    API-->>FE: { invitation_id, business_id, token }
    FE-->>A: Shows shareable link\n/accept-invite/business?token=…

    A-->>O: Emails the link (out-of-band)
    O->>FE: Opens /accept-invite/business?token=…
    FE->>API: POST /api/onboarding/accept-business-invite\n{token, password, name}
    API->>DB: create users(role=company_admin)\nattach businesses.owner_user_id\nmark invitation used
    API-->>FE: Sanctum token + user
    FE-->>O: Routed to /company (NewCompanyDashboard)

    Note over O,FE: Owner can now invite Tutors\n(POST /api/businesses/{id}/tutors/invite)\nFlow mirrors above with kind=tutor
```

### 3.2 Login → role-based landing

```mermaid
flowchart LR
    L[/login page/] -->|POST /api/login| AUTH{Sanctum}
    AUTH -- ok --> ME[GET /api/me]
    ME --> SW{role?}
    SW -- admin --> AD[/admin → Admin Dashboard/]
    SW -- company_admin --> CO[/company → NewCompanyDashboard/]
    SW -- tutor --> TU[/tutor → TutorDashboard/]
    SW -- student --> ST[/student → NewStudentHome/]
    SW -- parent --> PA[/parent → ParentDashboard/]

    AD --> ADU[/admin/users — Users list/]
    AD --> ADC[/admin/companies — Tutors & Companies/]
    ADC --> ADD[/admin/companies/:id — Profile detail/]
    CO --> CT[/company/tutors · students · classes · timetable · courses · settings/]
```

### 3.3 Homework lifecycle (assignment → submission → marking)

```mermaid
sequenceDiagram
    participant T as Tutor
    participant S as Student
    participant API as Laravel API
    participant DB as DB

    T->>API: POST /api/assignments\n(class_id, for_week, due_date, pdf)
    API->>DB: assignments(+ pdf_path) → assignment_students(fan-out)

    Note over S: Student opens /student
    S->>API: GET /api/me/assignments
    API-->>S: list of due assignments

    S->>API: GET /api/assignments/{id}/pdf
    Note over S: Annotates on e-ink device (PWA)
    S->>API: POST /api/assignments/{id}/submissions\n(annotated PDF)
    API->>DB: submissions(status=submitted)

    T->>API: GET /api/tutor/submissions
    T->>API: PATCH /api/submissions/{id}/mark\n{score, feedback}
    API->>DB: submissions(status=marked, mark_score, feedback)
    API-->>T: 200
```

### 3.4 Tenancy model (Shadow Business)

```mermaid
flowchart TB
    subgraph SOLO[Solo tutor]
      B1[businesses<br/>type=individual<br/>name auto = First Last Tutoring]
      T1[tutors] --- B1
      ST1[students] --- B1
      CL1[classes] --- B1
    end
    subgraph MULTI[Tutoring company]
      B2[businesses<br/>type=multi_tutor]
      OWN[users.role=company_admin] --- B2
      T2a[tutors] --- B2
      T2b[tutors] --- B2
      ST2[students] --- B2
      CL2[classes] --- B2
    end
    note["Every owned row has a non-nullable business_id.<br/>UI hides 'business' chrome when type=individual."]
```

---

## 4. What's built — API surface

Routes are declared in `api/routes/api.php`. Public endpoints are limited; everything else sits behind `auth:sanctum`.

### Public
| Method | Path | Controller |
|---|---|---|
| POST | `/login` | `AuthController@login` |
| POST | `/waitlist` | `WaitlistController@store` (non-NSW capture) |
| POST | `/onboarding/accept-business-invite` | `OnboardingController` |
| POST | `/onboarding/accept-tutor-invite` | `OnboardingController` |

### Authenticated — canonical
| Area | Routes |
|---|---|
| Identity | `GET /me`, `POST /logout` |
| Tutor self-service | `POST /me/wwcc`, `GET/PATCH /me/tutor-profile` |
| State packs | `GET /state-packs/{state}/{year}`, `POST /state-packs/apply` |
| Admin onboarding | `POST /admin/businesses/invite` |
| Admin dashboard | `GET /admin/users`, `GET /admin/stats`, `PATCH /admin/users/{user}/status` |
| Business mgmt | `GET/PATCH /businesses/{id}`, `PATCH /businesses/{id}/subjects`, `POST /businesses/{id}/tutors/invite`, `POST /businesses/{id}/students` |
| Reference | `GET /subjects`, `GET /year-groups` |
| Academic | `apiResource /academic-years`, term CRUD |
| Classes | `apiResource /classes`, `/enrol`, `/students/{student}` |
| Courses | `apiResource /courses`, `/course-templates`, `/course-offerings` + enrolments |
| Assignments | `apiResource /assignments`, `/assignments/{id}/pdf`, `GET /me/assignments` |
| Submissions | `POST /assignments/{id}/submissions`, `GET /submissions`, `PATCH /submissions/{id}/mark` |

### Authenticated — legacy shim (`LegacyCompanyController`)
Compatibility layer for the existing React dashboards (originally written against the old Node/Express backend). Highlights:

- `GET /companies` · `GET /companies/{id}` ← *added 91cfef4 to fix Admin Manage button*
- `GET /companies/{id}/tutors · students · classes · audit-log · academic-hierarchy`
- `GET /admin/company-admin/{userId}` · `GET/PATCH /admin/company-settings`
- `POST /admin/create-tutor` · `POST /admin/support-contacts` · `DELETE /admin/support-contacts/{id}`
- `GET /tutor/submissions` · `GET /tutor/incomplete-homework` · `POST /tutor/remind-student`
- `POST /homework/upload-direct` · `POST /submissions/{id}/ai-check` · `GET /uploads/{name}`
- `GET /reports/types · history` · `POST /reports/run`
- `GET /company/submissions` · grade endpoints · `PATCH /students/{id}`

### Database — migrations applied
Domain tables (in dependency order):

```
users → personal_access_tokens
       → businesses → tutors → student_tutors
                   → students → student_parents · student_class_assignments
                   → business_subjects (links subjects)
                   → academic_years → academic_terms → weeks
                   → invitations · audit_log · waitlist
subjects, year_groups (reference)
courses → course_offerings → offering_enrolments → classes (course_offering_id, multi-subject via class_subjects)
course_templates → course_components (test-prep catalogue)
class_terms (pivot — class-collapse refactor)
assignments → assignment_students → submissions
```

Recent migration themes (last ~2 weeks):
- Class collapse — classes absorbed offering fields, `class_terms` pivot
- Multi-subject classes — `class_subjects`, `course_subjects` pivots
- Schedule fields on classes (+ server-side conflict detection)
- Course parent table + catalogue fields on offerings

---

## 5. What's built — Frontend page tree

Routes are defined in `client/src/App.tsx`. Pages reachable today, grouped by role:

```mermaid
flowchart LR
    subgraph PUB[Public]
      H["/ HomePage"]
      AUTH["/auth"]
      ACCB["/accept-invite/business"]
      ACCT["/accept-invite/tutor"]
      LEGAL["/legal/*"]
    end
    subgraph ADMIN
      AD["/admin Dashboard"]
      AU["/admin/users Users"]
      AC["/admin/companies Tutors & Companies"]
      ACD["/admin/companies/:id Profile detail"]
      AS["/admin/settings"]
    end
    subgraph COMPANY[Company / Owner]
      CD["/company Dashboard"]
      CT["/company/tutors Staff"]
      CS["/company/students"]
      CL["/company/classes"]
      CLD["/company/classes/:id"]
      CTT["/company/timetable"]
      CC["/company/courses"]
      CCD["/company/courses/:id"]
      CST["/company/settings"]
      CA["/company/academic"]
      CAS["/company/assignments"]
      CH["/company/homework"]
      CM["/company/marking"]
      CRP["/company/reports"]
    end
    subgraph TUTOR[Tutor]
      TD["/tutor"]
      TP["/tutor/profile"]
      TT["/tutor/tests"]
    end
    subgraph STUDENT[Student]
      SH["/student NewStudentHome"]
      SA["/student/assignments"]
      SAW["/student/assignment/:id work page"]
      SP["/student/portal"]
    end
    PARENT["/parent ParentDashboard"]
```

### Admin area — recent work
Three commits this week landed the purple admin theme + the broken-link fix:

| Commit | What |
|---|---|
| `aeed1fc` | `/admin` dashboard + `/admin/users` redesigned (purple), real endpoints |
| `ed85baf` | `/admin/companies` list reskinned to purple (clickable stat-card filters) |
| `5db6fd5` | `/admin/companies/:id` detail reskinned to purple |
| `91cfef4` | **Fix:** added missing `GET /api/companies/{id}` so Manage button no longer lands on "Company Not Found" |

---

## 6. Known gaps

These are not bugs to file — they are open work that still routes through known-missing endpoints / pages:

**Admin profile detail page** (`/admin/companies/:id`) calls four endpoints that don't exist on Laravel yet:

| Endpoint | Effect |
|---|---|
| `GET /api/companies/{id}/users` | "All Users" tab stays empty |
| `GET /api/admin/unassigned-tutors` | Unassigned-tutors assign-flow never appears |
| `PATCH /api/companies/{id}` | "Edit details" button errors |
| `PATCH /api/companies/{id}/status` | "Activate / Deactivate" button errors |
| `PATCH /api/companies/{id}/assign-tutor/{tutorId}` | Assign button errors |
| `POST /api/admin/create-user` · `PATCH/DELETE /api/admin/users/{id}` | In-detail user CRUD errors |

**Deferred / planned (per memory):**

- **Auto-create parent accounts** when students get parent contacts, so parents can view kid's progress.
- **Tutor hire, availability, assignment** — operational model for hiring tutors, capturing availability, matching to classes; partly built but significant scope remaining.

**Other:**

- The repo has ~326 pre-existing TypeScript errors (mostly in legacy pages and `client/src/types`); current admin work introduces zero new ones.
- `businesses` table has no `description`, `contact_phone`, `address`, or `is_active` columns yet — the new `showCompany` endpoint returns empty strings for those fields and mirrors `isActive` from `hasOwner` as a placeholder.

---

## 7. Local dev (reproducer)

```powershell
# 1. Laravel API on :8001
& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" `
   C:\NT\eSlate\api\artisan serve --host=127.0.0.1 --port=8001

# 2. Vite frontend on :5173 (from project root, NOT api/)
npx vite --port 5173 --host 127.0.0.1
```

Admin login: `admin@eslate.com` / `password`.
Reset DB: `php artisan migrate:fresh --seed` (stop the API server first — SQLite file lock).
