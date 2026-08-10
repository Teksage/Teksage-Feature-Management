# Teksage Feature Management

Internal product roadmap tool for capturing, prioritizing, and shipping Teksage feature ideas.

Built with **Next.js 16**, **Supabase**, **TanStack Query**, and **shadcn/ui** — architecture and coding principles mirror [MentorBridge Hub](https://github.com/Teksage), with Teksage green branding and logos.

## Features

- Auth (email/password) with **Admin** and **Member** roles
- Kanban board with drag-and-drop status pipeline: Idea → Planned → In Progress → Completed
- Priority, categories (set when creating a feature), voting, and comments
- Feature owners (assign a teammate) with board filter
- Dashboard charts for pipeline status and priority mix
- Admin team management
- Role-based dashboards with stats and top-voted ideas

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a Supabase project and fill `.env.local` from `.env.example`
2. Link the CLI and apply local migrations (gitignored under `supabase/migrations/`):

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Or paste migration SQL into the Supabase SQL Editor in timestamp order.
3. Promote your first user to Admin after signup:

```sql
update public.profiles set role = 'Admin' where email = 'you@teksage.com';
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Architecture

```
app/                 # App Router pages + API routes
components/ui/       # shadcn primitives
components/shared/   # layout, forms, feedback
features/            # domain UI (auth, admin, member, shared features)
services/            # TanStack Query hooks
lib/                 # constants, validations, supabase clients
types/               # TypeScript types
supabase/            # config + local migrations (gitignored)
proxy.ts             # Auth + RBAC (Next.js 16)
```

## Coding rules

- Reuse existing UI/hooks before creating new ones
- Files ≤ 200 lines
- Colors only in `app/globals.css` (Teksage green `#10B100`, blue `#1081DD`)
- Routes, copy, and query keys live in `lib/constants.ts`
