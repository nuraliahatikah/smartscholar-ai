# SmartScholar AI

AI-powered scholarship recommendations for university students. Discover, match, save, and understand scholarship opportunities tailored to your academic profile.

## Overview

SmartScholar AI helps students find scholarships they actually qualify for. Each scholarship is ranked with a 0–100% match score based on CGPA, household income, course, and personal interests. An AI advisor explains in plain language why a particular opportunity is (or isn't) a strong fit.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (v1) — full-stack React with SSR/SSG |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend | Lovable Cloud (Supabase) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| AI | Lovable AI Gateway (Gemini 3 Flash) |
| Language | TypeScript |

## Features

- **Authentication** — Sign up, log in, and log out via Supabase (email/password or Google OAuth)
- **Student Profile** — Manage full name, university, course, CGPA, household income, and interests
- **Scholarship Database** — Browse a curated list of real-world scholarships with deadlines and eligibility
- **Smart Match Scoring** — Deterministic 0–100% score based on CGPA requirement, income cap, and interest overlap
- **AI Insights** — One-click explanation from Gemini on why a scholarship matches your profile
- **Save & Track** — Bookmark scholarships and view them in a dedicated saved list
- **Dashboard** — At-a-glance view of top recommendations, profile completeness, and upcoming deadlines

## Project Structure

```
src/
├── components/
│   ├── AppNav.tsx              # Authenticated navigation
│   ├── ScholarshipCard.tsx     # Reusable scholarship card with match score
│   └── ui/                     # shadcn/ui components
├── integrations/
│   ├── lovable/                # Lovable AI Gateway connector
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── client.server.ts    # Server-side Supabase client
│       ├── auth-middleware.ts  # Server fn auth guard
│       └── auth-attacher.ts    # Global auth middleware registration
├── lib/
│   ├── matcher.ts              # Match scoring algorithm (deterministic)
│   └── ai-insight.functions.ts # AI insight server function
├── routes/
│   ├── index.tsx               # Landing page (public)
│   ├── auth.tsx                # Login / signup page
│   ├── scholarships.tsx        # Browse all scholarships (public)
│   └── _authenticated/
│       ├── route.tsx           # Auth layout gate
│       ├── dashboard.tsx       # Dashboard home
│       ├── profile.tsx         # Edit student profile
│       └── saved.tsx           # Saved scholarships
└── styles.css                  # Tailwind theme tokens
```

## Database Schema

### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Links to `auth.users` |
| full_name | TEXT | Student name |
| university | TEXT | University name |
| course | TEXT | Course of study |
| cgpa | NUMERIC(3,2) | Current CGPA |
| household_income | NUMERIC | Annual household income |
| interests | TEXT[] | Array of interest tags |
| created_at / updated_at | TIMESTAMPTZ | Timestamps |

**RLS**: Users can only read/update their own profile. A trigger auto-creates a profile row on signup.

### `scholarships`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| name | TEXT | Scholarship name |
| provider | TEXT | Provider/organization |
| amount | NUMERIC | Award amount (RM) |
| deadline | DATE | Application deadline |
| description | TEXT | Full description |
| eligibility | TEXT | Eligibility text |
| min_cgpa | NUMERIC(3,2) | Minimum CGPA requirement |
| max_household_income | NUMERIC | Income eligibility cap |
| tags | TEXT[] | Interest/course tags |

**RLS**: Publicly readable by anyone.

### `saved_scholarships`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | Links to `auth.users` |
| scholarship_id | UUID (FK) | Links to `scholarships` |

**RLS**: Users can only see/manage their own saved entries.

## Match Scoring Algorithm

The `computeMatch` function in `src/lib/matcher.ts` calculates a 0–100% score:

1. **Baseline**: 60%
2. **CGPA** (+0 to +20 or −25): Bonus if above minimum; penalty if below
3. **Household Income** (+10 or −15): Bonus if under cap; penalty if over
4. **Interest/Tag Overlap** (+0 to +15): +5 per matching tag/interest/course

The algorithm also generates human-readable reason strings used in the UI.

## AI Insights

When a user clicks **"Why this scholarship?"**, the `getAiInsight` server function sends a structured prompt to Gemini 3 Flash via the Lovable AI Gateway. The prompt includes the student's full profile and scholarship details, and returns a 2–3 sentence personalized explanation.

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
```

The app requires these environment variables (managed by Lovable Cloud):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `LOVABLE_API_KEY` (for AI insights)

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |

## License

MIT
