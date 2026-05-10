# CLAUDE.md

This is a personal lift tracker. Read SPEC.md before doing anything.

## Working principles

- **Ship working code over perfect code.** This is a personal tool, not production SaaS. Prioritize shipped + deployed over architecturally pristine.
- **Mobile-first.** All UI is tested on phone width (~390px). Big tap targets, big numbers.
- **Type safety end to end.** TypeScript strict mode. Drizzle for type-safe DB queries.
- **No premature abstraction.** Don't build a workout builder, don't build settings, don't build a plugin system. Hardcode what should be hardcoded.
- **Server Actions over API routes.** Use Next.js server actions for all DB writes. No separate REST API.
- **Optimistic UI.** Sets log instantly, sync to DB in background. Loading states are the enemy.

## Code style

- Functional components, hooks. No class components.
- Tailwind only for styling. No CSS modules, no styled-components.
- Server components by default. Client components only when interaction is needed.
- Async/await over .then() chains.
- Explicit types on function signatures, especially server actions.

## File conventions

- Components in PascalCase: `ExerciseCard.tsx`
- Hooks in camelCase with `use` prefix: `useWorkoutDay.ts`
- Server actions colocated in `app/actions.ts` or per-feature folders.
- Schema in `db/schema.ts`, client in `db/client.ts`, queries can live in feature folders.

## Database conventions

- All tables have `id` (autoincrement), `created_at` (unix ms).
- Dates as ISO strings (`YYYY-MM-DD`) for grouping by day.
- Timestamps as unix ms for precise ordering.
- No soft deletes — actually delete rows when user deletes.
- Use Drizzle's prepared statements for any query that runs more than once.

## Testing

Skip tests for V1. This is a personal tool. If something breaks the user will notice within a workout and fix it. Focus on shipping.

## Deployment

- Vercel free tier (Hobby plan)
- Connect repo, auto-deploy from main
- Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` as env vars in Vercel dashboard
- Custom domain optional (johnnyliang.me/lift if user wants it)

## When to ask the user

- Before destructive DB operations (drop tables, etc.)
- When credentials seem missing or invalid
- When a design decision is genuinely 50/50 (rare — default to user's preferences in SPEC.md)

## When NOT to ask

- Naming variables, files, components
- Choosing between two near-equivalent libraries
- Styling decisions (follow design notes in SPEC.md)
- Whether to write tests (no)
- Whether to add features not in SPEC.md (no, log them in `IDEAS.md` and move on)

## Commit conventions

Conventional commits, but loose:

- `feat:` new feature
- `fix:` bug fix
- `chore:` setup, deps, config
- `style:` ui/styling
- `db:` schema changes

Squash merge to main, deploy on every push to main.

## Build order

See SPEC.md. Don't skip ahead. Each step ends with something deployable.
