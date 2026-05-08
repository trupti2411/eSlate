# eSlate MVP Spec — Australian K-12 Tutoring on E-Ink

**Status:** DRAFT — pending sign-off. Edit this file directly to change scope.

## Vision
A homework platform for Australian tutors (solo or business-employed) and their K-12 students. Students complete homework on e-ink devices (Boox, reMarkable, Bigme, Kindle Scribe, etc.) by writing directly on PDF assignments and submitting them back to their tutor.

## Target devices
- **Primary install path:** PWA via "Add to Home Screen" (works on any e-ink browser)
- **No native wrapper for v1.** Boox APK / Capacitor possible later.

## Tech stack
| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind (existing `client/` — kept as-is) |
| Backend | **Laravel 11 (PHP 8.4)** — new, located at `C:\NT\eSlate\api\` |
| Database | PostgreSQL (matches existing Neon setup) |
| Auth | Laravel Sanctum (token-based) — replaces Replit OIDC |
| File storage | Local disk for v1; S3 / GCS later |
| WebSockets | Out for v1 |
| AI grading | Out for v1 |

## Roles (4)
```
Admin                       — platform operator (you)
  └── Business               — tutoring company; OPTIONAL (solo tutors have no business)
        └── Tutor             — assigns homework, marks submissions
              └── Student      — receives homework, writes on e-ink, submits
```

- **Solo tutor** = Tutor with `business_id = NULL`. Has their own academic structure.
- **Business** = multi-tutor tenant. Owns its own academic calendar, classes, students.

## Education scope
- **K through Year 12 only.** No early childhood, no TAFE, no university.
- **Australian states:** NSW, VIC, QLD, WA, SA, TAS, ACT, NT.
- **One business = one state** for v1. Multi-state later.
- Foundation year label is state-driven (Kindergarten / Prep / Reception / Pre-primary / Transition).

## Academic structure
```
TIME (calendar)
  AcademicYear (e.g. 2026, owned by Business or solo Tutor)
    └── Term (1-4, dates)
          └── Week (auto-generated from term dates)

PEOPLE / SUBJECTS
  YearGroup     — reference table seeded per state (K/Prep/etc → Year 12)
  Subject       — global preset list (Math, English, Science, ...); business can hide unused

  Class = YearGroup × Subject × Tutor
    e.g. "Year 7 Math (Mr Smith)"
    enrolled students via student_class_assignments

WORK
  Assignment    — targets a Class OR specific Student(s); tagged for_week; due_date; PDF file
  Submission    — per student per assignment; annotated PDF; status (draft/submitted/marked)
