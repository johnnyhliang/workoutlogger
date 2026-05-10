# Lift Tracker — Project Spec

A personal training + nutrition tracker for Johnny (6'3", recreational athlete, college). Single-user, no auth, deployed to Vercel free tier with Turso for persistence.

## Goals (why this app exists)

The user is training for four overlapping goals and the app must serve all of them:

1. **Vertical jump** — main athletic priority. Lower body program is built around plyometrics + heavy bilateral squats + hip-driven posterior chain work.
2. **Upper body aesthetics + athletic function** — shoulders (V-taper), back, triceps, forearms. Bottom-heavy frame needs upper body brought up.
3. **Stability under contact** — keeping balance when pushed/hit during pickup basketball and volleyball. Built through unilateral leg work, anti-rotation core, heavy compound lifting.
4. **Athletic coordination** — user had an early growth spurt and feels he moves awkwardly. Addressed through plyometrics, single-leg work, full ROM compounds, and consistent sport play (2x/week pickup).

The app's job is to make tracking these four goals so frictionless that the user actually does it for 12+ weeks. Every UX decision should optimize for **<30 seconds to log a complete workout** and **zero mental energy required to know what to do today**.

## Tech stack

- **Next.js 14+** with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **Turso (libSQL)** for database — `@libsql/client`
- **Drizzle ORM** for type-safe queries
- **Deploy:** Vercel free tier
- **Auth:** none (single user, security-by-obscurity URL is fine for now; can add a simple password later)

## Project structure

```
/app
  /page.tsx              — today's workout (home)
  /history/page.tsx      — past workout log
  /meals/page.tsx        — protein tracker
  /weight/page.tsx       — weekly weigh-ins + photos
  /api/...               — server actions for DB writes
/db
  /schema.ts             — Drizzle schema
  /client.ts             — Turso client setup
/lib
  /program.ts            — hardcoded workout program (see below)
  /meals.ts              — protein quick-add list
/components
  /ExerciseCard.tsx      — log sets for one exercise
  /SwapMenu.tsx          — exercise substitution dropdown
  /BeatLastWeekBadge.tsx — green/red indicator
  /ProteinCounter.tsx    — increment buttons
```

## Database schema (Drizzle / SQLite)

```ts
// workouts: one row per training session
workouts {
  id: integer primary key autoincrement
  date: text (ISO date)
  day_key: text  // 'lower_heavy' | 'upper_full' | 'lower_power' | 'upper_pull'
  notes: text nullable
  created_at: integer (unix ms)
}

// sets: one row per set performed
sets {
  id: integer primary key autoincrement
  workout_id: integer references workouts.id
  exercise_key: text  // matches keys in program.ts
  set_number: integer
  weight: real  // lbs, nullable for bodyweight
  reps: integer
  rpe: integer nullable  // 1-10
  is_swap: integer  // 0 or 1, was this a swapped exercise
  created_at: integer
}

// meals: protein log entries
meals {
  id: integer primary key autoincrement
  date: text (ISO date)
  protein_g: integer
  source: text  // 'eggs' | 'chicken' | 'shake' | 'yogurt' | 'beef' | 'fish' | 'custom'
  note: text nullable
  created_at: integer
}

// body_log: weekly weigh-ins
body_log {
  id: integer primary key autoincrement
  date: text (ISO date)
  weight_lb: real
  photo_url: text nullable  // optional, store in Vercel Blob if added later
  notes: text nullable
}
```

## Program data (hardcode in /lib/program.ts)

The user runs a 3-day split with Friday alternating between weeks. Lifting Mon / Wed / Fri. Pickup basketball or volleyball Fri evening + Sat or Sun.

```ts
export const program = {
  weeks: ['A', 'B'],
  days: {
    monday: 'lower_heavy',
    wednesday: 'upper_full',
    friday_A: 'lower_power',
    friday_B: 'upper_pull',
  },
  workouts: {
    lower_heavy: {
      label: 'Lower (Heavy)',
      exercises: [
        { key: 'box_jump', name: 'Box Jumps', sets: 4, reps: '3', notes: 'Do FIRST while fresh' },
        { key: 'back_squat', name: 'Back Squat', sets: 4, reps: '5', swaps: ['trap_bar_dl', 'front_squat', 'bulgarian_ss', 'hack_squat'] },
        { key: 'bulgarian_ss', name: 'Bulgarian Split Squat', sets: 3, reps: '8 each leg', swaps: ['walking_lunge', 'step_up', 'split_squat'] },
        { key: 'rdl', name: 'Romanian Deadlift', sets: 3, reps: '8', swaps: ['db_rdl', 'good_morning', 'hip_thrust'] },
        { key: 'standing_calf', name: 'Standing Calf Raise', sets: 4, reps: '10', swaps: ['seated_calf', 'donkey_calf'] },
        { key: 'leg_raise', name: 'Hanging Leg Raise', sets: 3, reps: 'max', swaps: ['plank', 'ab_wheel', 'cable_crunch'] },
      ],
    },
    upper_full: {
      label: 'Upper (Full)',
      exercises: [
        { key: 'ohp', name: 'Overhead Press', sets: 4, reps: '6', swaps: ['db_ohp', 'machine_press', 'landmine_press'] },
        { key: 'pulldown_or_pullup', name: 'Lat Pulldown / Pull-up Negatives', sets: 4, reps: '6-8', swaps: ['pull_up', 'assisted_pullup', 'inverted_row'] },
        { key: 'incline_db_bench', name: 'Incline DB Bench', sets: 3, reps: '8', swaps: ['flat_db_bench', 'machine_press', 'dips'] },
        { key: 'chest_supported_row', name: 'Chest-Supported Row', sets: 3, reps: '8', swaps: ['barbell_row', 'cable_row', 't_bar_row'] },
        { key: 'cable_lat_raise', name: 'Cable Lateral Raise', sets: 4, reps: '15', swaps: ['db_lat_raise', 'machine_lat_raise'] },
        { key: 'incline_db_curl', name: 'Incline DB Curl', sets: 3, reps: '10', swaps: ['preacher_curl', 'bayesian_curl', 'cable_curl'] },
        { key: 'oh_tri_ext', name: 'Overhead Tricep Extension', sets: 3, reps: '10', swaps: ['rope_pushdown', 'skull_crusher', 'cgbp'] },
        { key: 'face_pulls', name: 'Face Pulls', sets: 3, reps: '15', swaps: ['reverse_pec_deck', 'band_pullaparts'] },
      ],
    },
    lower_power: {
      label: 'Lower (Power)',
      exercises: [
        { key: 'broad_jump', name: 'Broad Jumps', sets: 4, reps: '3', notes: 'Do FIRST while fresh' },
        { key: 'front_squat', name: 'Front Squat', sets: 4, reps: '6', swaps: ['high_bar_squat', 'safety_bar_squat', 'goblet_squat'] },
        { key: 'hip_thrust', name: 'Hip Thrust', sets: 3, reps: '10', swaps: ['glute_bridge', 'cable_pullthrough'] },
        { key: 'sl_rdl', name: 'Single-Leg RDL', sets: 3, reps: '8 each leg', swaps: ['kickstand_rdl', 'b_stance_rdl'] },
        { key: 'leg_curl', name: 'Leg Curl', sets: 3, reps: '12', swaps: ['nordic_curl', 'glute_ham_raise'] },
        { key: 'pogo_jump', name: 'Pogo Jumps', sets: 3, reps: '10', notes: 'Reactive stiffness, minimal ground contact' },
      ],
    },
    upper_pull: {
      label: 'Upper (Pull-focused)',
      exercises: [
        { key: 'pullup_negative', name: 'Pull-up Negatives', sets: 4, reps: '3-5', notes: '5+ sec descent. Switch to weighted pull-ups when you hit 8 strict reps.' },
        { key: 'chest_supported_row', name: 'Chest-Supported Row', sets: 4, reps: '8', swaps: ['barbell_row', 'cable_row', 't_bar_row'] },
        { key: 'lat_pulldown', name: 'Lat Pulldown', sets: 3, reps: '10', swaps: ['straight_arm_pulldown', 'pullover'] },
        { key: 'db_lat_raise', name: 'DB Lateral Raise', sets: 4, reps: '15', swaps: ['cable_lat_raise', 'machine_lat_raise'] },
        { key: 'hammer_curl', name: 'Hammer Curl', sets: 3, reps: '10', swaps: ['rope_hammer_curl', 'cross_body_hammer'] },
        { key: 'reverse_pec_deck', name: 'Reverse Pec Deck', sets: 3, reps: '15', swaps: ['face_pulls', 'rear_delt_fly'] },
        { key: 'farmer_carry', name: 'Farmer Carry', sets: 3, reps: '40 sec', swaps: ['suitcase_carry', 'trap_bar_carry'] },
      ],
    },
  },
  daily_mobility: [
    { name: 'Band Pull-aparts', reps: 50 },
    { name: 'External Rotations', reps: '20 each side' },
    { name: 'Shoulder Dislocates', reps: 10 },
    { name: 'Sleeper Stretch', reps: '1 min each side' },
    { name: 'Deep Squat Hold', reps: '60 sec' },
  ],
};
```

## Meal/protein tracking

**Goal:** 180g protein per day. Don't track calories or macros. Just protein.

Quick-add buttons (one tap each):

```ts
export const proteinQuickAdds = [
  { label: '3 eggs', protein: 21 },
  { label: '4 eggs', protein: 28 },
  { label: 'Chicken (palm)', protein: 35 },
  { label: 'Beef (palm)', protein: 35 },
  { label: 'Fish (palm)', protein: 30 },
  { label: 'Greek yogurt cup', protein: 20 },
  { label: 'Cottage cheese cup', protein: 25 },
  { label: 'Whey shake', protein: 25 },
  { label: 'Tuna can', protein: 30 },
  { label: 'Custom...', protein: 0 }, // opens input
];
```

UI: big number at top showing today's total (e.g., "127 / 180g"), color-coded:
- Red: <100g and it's after 6pm
- Yellow: 100-160g
- Green: 160g+

Below: grid of quick-add buttons. Tap → adds, big haptic feedback if mobile, optimistic UI. Below that: today's log entries with delete button per entry.

## Page-by-page UX

### `/` — Today's Workout

**Top of page:** Today's date + auto-detected day (based on most recent workout in DB and the calendar).

**Logic for "what day is today":**

```
let lastWorkout = most recent row in workouts table
let todayWeekday = current weekday

if today is Monday → lower_heavy
if today is Wednesday → upper_full
if today is Friday:
  count completed friday workouts in last 4 weeks
  if even count → lower_power, odd → upper_pull
  (alternates each Friday)
if today is Tue/Thu/Sat/Sun:
  show "rest day or pickup" message
  but allow user to override and pick any workout to log
```

Allow "Override day" dropdown so user can log any workout type on any day (life happens).

**Body of page:** List of exercises for today's workout. Each one is a card:

```
┌─────────────────────────────────────┐
│ Back Squat                  [Swap ▾]│
│ 4 × 5 reps                          │
│ Last week: 185×5,5,5,4 ✓            │
│                                     │
│ [Set 1: ___ lb × ___ reps]          │
│ [Set 2: ___ lb × ___ reps]          │
│ [Set 3: ___ lb × ___ reps]          │
│ [Set 4: ___ lb × ___ reps]          │
│                                     │
│ [Beat Last Week: 1 rep or 2.5 lb]   │
└─────────────────────────────────────┘
```

When user taps "Swap" → dropdown of swaps from program.ts → user picks → that card now logs sets for the swap (mark `is_swap=1` in DB so progression tracks the original lift's history but allows swap data to coexist).

When all sets logged → green check on the card. When all cards have at least 1 set logged → "Save Workout" button at bottom commits the workout row.

Auto-save sets as they're entered (optimistic, debounced) so nothing is lost if the page closes.

**Bottom of page:** "Daily Mobility" collapsible section with checkboxes for the 5 mobility exercises. Resets daily.

### `/history` — Past Workouts

Reverse chronological list of workouts. Each entry shows date, day_key, top set of each exercise. Tap to expand → all sets. Filter by exercise to see progression (e.g., "show me all back squat sessions") with a simple line chart.

### `/meals` — Protein Tracker

Top: big "127 / 180g" number for today.

Grid of quick-add buttons (see proteinQuickAdds above). Tap → adds row to meals table for today.

Below: today's entries (small list), each with × to delete.

Below that: 7-day mini chart showing daily protein totals, line at 180.

### `/weight` — Weekly Check-in

Simple form: weight in lbs, optional photo upload (skip photo for V1, just weight).

List of past entries with weight and 7-day moving average. Simple line chart of weight over time.

## Server actions / API

Use Next.js Server Actions (no separate API routes needed). Examples:

```ts
'use server';

export async function logSet(input: {
  workoutDate: string;
  dayKey: string;
  exerciseKey: string;
  setNumber: number;
  weight: number | null;
  reps: number;
  rpe?: number;
  isSwap?: boolean;
}) { /* upsert workout if needed, insert set */ }

export async function logProtein(input: { date: string; proteinG: number; source: string }) { ... }

export async function logBodyWeight(input: { date: string; weightLb: number }) { ... }

export async function getTodayWorkout(date: string) { /* returns last week's sets per exercise for "beat last week" */ }

export async function getProteinForDay(date: string) { ... }
```

## "Beat Last Week" logic

For each exercise on today's workout:

1. Find the most recent workout where this exercise (or its current swap target) was logged.
2. Sum up the volume: total reps × weight, OR top set: heaviest weight × reps.
3. Display: "Last week: 185×5,5,5,4". After user logs current sets, compare:
   - Did any set match or exceed last week's same set number in (weight × reps)? → green check
   - Did all sets fall short? → red X
4. The badge motivates the user to push at least one set harder than last week.

If no previous data exists for that exercise: show "First time! Pick a starting weight."

## Environment setup

`.env.local` (gitignored):

```
TURSO_DATABASE_URL=libsql://lift-tracker-johnnyhliang.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
```

In Vercel dashboard, add same two env vars under Project Settings → Environment Variables.

## Drizzle migration

Use `drizzle-kit` to generate and push schema:

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

Configure `drizzle.config.ts`:

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;
```

## Design / styling

- **Mobile-first.** This will be used in the gym on a phone. Big tap targets (min 44px), big numbers, dark mode default.
- **Tailwind only, no UI library.** Keep it light.
- **Color palette:** dark grey/black background, white text, single accent color (suggest emerald-500 for "success/beat last week" and red-500 for "missed"). Muted yellow for "in progress".
- **Numbers are the design.** The app should feel like a calculator more than a journal. Logging a set should be 3 taps max: tap weight, type number, tap reps, type number.
- **No animations beyond transitions.** No splash screens, loaders, modals. Snappy.

## Build order (so Claude Code can ship incrementally)

1. **Setup:** Next.js scaffold, Tailwind, env vars, Drizzle config, Turso connection.
2. **Schema + migration:** push initial schema to Turso.
3. **Program data:** create `/lib/program.ts` with full data above.
4. **Today's workout page:** detect day, render exercise cards, log sets to DB. Skip "beat last week" comparison initially — just log.
5. **Add "beat last week" logic:** query last session per exercise, render badges.
6. **Add swap functionality:** dropdown UI, mark `is_swap` in DB.
7. **Daily mobility checklist** at bottom of today's page.
8. **History page:** list workouts, expand to see sets, simple per-exercise chart.
9. **Meals page:** quick-add buttons, today's total, delete entries.
10. **Weight page:** simple form + list + chart.
11. **Polish:** dark mode, mobile testing, deploy to Vercel.

Each step should be a single PR / commit so progress is visible and rollback is easy.

## Out of scope for V1 (but design for it)

- Auth / multiple users (it's just Johnny for now; URL obscurity is fine)
- Photo uploads on weight page
- Export/import data
- Workout reordering
- Custom exercise creation (use swap list for now)
- Native mobile app (PWA-friendly is plenty)
- Notifications

## Future V2 ideas (don't build now)

- PWA install prompt for home screen
- Offline mode with sync queue
- 1RM estimator and progression charts per lift
- Sleep + RPE correlation
- Auto-deload week detection
- Volleyball-specific session log (touches, swings, vert)
- Pickup game tracker

---

# Summary for Claude Code

You are building a personal lift tracker for a college athlete. The hard requirement is **shipped, working, deployed in 1-2 evening sessions**. Optimize for the user actually using it — no friction, no decisions, no thinking. Every screen should answer one question:

- `/` — "What do I do right now and did I beat last week?"
- `/meals` — "How much protein left to hit today?"
- `/weight` — "Am I trending the right way?"
- `/history` — "What have I been doing?"

Hardcode the program. Don't build a workout builder. Don't build settings. Don't build account management. Build the four pages above, deploy to Vercel, hand it back.

Start with step 1 of the build order. Confirm Turso credentials are in `.env.local` before running migrations.
