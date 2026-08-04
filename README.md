# Teksage Feature Management

Internal product roadmap tool for capturing, prioritizing, and shipping Teksage feature ideas.

Built with **Next.js 16**, **Supabase**, **TanStack Query**, and **shadcn/ui** — architecture and coding principles mirror [MentorBridge Hub](https://github.com/Teksage), with Teksage green branding and logos.

## Features

- Auth (email/password) with **Admin** and **Member** roles
- Kanban board with drag-and-drop status pipeline: Idea → Planned → In Progress → Completed
- Priority, categories (set when creating a feature), voting, and comments
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
2. Apply schema SQL from `supabase/migrations/` in the Supabase SQL Editor (or via CLI locally)
3. If you already had **Shipped** / **Archived** statuses, also run `scripts/rename-feature-statuses.sql`
4. Promote your first user to Admin after signup:

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
supabase/            # local migrations (gitignored) + config
scripts/             # one-off SQL helpers
proxy.ts             # Auth + RBAC (Next.js 16)
```

## Coding rules

- Reuse existing UI/hooks before creating new ones
- Files ≤ 200 lines
- Colors only in `app/globals.css` (Teksage green `#10B100`, blue `#1081DD`)
- Routes, copy, and query keys live in `lib/constants.ts`
