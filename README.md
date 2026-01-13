# embedLabs

Production-grade online education platform with QR-based permanent access binding.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (Auth + PostgreSQL + Realtime)
- **Video**: Cloudflare Stream
- **Animations**: Framer Motion
- **Icons**: Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase project (for database and auth)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation, including:

- Folder structure and organization
- File size and responsibility principles
- Authentication flow
- QR security model
- Database schema guidelines

## Project Structure

```
embed-labs/
├── app/              # Next.js App Router - routing & layouts only
├── components/       # Reusable UI components
├── features/         # Domain-specific logic (auth, qr, courses)
├── hooks/            # Reusable React hooks
├── lib/              # Supabase client, type definitions
├── services/         # External integrations
└── utils/            # Pure utility functions
```

## Development Guidelines

- **File Size**: Maximum 100 lines per file (ideal: 50-80)
- **Single Responsibility**: Each file does ONE thing
- **Type Safety**: Strict TypeScript, no `any`
- **Server-First**: Prefer Server Components & Server Actions
- **Security**: Always validate on server, enforce RLS at database level

## License

Private project - All rights reserved
