# V2 / Future Ideas

Park future features here so V1 stays focused.

## Build-step refinements (do during V1, not after)

These are things SPEC underspecified — keep them in mind while building the listed step.

- [ ] **Step 4 — edit/delete sets.** Long-press a set row → edit weight/reps or delete. Mid-set typos otherwise abandon the data.
- [ ] **Step 4 — pre-fill last weight as default** in weight input. Drops set logging from "type weight + type reps" to "tap reps".
- [ ] **Step 4 — +/- steppers** (2.5 lb weight, 1 rep) next to inputs. Numpad on phone is slow.
- [ ] **Step 4 — define warmup-set policy.** Recommend: skip warmups entirely. Only working sets count toward "beat last week".
- [ ] **Step 4 — round weight display** to nearest 2.5 lb (smallest standard plate pair). Schema can keep `real`.
- [ ] **Step 4 — log dates client-side.** Use `lib/date.ts → todayISO()` everywhere; never compute date in server actions (server is UTC, would mis-bucket evening sessions).
- [ ] **Step 4 — sleep_ok toggle on workout page.** Schema column exists; just need 1-tap "slept ≥7h?" on today's page.
- [ ] **Step 4 — vert + pickup quick-logs.** Tables exist; need light pages or home-page widgets.
- [ ] **Step 5 — "beat last week" subtleties.**
  - Compare same `exercise_key`, not same slot — so swaps don't pollute.
  - Pick one comparison metric: top set (heaviest weight × reps) OR total volume (sum of weight×reps). "Did any set match same set number" is noisy when set order varies.
- [ ] **Step 4/6 — Friday A/B via stored toggle, not date counter.** "Last friday type → toggle" survives skipped Fridays + first use. Cleaner than counting.
- [ ] **Step 4 — haptic on set log.** `navigator.vibrate(10)` on save. SPEC mentions for protein, applies here too.
- [ ] **Step 4 — reps range parsing.** Program reps like `"6-8"` are guidance strings; input field accepts any int.
- [ ] **Step 11 — favicon / icon real PNG.** Current PWA icon is SVG-only. iOS install needs PNG `apple-touch-icon` 180×180. Generate via sharp before deploy.

## Training

- [x] ~~PWA install~~ — manifest + icons shipped V1; offline mode still pending
- [ ] PWA offline mode with sync queue (gym Wi-Fi is unreliable)
- [ ] 1RM estimator per lift
- [ ] Per-exercise progression chart (line graph)
- [ ] Auto-detect deload week (3 weeks pushing → 1 light week)
- [ ] RPE-based load suggestions ("you logged RPE 9 for 3 weeks, deload")
- [ ] Volume per muscle group dashboard
- [ ] Plate calculator (input target, see plates per side)
- [ ] Rest timer auto-starts after logging a set (3-5 min plyo, 3 min heavy compound)
- [ ] Plyometric quality logger (felt explosive vs. felt slow)
- [ ] Custom / off-program workout flow (random pickup-day garage session)
- [ ] Persist last-used swap choice — if user swapped back_squat → hack_squat last week, default to hack_squat this week
- [ ] RPE entry UI on each set (column already exists in `sets`)

## Sport

- [x] ~~Pickup session log~~ — table shipped V1; UI in step 4
- [x] ~~Vert tracking~~ — table shipped V1; UI in step 4
- [ ] Volleyball-specific: touches, swings, blocks
- [ ] Basketball-specific: minutes, shots, fatigue

## Nutrition

- [ ] Calorie tracking option (toggle on/off)
- [ ] Water tracker
- [ ] Protein-per-meal split (target 40g per meal × 4 meals)
- [ ] Meal timing notes (pre/post workout)
- [ ] Photo log of meals

## Body

- [ ] Photo upload on weight page (Vercel Blob or Cloudinary free tier)
- [ ] Side-by-side photo compare (week N vs week N+8)
- [ ] Tape measurements (waist, chest, arms, thighs) — better aesthetics signal than scale
- [ ] Skinfold / body fat tracking
- [ ] Sleep hours (real number) instead of just slept_ok toggle

## Social / motivation

- [ ] Streak counter (weeks of 3+ sessions)
- [ ] Personal records page (every PR ever hit)
- [ ] Export shareable progress card (PNG)
- [ ] Weekly email summary

## Infra

- [x] ~~Simple password auth~~ — shipped V1 (`proxy.ts`, cookie-gated, `APP_PASSWORD` env)
- [ ] Export all data as JSON (one server action; cheap insurance against data loss)
- [ ] Import from JSON
- [ ] Backup script that dumps Turso to a file weekly
- [ ] Multi-device sync indicator
- [ ] Conflict resolution if two devices edit same workout
- [ ] Vercel cron warmup ping (hourly during waking hours) to dodge Hobby-tier cold-start hang
- [ ] Sentry or similar for surfacing failed server actions (silent failures = abandoned data)

## Hosting notes

- **GitHub Pages: not viable** as architected. SPEC uses Next.js server actions = needs runtime server. GH Pages is static-only. The hack (static export + libsql in browser) requires shipping the auth token in the JS bundle — anyone with the URL could wipe the DB. Vercel free tier (Hobby) is the right target. If GH Pages becomes a hard requirement later: rewrite as static + client-side libsql with per-user-derived encryption key, or move to a free Cloudflare Pages + Workers stack which does support server functions.

## Wild ideas

- [ ] Voice logging ("3 sets of squats at 225 for 5") with Whisper
- [ ] Apple Watch companion for rest timer + heart rate
- [ ] Open-source it as a "personal training tracker template" — would be a great YC / portfolio piece
- [ ] AI coach mode — pulls in pickup performance + lift logs and suggests next session focus
