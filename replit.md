# Overview

This is a data visualization and dashboard tool that allows users to upload CSV/Excel files, create interactive charts, and compose custom dashboards. The application provides a complete workflow from data import to visualization, with features for data exploration, statistical analysis, and persistent dashboard configurations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Uses Wouter for lightweight client-side routing. The application is primarily a single-page app with minimal routes (home and 404).

**State Management**: TanStack Query (React Query) for server state management with aggressive caching (staleTime: Infinity). No global state management library is used - local component state handles UI concerns.

**UI Component System**: Built on Radix UI primitives with a custom design system (shadcn/ui "new-york" style). The design follows Material Design 3 principles with custom enhancements for data visualization. Components use CSS variables for theming with both light and dark mode support.

**Styling**: Tailwind CSS with extensive custom CSS variables for theming. Uses HSL color space for theme colors with separate light/dark mode palettes. Custom elevation system using rgba overlays (--elevate-1, --elevate-2) for hover/active states.

**Data Visualization**: Recharts library for all chart rendering (bar, line, area, scatter, pie charts). Charts use a consistent color palette defined in CSS variables (--chart-1 through --chart-5).

**Layout System**: React Grid Layout for dashboard canvas, providing drag-and-drop widget positioning with persistent layouts.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js. Uses ESM (ES Modules) throughout.

**API Design**: RESTful API with conventional endpoints:
- `/api/upload` - File upload (multipart/form-data)
- `/api/datasets` - Dataset CRUD operations
- `/api/charts` - Chart CRUD operations  
- `/api/dashboards` - Dashboard CRUD operations

**File Processing**: 
- CSV files parsed using PapaParse
- Excel files (.xlsx, .xls) parsed using SheetJS (xlsx library)
- Automatic column type detection (number, text, date) based on sampling first 10 values
- Files processed in-memory via multer

**Development Server**: Vite middleware integration for HMR and development. Production serves static files from dist/public.

**Error Handling**: Centralized error middleware with status code propagation. Errors logged and returned as JSON responses.

### Data Storage

**Current Implementation**: In-memory storage using Map data structures (MemStorage class). This is a temporary solution suitable for development and prototyping.

**Database Schema**: Designed for PostgreSQL using Drizzle ORM:
- `datasets` table: Stores uploaded file metadata and data as JSONB
- `charts` table: Stores chart configurations with foreign key to datasets
- `dashboards` table: Stores dashboard layouts and chart references as JSONB arrays

**Schema Strategy**: Heavy use of JSONB columns for flexible, schemaless data storage (data arrays, column definitions, chart configs, dashboard layouts). This allows for dynamic column structures without schema migrations.

**Type Safety**: Drizzle-Zod integration generates Zod schemas from database schema for runtime validation. TypeScript types inferred from Drizzle schema.

### External Dependencies

**UI Component Libraries**:
- Radix UI (comprehensive set of headless, accessible components)
- Recharts (composable charting library)
- React Grid Layout (dashboard layout system)
- cmdk (command palette component)

**Data Processing**:
- PapaParse (CSV parsing)
- SheetJS/xlsx (Excel file parsing)
- Drizzle ORM (database abstraction, currently configured for PostgreSQL)
- Neon serverless PostgreSQL driver

**Development Tools**:
- Vite (build tool and dev server)
- TypeScript (type safety)
- Tailwind CSS (utility-first styling)
- ESBuild (production bundling)

**Fonts**: Google Fonts CDN for Inter (UI text) and JetBrains Mono (monospace/code).

**Notable Patterns**:
- Path aliases configured (@/ for client/src, @shared/ for shared types)
- Vite plugins for Replit integration (cartographer, dev banner, runtime error modal)
- Custom theme provider with localStorage persistence
- Optimistic UI updates with React Query mutations