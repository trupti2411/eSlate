# Overview

eSlate is a secure educational platform designed for e-ink devices and high-contrast displays, functioning as a comprehensive learning management system. It supports students, parents, tutors, and administrators with features like homework management, real-time messaging, progress tracking, and calendar scheduling. The platform is optimized for accessibility and readability on e-ink displays, aiming to provide a robust and inclusive educational experience. Key capabilities include parental assignment visibility with feedback, a dedicated marketing pitch page, and tablet-optimized layouts for key dashboards. The business vision centers on offering a cost-effective solution for tutoring companies, estimated to save £5,000–£10,000+ per year by streamlining operations such as assignment management, PDF annotation, AI-powered grading and question generation, messaging, progress reports, and calendar/attendance.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is a React and TypeScript application utilizing a component-based architecture. It uses shadcn/ui components with Radix UI primitives, optimized for high-contrast e-ink displays. Wouter handles lightweight client-side routing with role-based redirects. TanStack Query manages server state, while React hooks manage local component state. Styling is implemented with Tailwind CSS, featuring custom e-ink optimized design tokens. Vite is used for fast development and optimized production builds. The platform offers a dual-design system, allowing users to toggle between 'classic' and 'new' dashboard designs, stored persistently in `localStorage`. New dashboards are implemented for student (indigo), parent (rose), and company admin/tutor (teal) roles, with classic dashboards remaining fully functional.

## Backend Architecture
The backend is built with Express.js and TypeScript, providing a RESTful API. Authentication is handled via Replit's OpenID Connect (OIDC) integration with Passport.js, and sessions are stored in a PostgreSQL-backed store using `connect-pg-simple`. API endpoints are RESTful, organized by feature domain (assignments, submissions, messages, progress, calendar events, academic management) with consistent error handling. WebSocket integration enables real-time messaging. Robust security features include rate limiting for login attempts, token-based CSRF protection, comprehensive security headers (e.g., X-Content-Type-Options, X-Frame-Options), and detailed audit logging for all mutating API calls and authentication events.

## Data Storage Solutions
The primary database is PostgreSQL, managed with Drizzle ORM for type-safe operations and schema management. The database schema supports user management (student, parent, tutor, company_admin, admin), tutoring company management, assignment/submission tracking, real-time messaging, progress tracking, calendar events, and academic calendar management (years → terms → weeks). Drizzle Kit is used for database migrations. Google Cloud Storage (GCS) via Replit Object Storage integration provides object storage for persistent file uploads (homework submissions, assignment attachments).

## Academic Calendar Auto-Setup
The Company Admin dashboard includes an "Auto-Setup NSW 2026" feature in the Academic Management section. This uses official NSW Department of Education term dates (education.nsw.gov.au/schooling/calendars/2026) to auto-create 4 terms (Term 1–4) and their weekly breakdowns (~10 weeks per term) for a selected year level. Both Eastern and Western NSW divisions are supported. The `academic_weeks` table stores week numbers, names, and start/end dates per term. Weeks are displayed on demand by clicking "Show weeks" on any term card.

## PDF Annotation System
PDF annotation is powered by PDF.js for rendering and Fabric.js for the canvas-based annotation layer. Students have access to tools such as pen, highlighter, eraser, and text for completing assignments. Reviewers (tutors/admins) can use tick (✓), cross (✗), comment, and freehand marking tools.

## AI Features (Three-Engine Architecture)
The platform integrates a cascading AI engine system for text and vision tasks. For text-based tasks (hints, question generation, grading feedback), the fallback chain is Gemini → Groq → GPT-4o. For vision tasks (reading submitted files, handwriting, annotations), the chain is Gemini → GPT-4o vision. Engines include Gemini 2.0 Flash (primary), GPT-4o (vision fallback), and Groq LLaMA 3.3 70B (text fallback), with automatic switching on quota errors. AI features include an AI Assignment Check for tutors, an AI Question Generator, an AI Grading Assistant, and a Smart Hint System for students, with parent-configurable controls for AI hints.

## Calendar and Attendance System
A comprehensive calendar and attendance system is implemented with role-specific views. The database schema includes `class_sessions`, `session_attendance`, and `academic_holidays`. Role-specific features provide tailored interfaces for company admins, tutors, students, and parents, allowing for roll-call management, attendance tracking, scheduling, and progress overview.

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

## AI Services
- **Google Gemini API**: Primary AI engine (Flash 2.0).
- **OpenAI API**: GPT-4o (vision fallback).
- **Groq API**: LLaMA 3.3 70B (text fallback).

## Cloud Storage
- **Google Cloud Storage (GCS)**: For persistent file uploads.