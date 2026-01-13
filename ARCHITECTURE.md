# embedLabs Architecture

## Overview

embedLabs is a production-grade online education platform with QR-based permanent access binding, built with Next.js, TypeScript, and Supabase.

## Folder Structure

```
embed-labs/
├── app/              # Next.js App Router - routing & layouts only
├── components/       # Reusable UI components (no business logic)
├── features/         # Domain-specific logic (auth, qr, courses)
├── hooks/            # Reusable React hooks
├── lib/              # Supabase client, type definitions, helpers
├── services/         # External integrations (Cloudflare, QR generation)
└── utils/            # Pure utility functions
```

## Architecture Principles

### 1. File Size Discipline
- **Ideal**: 50-80 lines per file
- **Maximum**: 100 lines per file
- **Solution**: Split into hooks, utils, services, or sub-components

### 2. Single Responsibility
- Each file does ONE thing clearly
- UI ≠ business logic ≠ data access
- No mixed concerns

### 3. Data Flow
- Prefer Server Components & Server Actions
- Use Route Handlers only when necessary
- Always validate inputs on server
- No over-fetching

## Authentication

- **Provider**: Supabase Auth only
- **Methods**: Email/Password, Google OAuth
- **Session Management**: Server-side validation required
- **Route Protection**: Middleware or server checks

## QR Security

- Each QR permanently binds to ONE user
- First scan after login → QR gets locked
- Subsequent scans by other users must fail
- Enforce at DATABASE level using RLS
- Never rely only on client-side checks

## Database

- **Provider**: Supabase PostgreSQL with RLS enabled
- **Schema Changes**: Ask before making major changes
- **Type Safety**: Types generated from Supabase schema

## Code Quality

- Strict TypeScript (no `any`)
- Descriptive naming
- No dead code
- No console.logs in production logic
- Comments explain WHY, not WHAT

## UI/UX Principles

### Design Philosophy
- **Clean, professional, minimal** - Serious education platform aesthetic
- **No fancy animations** - Subtle transitions only
- **Performance first** - Prefer CSS transitions over JavaScript animations
- **Accessibility** - Semantic HTML, proper labels, keyboard navigation

### Animation Guidelines
- **Framer Motion**: Use ONLY for subtle transitions (fade, slide)
- **CSS Transitions**: Default choice for hover states, color changes
- **Loading States**: Skeleton/shimmer loaders, not spinners
- **No over-engineering**: If CSS can do it, use CSS

### Component Standards
- Consistent spacing and typography
- Clear visual hierarchy
- Professional color palette
- Responsive by default

### Theme System Requirements

**Design Constraints (Not Yet Implemented):**

- **Dual Theme Support**: Application must support both light and dark themes
- **Light Theme**: Professional, low-contrast color scheme for reduced eye strain
- **Dark Theme**: AMOLED-style (true black or near-black), not gray-heavy
  - True black (`#000000`) or near-black (`#0a0a0a` max) backgrounds
  - Avoid gray-heavy themes - minimize gray tones
  - Strong readability and accessibility maintained
  - Restrained, subtle accent colors
- **Theme-Friendly Styling**: 
  - Use CSS variables (already in place via `globals.css`)
  - Use Tailwind theme tokens (`bg-background`, `text-foreground`, etc.)
  - **NEVER** hardcode colors like `#000000` or `bg-black` in components
  - All components must use semantic color tokens
- **Future-Proof Architecture**:
  - Theme switching logic will be implemented later
  - Current CSS variable system is prepared for theme implementation
  - Components are already theme-ready (use semantic tokens)
- **Scalability**: Theme system must support potential future themes (e.g., high-contrast, custom themes)

**Current Dark Mode Status:**
- ⚠️ Current dark mode is gray-heavy (needs AMOLED-style update)
- Colors will be updated during theme implementation
- See `THEME.md` for detailed AMOLED requirements

**Current State:**
- ✅ CSS variables defined in `globals.css`
- ✅ Dark mode media query exists (system preference)
- ✅ Components use theme tokens (not hardcoded colors)
- ⏳ Theme switching logic: **NOT IMPLEMENTED** (will be added later)

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (Auth + PostgreSQL + Realtime)
- **Video**: Cloudflare Stream
- **Animations**: Framer Motion (subtle transitions only)
- **Icons**: Lucide Icons
