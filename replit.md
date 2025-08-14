# Overview

eSlate is a secure educational platform designed specifically for e-ink devices and high-contrast displays. The application provides a comprehensive learning management system supporting multiple user roles (students, parents, tutors, and administrators) with features including homework management, real-time messaging, progress tracking, and calendar scheduling. The platform emphasizes accessibility and readability through optimized e-ink styling and simplified UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 14, 2025 - Admin-Controlled Student-Company Assignment System**
- ✅ Added direct `companyId` field to students table for flexible company assignment
- ✅ Updated database schema with `drizzle-kit push` - changes applied successfully
- ✅ Implemented company assignment in admin user edit dialog
- ✅ Added company selection dropdown that appears only when editing students
- ✅ Created `/api/admin/users/:userId/student-info` endpoint to fetch current assignments
- ✅ Updated user PATCH endpoint to handle student company assignment updates
- ✅ System admin can now assign students to companies through the user management interface

**August 14, 2025 - Registration Form Issues Resolved**
- ✅ Created completely new SimpleRegistration component to bypass form library conflicts
- ✅ Added dedicated /register route accessible to all users (authenticated or not)
- ✅ Built from scratch with native HTML inputs and manual validation
- ✅ Email input field now works perfectly without any component conflicts
- ✅ Clean, responsive design with proper error handling and success feedback

**August 14, 2025 - All Critical Issues Fully Resolved + UI Enhancement Complete**
- ✅ Fixed 404 error on /company/tutors route by adding proper routing in App.tsx (user confirmed working)
- ✅ Fixed email input functionality in CompanyManagement with proper form attributes 
- ✅ Fixed user role editing by updating server permissions to allow company_admin users (HTTP 200 responses confirmed)
- ✅ Replaced ALL role dropdowns with intuitive checkbox interface across entire application
- ✅ Updated all "Company Admin" terminology to "Business Admin" throughout the system
- ✅ Server authentication compatibility fixed for custom auth system
- ✅ All API endpoints now returning HTTP 200 responses with proper data
- ✅ User creation and editing fully functional for both admin and business admin users
- ✅ Comprehensive checkbox-based role selection implemented in:
  - UserManagement.tsx (create & edit dialogs + card grid layout)
  - CompanyManagement.tsx (create & edit dialogs)
  - Users.tsx (create dialog)
  - All role selection now consistent across the platform
- ✅ Converted UserManagement page from table view to card grid layout matching company section
- ✅ Added Edit buttons to all user cards throughout the application

**August 13, 2025 - Academic Management System Fixed**
- Fixed critical API endpoint issue: Frontend was calling incorrect `/api/company-admin/` instead of `/api/admin/company-admin/`
- Resolved date formatting crashes in Academic Management interface by adding proper null checks
- Academic Management system now fully functional with proper data loading for years, terms, and classes
- User nish1882@outlook.com successfully authenticated and associated with "Homework and Study Academy"

## System Architecture

### Frontend Architecture

The client-side application is built using React with TypeScript, leveraging a component-based architecture:

**UI Framework**: Built on shadcn/ui components with Radix UI primitives for accessibility and consistent behavior across e-ink devices. The design system uses high-contrast colors (pure black and white) optimized for e-ink displays.

**Routing**: Uses Wouter for lightweight client-side routing with role-based dashboard redirects.

**State Management**: TanStack Query (React Query) handles server state management, caching, and API interactions. Local component state is managed with React hooks.

**Styling**: Tailwind CSS with custom e-ink optimized design tokens and CSS variables. The color scheme prioritizes readability on e-ink displays with carefully chosen contrast ratios.

**Build System**: Vite for fast development and optimized production builds with TypeScript support.

### Backend Architecture

**Server Framework**: Express.js with TypeScript providing a RESTful API architecture.

**Authentication**: Replit's OpenID Connect (OIDC) integration with Passport.js for secure user authentication and session management.

**Session Storage**: PostgreSQL-backed session store using connect-pg-simple for persistent user sessions.

**API Design**: RESTful endpoints organized by feature domain (assignments, submissions, messages, progress, calendar events, academic management) with consistent error handling and response formats. Company admin endpoints use `/api/admin/company-admin/` structure.

**Real-time Communication**: WebSocket integration for live messaging between users.

### Data Storage Solutions

**Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations and schema management.

**Database Schema**: Comprehensive relational model supporting:
- User management with role-based access (student, parent, tutor, company_admin, admin)
- Tutoring company management with company-specific admin roles
- Assignment and submission tracking with status management
- Real-time messaging system with read receipts
- Progress tracking with completion percentages and time spent
- Calendar events for scheduling and deadline management

**Schema Management**: Drizzle Kit for database migrations and schema evolution with TypeScript integration.

### Authentication and Authorization

**Primary Authentication**: Replit OIDC integration providing secure user identity verification.

**Session Management**: Server-side sessions stored in PostgreSQL with configurable TTL and security settings.

**Role-Based Access**: Five distinct user roles with different permissions and dashboard experiences:
- Students: Access assignments, track progress, communicate with tutors
- Parents: Monitor children's progress, verify completed work
- Tutors: Manage students, create assignments, track class progress
- Company Admins: Manage tutoring company staff and operations
- System Admins: Full system administration and user management

**Security Features**: HTTPS enforcement, secure cookie settings, and CSRF protection through session-based authentication.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

### Authentication Services
- **Replit Auth**: OpenID Connect provider for user authentication
- **Passport.js**: Authentication middleware with OIDC strategy

### Frontend Libraries
- **React**: Core UI framework with hooks and context
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **Radix UI**: Accessible primitive components
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Production bundling for server code

### Runtime Environment
- **Node.js**: Server runtime with ES modules
- **WebSocket**: Real-time communication protocol
- **Express.js**: Web application framework

### UI/UX Dependencies
- **Lucide React**: Icon library optimized for high contrast
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional CSS class management