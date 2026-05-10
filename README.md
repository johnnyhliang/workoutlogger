# Lift Tracker

Personal training + nutrition tracker. Built for me, by me (and Claude Code).

## Quick start

```bash
# 1. Set up Turso (see TURSO_SETUP.md)
# 2. Clone + install
pnpm install

# 3. Add credentials to .env.local
cp .env.example .env.local
# edit with your Turso URL + token

# 4. Push schema to Turso
pnpm db:push

# 5. Run dev server
pnpm dev
```

## Deploy

Push to main. Vercel auto-deploys. Make sure env vars are set in Vercel dashboard.

## Files

- `SPEC.md` — what this app does and why
- `CLAUDE.md` — instructions for Claude Code
- `TURSO_SETUP.md` — one-time database setup
- `IDEAS.md` — V2 feature parking lot

## Pages

- `/` — today's workout
- `/meals` — protein tracker (180g goal)
- `/weight` — weekly weigh-in
- `/history` — past workouts + progression

## Goals

Vert + upper body aesthetics + stability under contact + athletic coordination. See SPEC.md for the program.
