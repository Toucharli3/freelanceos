# FreelanceOS

All-in-one client management platform for freelancers — clients, projects, invoices, and reminders in one place.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/freelanceos&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,RESEND_API_KEY,NEXT_PUBLIC_APP_URL)

## Features

- **Clients** — Create and manage your client directory with contact details
- **Projects** — Track missions, status (in progress / on hold / completed / cancelled), and link to clients
- **Invoices** — Generate professional invoices with PDF export, send via email with one click
- **Automatic reminders** — Email reminders at 7, 14, and 30 days after the due date
- **Dashboard** — Revenue charts, KPIs, and recent activity at a glance
- **Onboarding** — Profile setup wizard on first login
- **Settings** — Manage your profile and customize email templates

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (Postgres + RLS + Storage) |
| Auth | Supabase Auth |
| Email | Resend |
| PDF | @react-pdf/renderer |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/freelanceos.git
cd freelanceos
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. In **Project Settings → API**, copy your URL and keys

### 3. Configure environment variables

Create a `.env.local` file at the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (for email sending)
RESEND_API_KEY=re_your_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> The service role key is only used server-side (API routes) and is never exposed to the client.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

## Deploy to Vercel

### One-click deploy

Click the **Deploy with Vercel** button at the top of this README and fill in the environment variables when prompted.

### Manual deploy

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add all environment variables from `.env.local` (update `NEXT_PUBLIC_APP_URL` to your Vercel domain)
4. Deploy

> **Note**: `proxy.ts` is automatically detected as Next.js middleware — no additional configuration needed.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `RESEND_API_KEY` | Yes | Resend API key for sending emails |
| `NEXT_PUBLIC_APP_URL` | Yes | Full URL of your deployment (e.g. `https://freelanceos.vercel.app`) |

## Supabase Setup Notes

### Storage bucket

Create a public bucket named `avatars` in **Storage** for profile picture uploads.

### Email templates

After signing up, go to **Settings** in the app to customize the invoice and reminder email templates.

### Automatic reminders

Call `POST /api/send-reminder` once a day via a cron job. With Vercel Cron Jobs, add a `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/send-reminder",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Or with GitHub Actions:

```yaml
# .github/workflows/reminders.yml
on:
  schedule:
    - cron: '0 8 * * *'
jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST ${{ secrets.APP_URL }}/api/send-reminder
```

## Project Structure

```
freelanceos/
├── app/
│   ├── (auth)/           # login, signup, onboarding
│   ├── (dashboard)/      # clients, projects, invoices, settings
│   └── api/              # send-invoice, send-reminder
├── components/
│   ├── features/         # domain components (clients, invoices, ...)
│   ├── layout/           # sidebar, header, command palette
│   └── ui/               # shadcn/ui + custom primitives
├── hooks/                # TanStack Query hooks per domain
├── lib/                  # supabase client, utils, validations
├── types/                # Database types (Supabase)
└── supabase/
    └── migrations/       # SQL schema + RLS policies
```

## License

MIT
