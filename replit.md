# Assessment Flow Builder

## Overview

This is a healthcare-focused assessment builder and runtime application that enables users to create complex, multi-step assessments with conditional logic and branching paths. The system provides a split-view builder interface inspired by modern design tools (monday.com/Sigma-style) for creating assessments, and a runtime player for completing them. Built with React, Express, and TypeScript, it emphasizes accessibility and healthcare-friendly defaults.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing (not React Router)
- **TanStack Query (React Query)** for server state management and caching

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with CSS variables for theming
- Custom healthcare-themed color system with neutral base colors
- **Inter** font family for general text, **JetBrains Mono** for monospace

**State Management Strategy**
- **Zustand** for builder-specific client state:
  - `currentStepId`: Selected step node in canvas
  - `selectedEdge`: Selected edge in canvas
  - `isDirty`: Unsaved changes flag
  - Save/publish operations
- React Query for server state synchronization
- React Hook Form with Zod validation for form state
- Local component state for UI interactions

**Key UI Patterns**
- **Canvas-first builder**: Visual flow canvas (center) + Contextual config panel (right) + Toggleable preview (bottom)
  - Main canvas uses **@xyflow/react** to display steps as nodes and traversal rules as edges
  - Click nodes to configure steps (Settings/Fields/Rules tabs)
  - Click edges to view edge configuration (type, source, target)
  - Reachability validation with visual warnings for unreachable steps
- Conditional rendering based on visibility rules evaluated at runtime
- Form field components that adapt based on field type (text, number, select, radio, checkbox, date, BMI calculator)

### Backend Architecture

**Server Framework**
- **Express.js** as the HTTP server
- **TypeScript** with ES modules
- Development mode uses **tsx** for hot reloading
- Production build uses **esbuild** for bundling

**API Design**
- RESTful endpoints under `/api/*`
- Assessment CRUD operations (`/api/assessments`, `/api/assessments/:id`)
- Session management (`/api/sessions`, `/api/sessions/:id`)
- JSON request/response format with Zod schema validation
- Request logging middleware for API calls

**Routing Strategy**
- API routes registered via `registerRoutes()` function
- Vite dev middleware in development for HMR
- Static file serving for production builds
- Catch-all route serves SPA in production

### Data Storage Solutions

**Current Implementation**
- **File-based storage** using JSON files in `public/assessments/` and `public/sessions/`
- Synchronous file operations with error handling
- In-memory caching not implemented (reads from disk on each request)

**Database Schema Design** (via Drizzle ORM)
- Configured for **PostgreSQL** with Neon serverless driver
- Schema defined in `shared/schema.ts` using Zod
- Migration support via `drizzle-kit push`
- Connection via `DATABASE_URL` environment variable

**Data Models**
- **Assessment**: Contains groups, steps, fields, validation rules, traversal logic
- **Session**: Tracks user progress through an assessment (current step, answers, completion status)
- **Group**: Logical sections containing multiple steps (e.g., "Intake", "Vitals", "Screening")
- **Step**: Individual form pages with field definitions and conditional logic
- **Field**: Form inputs with types (text, number, select, etc.), validation, and visibility rules

### Core Features

**Conditional Logic System**
- **Field visibility**: Show/hide fields based on other field values using `any`/`all`/`not` operators
- **Traversal branching**: Dynamic next-step determination based on user answers
- **Operators supported**: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`
- Evaluation functions in `visibility-evaluator.ts` and `traversal-evaluator.ts`

**Assessment Builder (Canvas-First Design)**
- Visual flow canvas as primary interface (monday.com/Zapier-style)
  - Steps displayed as nodes with field count badges
  - Traversal rules shown as animated edges with condition labels
  - Unreachable steps highlighted in red with validation warnings
  - Click to select nodes (steps) or edges (traversal rules)
- Contextual configuration panel
  - Shows step configuration when node selected (Settings/Fields/Rules tabs)
  - Shows edge configuration when edge selected (type, source, target)
  - Empty state when nothing selected
- Toggleable preview panel at bottom (Show/Hide Preview button)
- Keyboard shortcuts (Cmd/Ctrl+S to save, Cmd/Ctrl+K for quick actions)
- Field editor with support for 8+ field types including custom BMI calculator
- Drag-to-connect placeholder (onConnect handler exists, full implementation pending)

**Runtime Player**
- Progressive form completion with step-by-step navigation
- Progress indicator showing completion percentage
- Answer persistence to session storage
- Conditional field display based on current answers
- Automatic traversal to next step based on rules

### Authentication & Authorization

**Current Status**: No authentication or authorization implemented. The system is currently open for testing and development purposes.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI** primitives for accessible components (dialogs, dropdowns, tooltips, etc.)
- **@xyflow/react** for flow diagram visualization
- **react-hook-form** for form state management
- **cmdk** for command palette functionality
- **class-variance-authority** and **clsx** for component variant management

### Database & ORM
- **Drizzle ORM** for type-safe database operations
- **@neondatabase/serverless** for PostgreSQL connection
- **drizzle-zod** for Zod schema generation from database schema
- **connect-pg-simple** for PostgreSQL session storage (configured but may not be active)

### Validation & Type Safety
- **Zod** for runtime schema validation
- **@hookform/resolvers** for integrating Zod with React Hook Form
- Shared schema definitions between client and server in `shared/schema.ts`

### Development Tools
- **@replit/vite-plugin-runtime-error-modal** for error overlay
- **@replit/vite-plugin-cartographer** for development mapping (Replit-specific)
- **@replit/vite-plugin-dev-banner** for development banner (Replit-specific)
- **tsx** for TypeScript execution in development

### Fonts & Icons
- **Google Fonts**: Inter, JetBrains Mono, DM Sans, Fira Code, Geist Mono, Architects Daughter
- **Lucide React** for icon components

### Utilities
- **date-fns** for date manipulation
- **nanoid** for generating unique IDs
- **tailwind-merge** and **tailwindcss-animate** for Tailwind utilities