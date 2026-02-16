# Overview

eSlate is a secure educational platform designed for e-ink devices and high-contrast displays. It functions as a comprehensive learning management system supporting students, parents, tutors, and administrators. Key features include homework management, real-time messaging, progress tracking, and calendar scheduling, all optimized for accessibility and readability on e-ink displays. The platform aims to provide a robust and inclusive educational experience.

## Security Features
The platform includes comprehensive security hardening:
- **Rate Limiting**: Login attempts limited to 5 per 15-minute window per email. After 5 failed attempts, account is locked for 15 minutes. Uses `login_attempts` DB table.
- **CSRF Protection**: Token-based CSRF protection via `/api/auth/csrf-token` endpoint. Tokens stored in session.
- **Security Headers**: X-Content-Type-Options, X-Frame-Options (DENY), X-XSS-Protection, Referrer-Policy, Permissions-Policy, Strict-Transport-Security, Content-Security-Policy.
- **Audit Logging**: All mutating API calls (POST/PATCH/PUT/DELETE) logged to `audit_logs` table with userId, action, IP address, user agent, status, and timestamp. Login/logout events explicitly logged. Viewable by admins at GET `/api/admin/audit-logs`.
- **Security Files**: `server/security.ts` contains rate limiting, CSRF, security headers, and audit logging middleware.

## AI Features (Powered by Google Gemini)
The platform includes AI-powered features using Google Gemini (free tier) to enhance the learning experience:
- **AI Question Generator** (Tutors): Generate multiple questions at once in WorksheetEditor
- **AI Grading Assistant** (Tutors): Get draft feedback and scoring suggestions for essay/short-answer questions
- **Smart Hint System** (Students): Progressive hints (3 levels) with parent-configurable controls
- **Parent AI Controls**: Parents can enable/disable AI hints for their children via Settings in Parent Dashboard

## Calendar and Attendance System
Comprehensive calendar and attendance tracking with role-specific views:

### Database Schema
- **class_sessions**: Individual class instances with date, time, status, and delivery mode
- **session_attendance**: Attendance records (present/absent/late/excused) with tutor remarks
- **academic_holidays**: Public and company-specific holidays

### Role-Specific Features
- **Company Admin**: Roll-call control panel, all classes overview, attendance override, tutor/class filters
- **Tutor**: Daily agenda, quick roll-call, bulk attendance marking, "Mark All Present", student roster with capacity indicators
- **Student**: Weekly schedule, attendance summary cards, per-subject breakdown, learning hours tracking
- **Parent**: Child's calendar view, attendance visibility with tutor remarks, class time summary

### API Endpoints
- `/api/calendar/company|tutor|student|parent` - Role-specific calendar data
- `/api/sessions/*` - Session CRUD and attendance management
- `/api/attendance/*` - Attendance marking, override, and summaries
- `/api/holidays` - Holiday management

### Frontend Components
Located in `client/src/components/calendar/`:
- `RoleCalendar.tsx` - Shared calendar with weekly/monthly/term views
- `TutorCalendarDashboard.tsx` - Tutor's calendar with attendance sheet
- `StudentCalendarDashboard.tsx` - Student's calendar with attendance summary
- `ParentCalendarDashboard.tsx` - Parent's view of child's calendar
- `CompanyCalendarDashboard.tsx` - Company admin's roll-call view

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is a React and TypeScript application using a component-based architecture.
- **UI Framework**: shadcn/ui components with Radix UI primitives, optimized for e-ink devices with high-contrast (pure black and white) colors.
- **Routing**: Wouter for lightweight client-side routing with role-based redirects.
- **State Management**: TanStack Query for server state, React hooks for local component state.
- **Styling**: Tailwind CSS with custom e-ink optimized design tokens.
- **Build System**: Vite for fast development and optimized production builds.

## Backend Architecture
Built with Express.js and TypeScript, providing a RESTful API.
- **Authentication**: Replit's OpenID Connect (OIDC) integration with Passport.js.
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple.
- **API Design**: RESTful endpoints organized by feature domain (assignments, submissions, messages, progress, calendar events, academic management) with consistent error handling. Company admin endpoints use `/api/admin/company-admin/` structure.
- **Real-time Communication**: WebSocket integration for live messaging.

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe operations and schema management.
- **Database Schema**: Comprehensive relational model supporting user management (student, parent, tutor, company_admin, admin), tutoring company management, assignment/submission tracking, real-time messaging, progress tracking, and calendar events.
- **Schema Management**: Drizzle Kit for database migrations.
- **Object Storage**: Google Cloud Storage (GCS) via Replit Object Storage integration for persistent file uploads (homework submissions, assignment attachments). Files stored at `{privateDir}/uploads/{fileId}`.

## PDF Annotation System
- **PDF.js**: PDF rendering with locally bundled worker (not CDN) for reliability
- **Fabric.js**: Canvas-based annotation layer for drawing tools
- **Student Tools**: Pen, highlighter, eraser, text for completing assignments
- **Reviewer Tools**: Tick (✓), cross (✗), comment, freehand marking for tutors/admins

## Authentication and Authorization
- **Primary Authentication**: Replit OIDC.
- **Session Management**: Server-side sessions stored in PostgreSQL.
- **Role-Based Access**: Five distinct user roles (Students, Parents, Tutors, Company Admins, System Admins) with tailored permissions and dashboard experiences.
- **Security Features**: HTTPS enforcement, secure cookie settings, and CSRF protection.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database operations.

## Authentication Services
- **Replit Auth**: OpenID Connect provider.
- **Passport.js**: Authentication middleware.

## Frontend Libraries
- **React**: Core UI framework.
- **TanStack Query**: Server state management.
- **Wouter**: Client-side routing.
- **Radix UI**: Accessible primitive components.
- **shadcn/ui**: Pre-built component library.
- **Tailwind CSS**: Utility-first CSS framework.

## Development Tools
- **Vite**: Build tool.
- **TypeScript**: Type safety.
- **ESBuild**: Production bundling for server code.

## Runtime Environment
- **Node.js**: Server runtime.
- **WebSocket**: Real-time communication protocol.
- **Express.js**: Web application framework.

## UI/UX Dependencies
- **Lucide React**: Icon library.
- **date-fns**: Date manipulation.
- **class-variance-authority**: Type-safe component variants.
- **clsx**: Conditional CSS class management.