# Overview

eSlate is a secure educational platform designed for e-ink devices and high-contrast displays. It functions as a comprehensive learning management system supporting students, parents, tutors, and administrators. Key features include homework management, real-time messaging, progress tracking, and calendar scheduling, all optimized for accessibility and readability on e-ink displays. The platform aims to provide a robust and inclusive educational experience.

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