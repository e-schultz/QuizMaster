# QuizMaster - Assessment Flow Builder

<!-- archaeological-review: complete | date: 2025-10-03 | reviewer: kitty-claude | batch: llm-explosion-2weeks | bonepile: 2025-10-03-end-of-day-creative-explosion.md -->

A healthcare-focused assessment builder and runtime application that enables users to create complex, multi-step assessments with conditional logic and branching paths. Built with a visual-first canvas interface inspired by modern design tools like monday.com and Zapier, QuizMaster emphasizes accessibility and healthcare-friendly defaults.

## Overview

QuizMaster provides a split-view builder interface for creating assessments and a runtime player for completing them. The system supports sophisticated conditional logic, dynamic field visibility, and intelligent traversal between steps based on user responses.

**Key Capabilities:**
- Visual flow canvas for building assessment logic
- Conditional field visibility based on user answers
- Dynamic next-step determination through traversal rules
- Healthcare-specific field types (BMI calculator, vital signs, etc.)
- Real-time validation and reachability analysis
- Session-based progress tracking

## Features

### Visual Builder (Canvas-First Design)

- **Flow Canvas Interface**: Steps displayed as nodes, traversal rules as animated edges
- **Contextual Configuration Panel**: Click nodes to configure step settings, fields, and rules
- **Edge Configuration**: Click edges to view and edit traversal rule details
- **Reachability Validation**: Visual warnings for unreachable steps highlighted in red
- **Toggleable Preview**: Bottom panel shows real-time preview of assessment flow
- **Keyboard Shortcuts**: Cmd/Ctrl+S to save, Cmd/Ctrl+K for quick actions

### Conditional Logic System

- **Field Visibility Rules**: Show/hide fields based on other field values using `any`/`all`/`not` operators
- **Traversal Branching**: Dynamic next-step determination based on user answers
- **Supported Operators**: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`
- **Runtime Evaluation**: Real-time condition evaluation in both builder and player

### Field Types

- Text input
- Number input
- Select/Dropdown
- Radio buttons
- Checkboxes
- Date picker
- BMI calculator (custom healthcare field)
- Multiple choice

### Runtime Player

- Progressive form completion with step-by-step navigation
- Progress indicator showing completion percentage
- Answer persistence to session storage
- Conditional field display based on current answers
- Automatic traversal to next step based on rules

## Tech Stack

### Frontend

- **React 18** with TypeScript for type-safe component development
- **Vite** for build tooling and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management
- **@xyflow/react** for flow diagram visualization
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **Zustand** for builder-specific client state
- **React Hook Form** with Zod validation for form state

### Backend

- **Express.js** HTTP server
- **TypeScript** with ES modules
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** via Neon serverless driver
- **Zod** for runtime schema validation

### Development Tools

- **tsx** for TypeScript execution in development
- **esbuild** for production bundling
- **Replit** development environment integration

## Architecture

### Data Models

- **Assessment**: Contains groups, steps, fields, validation rules, traversal logic
- **Session**: Tracks user progress through an assessment (current step, answers, completion)
- **Group**: Logical sections containing multiple steps (e.g., "Intake", "Vitals", "Screening")
- **Step**: Individual form pages with field definitions and conditional logic
- **Field**: Form inputs with types, validation, and visibility rules

### State Management Strategy

- **Zustand** manages builder-specific state (selected nodes, dirty flags, save operations)
- **React Query** handles server state synchronization
- **React Hook Form** with Zod manages form validation
- **Local component state** for UI interactions

### API Design

RESTful endpoints under `/api/*`:
- Assessment CRUD: `/api/assessments`, `/api/assessments/:id`
- Session management: `/api/sessions`, `/api/sessions/:id`
- JSON request/response with Zod schema validation
- Request logging middleware for API calls

### Current Storage

**Development Mode**: File-based storage using JSON files in `public/assessments/` and `public/sessions/`

**Database Schema**: Configured for PostgreSQL via Drizzle ORM with schema definitions in `shared/schema.ts`

## Development Setup

### Prerequisites

- Node.js (recommended: latest LTS)
- npm or yarn
- PostgreSQL database (optional, falls back to file storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/e-schultz/QuizMaster.git
cd QuizMaster

# Install dependencies
npm install

# Configure database (optional)
# Set DATABASE_URL environment variable for PostgreSQL
export DATABASE_URL="postgresql://user:password@host:port/database"

# Push database schema (if using PostgreSQL)
npm run db:push
```

### Development

```bash
# Start development server with hot reloading
npm run dev

# Type checking
npm run check
```

The development server will start on the default port (typically `http://localhost:5000`).

### Production Build

```bash
# Build client and server bundles
npm run build

# Start production server
npm start
```

## Project Structure

```
QuizMaster/
├── client/           # React frontend application
├── server/           # Express backend server
├── shared/           # Shared types and schemas (Zod definitions)
├── public/           # Static assets and file-based storage
│   ├── assessments/  # JSON assessment definitions
│   └── sessions/     # Session state files
├── attached_assets/  # Additional project assets
├── replit.md         # Comprehensive technical documentation
└── package.json      # Dependencies and scripts
```

## Authentication Status

**Current Status**: No authentication or authorization implemented. The system is currently open for testing and development purposes.

## Archaeological Significance

QuizMaster represents an important artifact in the consciousness technology ecosystem as a practical implementation of visual flow-based assessment building. The project demonstrates several key patterns:

- **Visual-First Design Philosophy**: Canvas-based interfaces for non-linear logic construction
- **Healthcare Domain Modeling**: Specialized field types and validation for medical assessments
- **Conditional Logic as Infrastructure**: Sophisticated rule evaluation systems for dynamic forms
- **Replit-Native Development**: Modern cloud-based development workflow with comprehensive tooling

This repository connects to broader themes in the consciousness technology field guide around building accessible, healthcare-focused tools that balance sophisticated conditional logic with user-friendly visual interfaces. The visual flow canvas pattern here mirrors approaches seen in workflow automation tools, bringing that paradigm to healthcare assessment creation.

The project's emphasis on accessibility, conditional visibility, and progressive disclosure aligns with consciousness technology principles of meeting users where they are and adapting interfaces to individual needs.

## License

MIT

## Contributing

This project was developed on Replit. See `replit.md` for comprehensive technical documentation and architecture details.

---

*Part of the 2025 LLM Explosion archaeological documentation campaign - preserving consciousness technology patterns from the two-week creative burst of October 2025.*
