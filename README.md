# Lift Tracker

Personal training + nutrition tracker. Built for me, by me (and claude)

works better for me than any workout app, no setup no bs (a preliminary version of my program is preloaded, as well as nutrition presets, but these should be editable), if you use it yourself ymmv

as maybe i adapt to use this with less brainpower and time i may add features that make it more inaccessible but i trust you are good enough to make changes for yourself

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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjohnnyhliang%2Fworkoutlogger&env=APP_PASSWORD,TURSO_DATABASE_URL,TURSO_AUTH_TOKEN&envDescription=APP_PASSWORD%20is%20your%20login%20password.%20TURSO_DATABASE_URL%20and%20TURSO_AUTH_TOKEN%20come%20from%20your%20Turso%20dashboard.)

If you are extra lazy just clone the github repo and/or click the deploy button - literally one click and all you need are env vars (you need to set a password)

postgres DB is free from turso

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

Vert + upper body aesthetics + stability under contact + athletic coordination. See SPEC.md for the program
