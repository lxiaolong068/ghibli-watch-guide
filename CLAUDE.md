# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- Use `pnpm` exclusively (never npm or yarn)
- `pnpm dev` - Start development server
- `pnpm build` - Build production app (includes Prisma generation)
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run Vitest tests

### Database Operations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:seed` - Seed database with initial data
- `pnpm db:seed:movies` - Seed only movie data
- `pnpm db:seed:regions-platforms` - Seed regions and platforms data

### Content Management
- `pnpm sitemap:generate` - Generate sitemap.xml

## Architecture Overview

### Core Technologies
- **Next.js 14** with App Router
- **TypeScript** throughout the codebase
- **Tailwind CSS** for styling
- **Prisma** ORM with PostgreSQL (Neon)
- **Vitest** for testing

### Database Schema
The application uses a comprehensive Prisma schema with these key models:
- `Movie` - Studio Ghibli films with TMDB integration
- `Platform` - Streaming/rental platforms
- `Region` - Geographic regions for availability
- `Availability` - Movie availability across platforms and regions
- Extended content models: `Character`, `MovieReview`, `WatchGuide`, `Tag`
- Content management: `ContentVersion`, `ContentReview`, `ContentUpdateTask`

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `app/components/` - React components organized by feature
- `app/lib/` - Utility functions and database client
- `app/types/` - TypeScript type definitions
- `prisma/` - Database schema and migrations
- `scripts/` - Data seeding and utility scripts
- `data/` - Static data files for Ghibli content

### API Architecture
- Movie data sourced from TMDB API (`lib/tmdb.ts`)
- RESTful API routes in `app/api/`
- Automated cron jobs for content updates
- Admin endpoints for content management

### Component Structure
- Feature-based organization (movies, characters, guides, search)
- Responsive design with mobile-first approach
- Performance optimizations with lazy loading
- SEO-optimized components

## Development Guidelines

### Database Caution
The `.env` file connects to the production database. Exercise extreme caution with:
- Database migrations
- Seeding operations
- Any destructive operations

### Testing Requirements
- Write Vitest tests for new features
- Run `pnpm test` after implementing changes
- Test files should be co-located with components in `__tests__/` directories

### Code Conventions
- Use TypeScript strict mode
- Follow existing component patterns
- Maintain consistency with Prisma schema types
- Use Server Components where possible, Client Components only when necessary

### Content Management
- Movie data is automatically synced from TMDB
- Automated cron jobs handle content updates
- Sitemap generation is automated
- Admin interface available for content management

## Important Notes

### TMDB Integration
- API key required in environment variables
- Movie data includes titles in multiple languages (English, Japanese, Chinese)
- Automated data synchronization through cron jobs

### Internationalization
- Primary language: English
- Supports Japanese and Chinese titles
- Content templates for multiple languages

### Performance Considerations
- Optimized images with `OptimizedImage` component
- Lazy loading for movie lists
- Efficient database queries with Prisma
- Static generation where possible

### Security
- Environment variables for sensitive data
- Cron job authentication with `CRON_SECRET`
- Input validation for user-facing forms