```

## Onboarding

> **Source of truth:** `tutoring_platform_requirements_v3.docx` (in `Downloads/`). This section is the v1 build summary; the docx is canonical for tenancy, state-packs, week generation, WWCC, tier limits, and edge cases. **v1 scope: AU / NSW only.** Schema is multi-state ready; non-NSW data is not shipped in v1.

### Tenancy — Shadow Business model
**Every tenant is a `businesses` row, including solo tutors.** For Individuals the row is silently created on signup and never surfaced as "a business" in the UI (`businesses.type = individual`, name auto-set to `{First} {Last} Tutoring`, logo/legal_name/ABN hidden). Multi-tutor companies show standard business UI (`type = multi_tutor`).

Every owned table — `academic_years`, `academic_terms`, `weeks`, `classes`, `students`, `business_subjects` — has a **non-nullable `business_id` FK**. One tenancy path, one query pattern, one permissions model. The Individual ↔ Multi-tutor distinction is a UI concern controlled by `businesses.type`.

**Conversion:** `individual → multi_tutor` flips `type` and prompts for the previously hidden fields (logo, legal_name, ABN required). Reverse is allowed only when exactly one active tutor remains.

### Pre-flight country / state gate (per v3 §5.1)
All signup paths first present country, then state:
- **Country = Australia, State = NSW** → proceeds to Path A or B.
- **Country = Australia, State ≠ NSW** → "We're launching in NSW first — we'll let you know when {state} is ready" page; captures `email` + `state` to the **`waitlist`** table; signup does **not** complete (no `users` / `businesses` / `tutors` row created).
- **Country ≠ Australia** → "Available in Australia only" page; **no waitlist capture, no entities created.**

### Path A — Multi-tutor (Company)
| # | Step | Entity creates / writes | Endpoint |
|---|---|---|---|
| 1 | Admin invites company | `businesses` (type=multi_tutor, state locked, owner_email), invite token | `POST /api/admin/businesses/invite` |
| 2 | Owner accepts invite, sets password | `users` (role=owner) | `POST /api/onboarding/accept-business-invite` |
| 3 | Owner reviews/edits state defaults | `academic_years` (with `pack_version`), 4 `academic_terms` (with `is_manually_edited` flag), weeks | `POST /api/state-packs/apply` |
| 4 | Owner toggles active subjects | `business_subjects` | `PATCH /api/businesses/{id}/subjects` |
| 5 | Owner sets profile | `businesses` (logo, timezone default Australia/Sydney, currency default AUD, ABN required) | `PATCH /api/businesses/{id}` |
| 6 | Owner invites tutor(s) | `users` (role=tutor, status=invited), `tutors` (business_id, status=pending_compliance) | `POST /api/businesses/{id}/tutors/invite` |
| 7 | Tutor accepts, captures WWCC + profile | `users` activated, `tutors` (WWCC, qualifications, bio, hourly_rate); status → active when WWCC validated | `POST /api/onboarding/accept-tutor-invite` |
| 8 | Tutor creates classes → enrols students | `classes`, `students`, `student_class_assignments`, `student_tutors` | (post-onboarding) |

### Path B — Individual (Solo Tutor)
| # | Step | Entity creates / writes | Endpoint |
|---|---|---|---|
| 1 | Self-register (after pre-flight passes country=AU + state=NSW) — form: name, email, password, suburb, postcode | `users` (role=tutor, is_owner=true), **`businesses` (type=individual, hidden, name=`{First} {Last} Tutoring`)**, `tutors` (business_id set) | `POST /api/register` |
| 2 | WWCC capture (mandatory before classes) | `tutors` (wwcc_number encrypted, wwcc_expiry, wwcc_state, compliance_status) | `POST /api/me/wwcc` |
| 3 | Accept state defaults | same as Path A step 3 | `POST /api/state-packs/apply` |
| 4 | Toggle active subjects | `business_subjects` | `PATCH /api/businesses/{id}/subjects` |
| 5 | Set teaching profile | `tutors` (subjects, year_levels, delivery_modes, hourly_rate, bio) | `PATCH /api/me/tutor-profile` |
| 6 | Create classes → enrol students | as above | (post-onboarding) |

### State pack
**v1 ships the NSW pack only.** Schema and apply-logic are state-agnostic; adding VIC/QLD/etc. later is a content task (drop another JSON in), not an engineering task.

One JSON per state per version, committed to the repo:

`api/resources/academic-calendars/{state_code}-v{n}.json`

Top-level fields (per v3 §4.2): `state_code`, `state_name`, `pack_version`, `effective_from`, `foundation_year_label`, `year_groups[]`, `academic_year{}`, `public_holidays[]`, `subjects[]`.

**NSW data sources (manual refresh, October–November each year):**
- Term dates: `education.nsw.gov.au/schooling/calendars`
- Public holidays: `data.gov.au` machine-readable holidays dataset (filter to NSW) — scriptable annual refresh
- Subjects: NSW Education Standards Authority (NESA) curriculum list

**Why not live-scrape at signup time?** State sites publish HTML, not stable APIs. ~14 dates per year per state is small enough that hand-curated JSON refreshed annually is more reliable than a fragile scraper hit on every signup.

**Apply service:** `StatePackApplier::apply(string $state_code, int $year, Business $owner)` — reads JSON, creates `academic_years` (stamps `pack_version`) + `academic_terms`, runs `WeekGenerator` per term. Idempotent on `(business_id, year)`. Annual refresh job for next year **skips any business with `is_manually_edited=true` on its terms** — defaults, not overrides.

### Week generation (per v3 §6)
- Weeks run Monday–Sunday.
- Week 1 starts on the first Monday on/after the term's `start_date`.
- If the term starts mid-week, week 1 is **partial** (`is_partial=true`, `start_dow` = actual day); the following Monday begins week 2.
- The final week may also be partial.
- Public holidays from the state pack are **flagged on the containing week, not skipped** — each week carries `public_holidays[]`.
- Pupil-free days (state-specific staff development days) stored as a separate `pupil_free_days[]` field on the week.

### Compliance — WWCC (per v3 §8)
Mandatory for any tutor before being assigned to a class involving minors.

- **Captured fields:** `wwcc_number` (encrypted at rest), `wwcc_expiry`, `wwcc_state`, `compliance_status` ∈ {`compliant`, `pending_compliance`, `compliance_hold`}.
- **Validation:** number format per issuing state; `wwcc_expiry` ≥ 30 days in future at point of capture.
- **Reminders:** email tutor + Owner at 30, 14, 7 days before expiry.
- **On expiry day:** `compliance_status` → `compliance_hold` automatically; tutor cannot be assigned to new classes; existing scheduled future sessions flagged in UI but not auto-cancelled (Owner decides).

### Registration policy

| Role | How they get an account |
|---|---|
| Admin | Seeded; no public registration |
| Owner (multi_tutor) | Admin invite only |
| Tutor (in a business) | Owner invite |
| Tutor (solo / individual owner) | Self-register at `/api/register` |
| Student | Tutor or Owner enrols them; password-reset email sent |

> **Spec change vs current code:** the `AuthController` row in the Endpoints table previously read "register (admin-invite only)". With Path B, open self-registration is allowed but **only for `role=tutor` with `is_owner=true`** (creates a hidden `individual` business). The controller must 403 attempts to self-register as admin / owner / student.

### New endpoints (≈8 added by onboarding)

| Method | Path | Used by |
|---|---|---|
| POST | `/api/admin/businesses/invite` | Path A step 1 |
| POST | `/api/onboarding/accept-business-invite` | Path A step 2 |
| POST | `/api/businesses/{id}/tutors/invite` | Path A step 6 |
| POST | `/api/onboarding/accept-tutor-invite` | Path A step 7 (with WWCC) |
| POST | `/api/me/wwcc` | Path B step 2 |
| GET | `/api/state-packs/{state}/{year}` | Both — preview before apply |
| POST | `/api/state-packs/apply` | Both |
| PATCH | `/api/businesses/{id}/subjects` | Both — toggle active subjects |

### What "clean onboarding" means here
- **One topic per step**, no megaforms — user can quit and resume mid-flow via invite tokens + `users.onboarding_state` ∈ {`invited`, `password_set`, `wwcc_captured`, `calendar_applied`, `complete`}.
- **State defaults are visible and editable** before they're written — owner reviews and can adjust dates; edits set `is_manually_edited=true` so the annual refresh skips them.
- **Idempotent state-pack apply** — re-applying for the same `(business_id, year)` is a no-op.
- **No business-only flows leak into the solo path** — Path B never sees logo/ABN/tutor-invite UI; the hidden `businesses` row exists only at the data layer.

### Subscription tier enforcement (per v3 §9)

Enforced at the **service / data layer** (UI is defence-in-depth only).

| Tier | Tutor cap |
|---|---|
| Individual (free) | **1** — the Owner only; hard cap at the data layer |
| Starter | up to 5 |
| Pro | up to 20 |
| Enterprise | unlimited (fair-use) |

- Service rejects tutor-creation that would exceed the current tier; returns a clear error code so the UI can surface an upgrade prompt.
- `Individual → Multi-tutor` conversion defaults the new business to **Starter**; Owner confirms before adding more tutors.
- Tier downgrade with tutors above new cap: existing tutors are retained but go **archive-only** (no new assignments). Owner must archive enough tutors to fit the new cap.
- Tier-limit rejections are logged for product analytics.

### Resolved (per v3 §1.2 — formerly v2 open questions)

| Question | v3 decision |
|---|---|
| `student_tutors.is_primary` scope | **Per-student-per-subject** — `subject_id` is a required FK on `student_tutors`; at most one row per `(student_id, subject_id)` may have `is_primary=true`. |
| Owner transfer in v1 | **Deferred to v2.** Manual handling via Platform Admin in v1. |
| International / non-AU tutors | **Blocked at signup** (no waitlist capture). |
| Non-NSW Australian tutors | **Allowed to sign up; tagged `waitlist` status, state captured.** Full functionality NSW only. |
| Tier limit enforcement | **Service / data layer + UI defence-in-depth.** Individual hard-capped at 1 tutor. |
| Custom subject promotion | **Logged for Platform Admin review.** Manual promotion only — no auto-promote. `business_subjects` carries a `name_normalized` field (lowercased, trimmed) for grouping; Admin sees aggregated counts per state. |
| Student date of birth | **DOB optional; `year_group_code` required and selected directly.** When DOB is present, UI suggests a year group via the NSW age-to-year mapping (1 July cutoff); user choice always wins. |

## Tutor flow
1. Set up academic year + terms (or accept state defaults)
2. Create classes (Year 7 Math, Year 8 English, …)
3. Enrol students into classes
4. Pick a class + week → upload PDF → assign
5. View submissions → mark with tick/cross/comment

## Student flow (e-ink)
1. Open PWA → login (email + password)
2. "This week" view — list of assignments due this week
3. Tap assignment → PDF opens with annotation tools
4. Write/draw answers → submit
5. View marked work when tutor returns it

## Permissions
| Action | Admin | Business | Tutor | Student |
|---|---|---|---|---|
| Manage all businesses | ✓ | | | |
| Manage tutors in own business | | ✓ | | |
| Create/edit own academic year/terms/classes | | ✓ | ✓ (solo only) | |
| Assign tutors to classes | | ✓ | | |
| Enrol students | | ✓ | ✓ | |
| Create assignments | | | ✓ | |
| Mark submissions | | | ✓ | |
| View own assignments + submit | | | | ✓ |

## Tables (~17)

Under the Shadow Business model, every owned entity has a non-nullable `business_id` FK.

1. `users` — base auth (email, password_hash, role ∈ {admin, owner, tutor, student}, is_owner)
2. `businesses` — every tenant including solo tutors; **`type` ∈ {individual, multi_tutor}**, state_code (always 'NSW' in v1), name, legal_name, logo, abn, timezone, currency, **`tier`** ∈ {individual, starter, pro, enterprise}, pack_version
3. `tutors` — links to user; **`business_id` NOT NULL**; WWCC fields (wwcc_number encrypted, wwcc_expiry, wwcc_state, compliance_status), qualifications, hourly_rate, bio, delivery_modes, year_levels[]
4. `students` — `business_id` NOT NULL; `user_id` nullable (record-only profiles allowed); first_name, last_name, **`year_group_code` required**, **`date_of_birth` optional** (suggests year group via NSW age-to-year mapping when present), school, learning_goals, **`special_needs_notes` encrypted at rest**, status ∈ {active, inactive, archived}
5. `student_tutors` — join with **per-subject primary scope**: `business_id`, `student_id`, `tutor_id`, **`subject_id` (required)**, `is_primary`, `started_at`, `ended_at`. Unique constraint: at most one row per `(student_id, subject_id)` may have `is_primary=true`.
6. `subjects` — global master list, populated by state packs; never deleted retroactively; scoped by `state_code` + year levels
7. `business_subjects` — toggle table per business; supports custom subjects (custom rows have `business_id` set, `state_code = NULL`); carries `name_normalized` for Platform Admin grouping/promotion review
8. `year_groups` — reference list per state, seeded from packs (NSW: K, 1–12)
9. `academic_years` — `business_id` NOT NULL, year, state_code (always 'NSW' in v1), **`pack_version`**, status ∈ {draft, active, archived}
10. `academic_terms` — belongs to academic_year, term_number 1–4, **`is_manually_edited`** flag
11. `weeks` — belongs to term; `is_partial`, `start_dow`, `public_holidays[]`, `pupil_free_days[]`
12. `classes` — `business_id`, tutor_id, year_group, subject
13. `student_class_assignments` — student ↔ class join
14. `assignments` — PDF, target (class or students), week, due_date
15. `submissions` — student × assignment + annotated PDF + status
16. `audit_log` — onboarding-step events (actor, timestamp, entity ids), compliance status transitions, **tier-limit rejections** (for product analytics)
17. `waitlist` — non-NSW Australian signup capture: `email`, optional names, `country` (Australia), `state` ∈ {VIC, QLD, SA, WA, TAS, ACT, NT}, `intended_role` ∈ {individual_tutor, multi_tutor_owner, other}, `created_at`, `notified_at` (set when state launches)

## Endpoints (~40 across 7 controllers)
| Controller | Endpoints | Notes |
|---|---|---|
| `AuthController` | 5 | login, logout, register (open for solo tutors only — 403 otherwise), me, refresh |
| `AdminController` | 6 | list/create/update businesses, list users |
| `BusinessController` | 8 | manage tutors, students, academic structure |
| `AcademicController` | 7 | years, terms, weeks, classes |
| `ClassController` | 4 | enrol/unenrol students |
| `AssignmentController` | 6 | CRUD + assign-to-class/students |
| `SubmissionController` | 6 | upload, list (tutor view), mark, return |

## Out of scope for v1 (explicitly cut)
- Parent role + parent dashboard
- Real-time messaging / WebSockets
- Calendar with events / class sessions
- Attendance tracking
- AI hints / AI grading / AI question generation
- Worksheets-as-questions, Tests / test attempts
- Reports / notification preferences (audit log of onboarding events is **in** — see Tables §16)
- Billing, invoicing, payment processing (per v2 §1.4)
- Multi-state businesses
- ACARA curriculum code mapping
- Object storage on cloud (use local disk for v1)
- Native APK / iOS / Capacitor wrappers

## Migration approach
Old Node/Express server (`server/`) stays untouched. New Laravel API built fresh in `api/`. Frontend stays in `client/` and switches its API base URL when ready.

## What already exists in eSlate today

The frontend (`client/`) has more features built than the MVP backend would cover. Here's the full inventory and the proposed disposition for each:

### Already built — frontend pages
| Area | Files | MVP disposition |
|---|---|---|
| **Auth & landing** | `Landing.tsx`, `PitchPage.tsx`, `auth-page.tsx`, `simple-registration.tsx`, `ContactUs.tsx` | **Keep** auth; marketing pages can stay (no backend dep) |
| **Student dashboards** | `Dashboard.tsx`, `Dashboard_old.tsx`, `NewStudentDashboard.tsx`, `StudentHome.tsx`, `StudentPortal.tsx` | **Keep** new + classic; remove `_old` after v1 |
| **Student work** | `AssignmentWorkPage.tsx`, `HomeworkSubmissions.tsx`, `WorksheetWorkPage.tsx`, `StudentWorksheets.tsx` | Keep assignment + submission pages. **Hide** worksheet pages until phase 2 |
| **PDF annotation** | `PDFAnnotatorPage.tsx`, `DocumentAnnotatorPage.tsx`, `UniversalDocumentAnnotator.tsx`, `GoogleDocsAnnotatorPage.tsx`, `GoogleDocsViewer.tsx` | **Keep all** — this is the e-ink writing surface, the most valuable asset |
| **Tutor** | `tutor/Dashboard.tsx` (sparse — most tutor features live under `company/`) | **Keep**, may need to grow |
| **Company / business admin** | `HomeworkManagement.tsx`, `MarkingPage.tsx`, `NewTutorDashboard.tsx`, `Reports.tsx`, `SubmittedHomework.tsx`, `TutorDashboard.tsx` | Keep marking + homework + submitted views. **Hide** Reports until phase 7 |
| **Platform admin** | `Dashboard.tsx`, `Companies.tsx`, `CompanyManagement.tsx`, `CompanyStudents.tsx`, `CompanyDashboard.tsx`, `UserManagement.tsx`, `Users.tsx`, `Settings.tsx`, `TestUserCreation.tsx` | **Keep** all — needed for v1 admin |
| **Academic management** | `AcademicManagement.tsx`, `CompanyAcademicManagement.tsx` | **Keep** — matches MVP year/term/week/class scope |
| **Worksheets authoring** | `WorksheetEditorPage.tsx`, `WorksheetManagement.tsx`, `WorksheetManagementPage.tsx` | **Hide via route guard** until phase 2 |
| **Tests** | `pages/tests/`, `WorksheetEditorPage.tsx` flows | **Hide** until phase 3 |
| **Parent** | `parent/Dashboard.tsx`, `NewParentDashboard.tsx` | **Hide** — parent role cut from v1 |
| **Calendar** | `components/calendar/` | **Hide** — calendar/attendance cut from v1 |
| **Previews / dev pages** | `EinkPreview.tsx`, `TabletPreview.tsx`, `DesignPreview.tsx`, `SwitchPreview.tsx`, `AssignmentPreview.tsx`, `VideoStoryboard.tsx` | **Keep** — useful for testing |

### Already built — backend (Node, will be ported to Laravel)
- 181 endpoints across `server/routes.ts` (will port subset matching MVP)
- 36 PostgreSQL tables (porting subset of ~13)
- Replit OIDC auth + Passport.js (replacing with Sanctum email/password)
- WebSocket messaging (cut from v1)
- Three-engine AI cascade Gemini → Groq → GPT-4o (cut from v1)
- Google Cloud Storage for uploads (replaced with local disk for v1)
- Audit logging, rate limiting, CSRF, security headers (port equivalents in Laravel — Sanctum + middleware)

### Dual-design system in client/
The codebase has BOTH classic dashboards (`Dashboard.tsx`) and new role-coloured dashboards (`NewStudentDashboard.tsx` indigo, `NewParentDashboard.tsx` rose, `NewTutorDashboard.tsx` teal), with a `localStorage` toggle. **Keep both for v1.** Don't delete the old ones — let users switch.

### Existing assets that survive untouched
- `attached_assets/` — design references / mockups
- `eslate_backup.sql` — reference for current data shape
- `replit.md` — original project doc; keep as historical context, supersede with this spec
- `video-scripts.md` — marketing scripts; irrelevant to backend port
- `tailwind.config.ts`, `components.json` — UI tokens incl. e-ink optimisation; keep

## Frontend cleanup needed before backend port
To prevent frontend showing screens with no working backend, before/during Phase 1:
1. Add a **feature flag system** (`client/src/lib/features.ts`) with flags: `worksheets`, `tests`, `parents`, `calendar`, `messaging`, `ai`, `reports` — all `false` for v1
2. Gate routes in `App.tsx` so disabled features redirect to a "Coming soon" page
3. Hide nav links for disabled features in dashboard layouts

This is ~1 day of work and lets us ship v1 without breaking screens. No code deleted.

## Open items
None — all defaults frozen. Edit this file to change anything, then say "go".
