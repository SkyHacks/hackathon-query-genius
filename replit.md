# Overview

This is a Business Intelligence (BI) query application that allows users to ask questions about their data and receive AI-powered insights. The application features a modern React frontend with a clean, professional interface built using shadcn/ui components, and an Express.js backend that processes queries and returns mock analytical responses. Currently, the system uses mock data for demonstration purposes, simulating real business intelligence scenarios like sales analysis, customer satisfaction metrics, revenue tracking, and productivity insights.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on top of Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management with custom query client configuration
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **Design System**: Consistent theming using CSS custom properties with light/dark mode support

## Backend Architecture  
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API structure with centralized route handling
- **Data Storage**: In-memory storage implementation using Map data structure (designed to be easily replaceable with database persistence)
- **Request Processing**: Custom middleware for logging API requests with response times and payload capture
- **Error Handling**: Centralized error handling with proper HTTP status codes and structured error responses

## Data Architecture
- **Schema Definition**: Drizzle ORM schema for PostgreSQL database (currently configured but using in-memory storage)
- **Type Safety**: Shared TypeScript types between client and server using Zod schemas
- **Query Processing**: Mock AI responses simulating business intelligence scenarios including sales data, customer metrics, revenue analysis, and productivity tracking

## Development Environment
- **Bundling**: Vite with React plugin for fast development builds and hot module replacement
- **Type Checking**: Comprehensive TypeScript configuration with strict mode enabled
- **Development Server**: Express server with Vite middleware integration for seamless development experience
- **Build Process**: Separate build commands for client (Vite) and server (esbuild) with production-ready output

# External Dependencies

## Database and ORM
- **Drizzle ORM**: PostgreSQL database toolkit with type-safe query building
- **Neon Database**: Serverless PostgreSQL database provider (@neondatabase/serverless)
- **Connection Management**: PostgreSQL session handling with connect-pg-simple

## AI and Language Processing
- **AI SDK**: Integration with Anthropic and OpenAI AI providers for future query processing
- **Mock Responses**: Current implementation uses predefined business intelligence responses for demonstration

## UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for building design systems
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library providing consistent iconography throughout the application

## Development and Build Tools
- **Vite**: Fast build tool with TypeScript support and React plugin
- **esbuild**: JavaScript bundler for server-side code compilation
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

## Replit Integration
- **Runtime Error Overlay**: Development error handling with @replit/vite-plugin-runtime-error-modal
- **Cartographer**: Code mapping and navigation assistance for Replit environment

The architecture is designed to be modular and scalable, with clear separation between frontend and backend concerns, making it easy to extend functionality or replace components as needed.