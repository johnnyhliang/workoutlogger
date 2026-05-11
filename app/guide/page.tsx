export const dynamic = 'force-static';

export const metadata = {
  title: 'Guide · Lift Tracker',
};

export default function GuidePage() {
  return (
    <main className="px-4 pt-6 pb-12">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Field Manual</h1>
      <p className="text-xs text-[var(--color-muted)] mb-6">
        Goals · program · app map · optimal logging flow · how to progress fastest.
      </p>

      <nav className="text-xs text-[var(--color-muted)] mb-6 flex flex-wrap gap-x-3 gap-y-1">
        <a href="#goals" className="underline">Goals</a>
        <a href="#program" className="underline">Program</a>
        <a href="#app" className="underline">App map</a>
        <a href="#flow" className="underline">Logging flow</a>
        <a href="#progress" className="underline">Progress strategy</a>
        <a href="#mistakes" className="underline">Mistakes to avoid</a>
        <a href="#weekly" className="underline">Weekly checklist</a>
      </nav>

      {/* GOALS */}
      <section id="goals" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1 · The four goals</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">
          Every UX decision in this app exists to keep these four moving in the right direction.
        </p>
        <ol className="space-y-3 text-sm">
          <li>
            <strong>Vertical jump</strong> — main athletic priority. Driven by force production (heavy squat / RDL) × reactive strength (plyo: box jumps, broad jumps, pogos). Measured biweekly in <code>/vert</code>.
          </li>
          <li>
            <strong>Upper body aesthetics + function</strong> — V-taper. Shoulders (OHP + 8–12 sets lat raises/week), back (rows + pulldowns), triceps (OH + push), forearms (hammer curls, farmer carry). Tracked indirectly via lifts in <code>/history</code> and body comp in <code>/weight</code>.
          </li>
          <li>
            <strong>Stability under contact</strong> — keeping balance when pushed in pickup. Built through unilateral leg work (Bulgarian split squat, single-leg RDL), anti-rotation (farmer/suitcase carry, hanging leg raise), and heavy bilateral compounds (sets you brace under).
          </li>
          <li>
            <strong>Athletic coordination</strong> — feel of body in space. Addressed by plyos + single-leg work + <em>consistent</em> pickup. The pickup count in <code>/pickup</code> is the leading indicator; aim for 2/week minimum.
          </li>
        </ol>
      </section>

      {/* PROGRAM */}
      <section id="program" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2 · The program</h2>
        <p className="text-sm mb-3">
          3 lift days/week (Mon · Wed · Fri) with Friday alternating between A and B weeks. Pickup play 2x/week, ideally Fri evening + Sat or Sun.
        </p>

        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
          <h3 className="font-semibold text-sm mb-2">Monday — Lower (Heavy)</h3>
          <ul className="text-xs space-y-1 text-[var(--color-muted)]">
            <li>Box Jumps 4×3 <span className="italic">(do FIRST while fresh)</span></li>
            <li>Back Squat 4×5</li>
            <li>Bulgarian Split Squat 3×8/leg</li>
            <li>Romanian Deadlift 3×8</li>
            <li>Standing Calf Raise 4×10</li>
            <li>Hanging Leg Raise 3×max</li>
          </ul>
        </div>

        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
          <h3 className="font-semibold text-sm mb-2">Wednesday — Upper (Full)</h3>
          <ul className="text-xs space-y-1 text-[var(--color-muted)]">
            <li>Overhead Press 4×6</li>
            <li>Lat Pulldown or Pull-up negatives 4×6–8</li>
            <li>Incline DB Bench 3×8</li>
            <li>Chest-Supported Row 3×8</li>
            <li>Cable Lateral Raise 4×15</li>
            <li>Incline DB Curl 3×10</li>
            <li>Overhead Tricep Extension 3×10</li>
            <li>Face Pulls 3×15</li>
          </ul>
        </div>

        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
          <h3 className="font-semibold text-sm mb-2">Friday A — Lower (Power)</h3>
          <ul className="text-xs space-y-1 text-[var(--color-muted)]">
            <li>Broad Jumps 4×3 <span className="italic">(do FIRST)</span></li>
            <li>Front Squat 4×6</li>
            <li>Hip Thrust 3×10</li>
            <li>Single-Leg RDL 3×8/leg</li>
            <li>Leg Curl 3×12</li>
            <li>Pogo Jumps 3×10 <span className="italic">(reactive, minimal contact)</span></li>
          </ul>
        </div>

        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 mb-3">
          <h3 className="font-semibold text-sm mb-2">Friday B — Upper (Pull-focused)</h3>
          <ul className="text-xs space-y-1 text-[var(--color-muted)]">
            <li>Pull-up Negatives 4×3–5 <span className="italic">(5+ sec descent)</span></li>
            <li>Chest-Supported Row 4×8</li>
            <li>Lat Pulldown 3×10</li>
            <li>DB Lateral Raise 4×15</li>
            <li>Hammer Curl 3×10</li>
            <li>Reverse Pec Deck 3×15</li>
            <li>Farmer Carry 3×40 sec</li>
          </ul>
        </div>

        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-4">
          <h3 className="font-semibold text-sm mb-2">Daily mobility (5 min after lift)</h3>
          <ul className="text-xs space-y-1 text-[var(--color-muted)]">
            <li>Band Pull-aparts ×50</li>
            <li>External Rotations ×20/side</li>
            <li>Shoulder Dislocates ×10</li>
            <li>Sleeper Stretch 1 min/side</li>
            <li>Deep Squat Hold 60 sec</li>
          </ul>
        </div>
      </section>

      {/* APP MAP */}
      <section id="app" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3 · App map</h2>
        <ul className="space-y-3 text-sm">
          <li>
            <strong><code>/</code> Today</strong> — what to lift right now. Auto-detects the day, shows last-week comparison, beat-last-week badge, swap menu, sleep toggle, pickup quick-tap, mobility checklist. The card &quot;W&quot; button marks a set as warmup (excluded from progression).
          </li>
          <li>
            <strong><code>/history</code> History</strong> — every workout, reverse-chronological. Filter dropdown picks one exercise to chart its top-set trajectory + last 6 sessions side-by-side.
          </li>
          <li>
            <strong><code>/meals</code> Protein</strong> — big total/180g number, quick-add grid, custom inline form, edit & delete entries, 7-day sparkline. Color band turns red after 6pm if you&apos;re under 100g.
          </li>
          <li>
            <strong><code>/weight</code> Body</strong> — daily log + 7-day moving average. Header links to <code>/vert</code>, <code>/pickup</code>, <code>/plates</code>.
          </li>
          <li>
            <strong><code>/vert</code> Vert</strong> — single quick-log (inches + notes). Best-ever readout + trend chart. Test biweekly minimum.
          </li>
          <li>
            <strong><code>/pickup</code> Pickup</strong> — full session log (sport, duration, notes). 4-week count readout. The basketball/volleyball quick-tap on Today writes to this same table.
          </li>
          <li>
            <strong><code>/plates</code> Plates</strong> — utility, no DB. Target + bar selector → plates per side as colored pills. Use in the gym instead of mental math.
          </li>
          <li>
            <strong><code>/custom</code> Custom</strong> — off-program / garage workout. Type any exercise name, add cards, log sets normally. Stays out of the regular Today rotation; visible in History.
          </li>
        </ul>
      </section>

      {/* LOGGING FLOW */}
      <section id="flow" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4 · Optimal logging flow</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">
          Designed so the phone is in your pocket more than your hand.
        </p>

        <h3 className="font-semibold text-sm mt-4 mb-2">Pre-workout (30 seconds)</h3>
        <ol className="list-decimal list-inside text-sm space-y-1 text-[var(--color-muted)]">
          <li>Open Today (PWA from home screen).</li>
          <li>Glance at the first card — confirm day is right; if not, tap &quot;Override day&quot;.</li>
          <li>Read &quot;Last week:&quot; to know what to beat.</li>
        </ol>

        <h3 className="font-semibold text-sm mt-4 mb-2">Per set (3-5 taps max)</h3>
        <ol className="list-decimal list-inside text-sm space-y-1 text-[var(--color-muted)]">
          <li>(Warmups only) Tap <strong>W</strong> on the row.</li>
          <li>Tap <strong>+</strong>/<strong>−</strong> to nudge weight from last week, or tap the field to type.</li>
          <li>Tap reps stepper.</li>
          <li>Tap <strong>Log</strong>. Rest timer auto-pops.</li>
          <li>Phone in pocket until timer beeps.</li>
        </ol>

        <h3 className="font-semibold text-sm mt-4 mb-2">Post-workout (15 seconds)</h3>
        <ol className="list-decimal list-inside text-sm space-y-1 text-[var(--color-muted)]">
          <li>Scroll down — tap <strong>Slept ≥7h?</strong> Yes/No.</li>
          <li>If you played pickup before/after, tap 🏀 or 🏐 once.</li>
          <li>Expand <strong>Daily Mobility</strong>, check off as you do them (or skip — it&apos;s a nudge).</li>
        </ol>

        <h3 className="font-semibold text-sm mt-4 mb-2">Protein (passive, throughout day)</h3>
        <ol className="list-decimal list-inside text-sm space-y-1 text-[var(--color-muted)]">
          <li>Eat → open /meals → one tap on the matching quick-add (3 eggs, palm of chicken, shake, etc).</li>
          <li>For something not in the grid, tap <strong>Custom…</strong> → enter grams.</li>
          <li>Goal: 180g/day, ideally with the color showing green (≥160g) by dinner.</li>
        </ol>

        <h3 className="font-semibold text-sm mt-4 mb-2">Weekly (~2 min)</h3>
        <ol className="list-decimal list-inside text-sm space-y-1 text-[var(--color-muted)]">
          <li>Sunday morning: weigh in → /weight → enter lb.</li>
          <li>Every other Saturday: jump test → /vert → enter inches.</li>
          <li>Glance at /history → filter your two main lifts (back squat, OHP) → are top sets trending up?</li>
        </ol>
      </section>

      {/* PROGRESS STRATEGY */}
      <section id="progress" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5 · Progress strategy</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">
          What actually moves each goal forward. Ordered by leverage.
        </p>

        <h3 className="font-semibold text-sm mt-4 mb-1 text-[var(--color-accent)]">Force + reactivity = vert</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-[var(--color-muted)]">
          <li>Plyos go first in the session, every time. CNS-fresh plyos build power; tired plyos build grinding. The notes on box / broad / pogo jumps in the cards exist for a reason.</li>
          <li>Aim for &quot;beat last week&quot; on back squat &amp; front squat every session — even +1 rep counts. Force production is the slow rail; consistency matters more than heroic single sessions.</li>
          <li>RDL is the secret-weapon hip-extension lift for vert. Don&apos;t skip it because it&apos;s boring.</li>
          <li>Pogo jumps train tendon stiffness — keep them snappy, minimal ground contact. If contact time creeps up, end the set.</li>
        </ul>

        <h3 className="font-semibold text-sm mt-4 mb-1 text-[var(--color-accent)]">Volume + protein = aesthetics</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-[var(--color-muted)]">
          <li>Lateral raises hit 8 sets/week via cable + DB versions on Wed + Fri B. This is what builds shoulder width.</li>
          <li>Back work shows up 3-4 times/week between rows, pulldowns, and pull-up negatives. V-taper needs the lats.</li>
          <li>Protein floor 180g/day is non-negotiable for muscle gain at your bodyweight (~6&apos;3&quot; recreational athlete).</li>
          <li>Slight deficit (not aggressive) — you&apos;ll see proportion changes around week 8 in the body comp page if scale weight is flat or slowly dropping.</li>
        </ul>

        <h3 className="font-semibold text-sm mt-4 mb-1 text-[var(--color-accent)]">Single-leg + carries = stability</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-[var(--color-muted)]">
          <li>Bulgarian split squat and single-leg RDL are doing 80% of the &quot;don&apos;t get pushed around&quot; work. They feel less impressive than barbell lifts; do them anyway.</li>
          <li>Farmer carries on Fri B train grip + anti-rotation simultaneously. 40 seconds is enough — go heavy.</li>
          <li>Hanging leg raise = anti-extension core. Bracing under heavy compounds = anti-flexion core. Both buckets get hit.</li>
        </ul>

        <h3 className="font-semibold text-sm mt-4 mb-1 text-[var(--color-accent)]">Reps + sport = coordination</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-[var(--color-muted)]">
          <li>Awkwardness after a growth spurt fixes itself with reps in your new body — pickup play 2x/week is non-negotiable. The /pickup count is the metric.</li>
          <li>Full ROM compound lifts (deep squat, full overhead press) re-train proprioception in your end-ranges. Don&apos;t partial-rep these.</li>
          <li>Plyos serve double duty here — landing mechanics retrain themselves through reps.</li>
        </ul>

        <h3 className="font-semibold text-sm mt-4 mb-1 text-[var(--color-accent)]">Recovery = the hidden multiplier</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-[var(--color-muted)]">
          <li>Sleep ≥7h is the single biggest training-quality lever. If &quot;slept_ok&quot; trends No for a week, expect plateaus on every lift.</li>
          <li>Every 4-6 weeks, deload: drop working weight ~15% for a week. Listed in IDEAS as &quot;auto-detect&quot; — for now, deload manually when you stall on the same weight for 3 sessions.</li>
          <li>RPE field exists in the schema — note it in your head: if RPE on working sets is 9+ for multiple sessions, you&apos;re approaching a deload.</li>
        </ul>
      </section>

      {/* MISTAKES */}
      <section id="mistakes" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6 · Mistakes to avoid</h2>
        <ul className="text-sm space-y-2 list-disc list-inside text-[var(--color-muted)]">
          <li>Putting plyos after squats. CNS fatigue kills the power adaptation.</li>
          <li>Forgetting to tap <strong>W</strong> on warmup sets. Warmups inflate volume + tank the beat-last-week badge.</li>
          <li>Skipping single-leg work because barbell feels &quot;more productive&quot;. The unilateral work is where the goal-specific gains live.</li>
          <li>Chasing a number on back squat at the expense of clean reps. Bad reps build bad patterns and you bring them into pickup.</li>
          <li>Hitting 180g protein by inhaling shakes only. Whole-food sources (chicken, eggs, beef) eat better and digest better.</li>
          <li>Not logging the rest day. If you played pickup, tap 🏀 — even if you didn&apos;t lift, the day counts toward goal #4.</li>
          <li>Letting Friday A/B drift because of skipped Fridays. The app auto-alternates from your last completed Friday — trust it.</li>
        </ul>
      </section>

      {/* WEEKLY CHECKLIST */}
      <section id="weekly" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7 · Weekly success checklist</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">
          End of each week, scan this. If all bullets check, you&apos;re on track.
        </p>
        <ul className="text-sm space-y-1.5">
          <li className="flex gap-2">
            <span className="text-[var(--color-accent)]">✓</span>
            <span>3 lift sessions completed (Mon · Wed · Fri)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--color-accent)]">✓</span>
            <span>2 pickup sessions logged (any combination of 🏀 / 🏐)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--color-accent)]">✓</span>
            <span>At least 5 days hit ≥160g protein</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--color-accent)]">✓</span>
            <span>Slept_ok = Yes on ≥2 of 3 lift days</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--color-accent)]">✓</span>
            <span>Beat last week on at least 1 set of back squat or front squat</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--color-accent)]">✓</span>
            <span>Sunday weigh-in entered (or noted skipped)</span>
          </li>
          <li className="flex gap-2 mt-2 text-[var(--color-muted)]">
            <span>+</span>
            <span>Every other week: vert test entered</span>
          </li>
        </ul>

        <p className="text-xs text-[var(--color-muted)] mt-4 italic">
          Hit this checklist for 12 consecutive weeks and you&apos;ll be a measurably different athlete — both in the data here and on the court.
        </p>
      </section>

      <p className="text-xs text-[var(--color-muted)] mt-8 text-center">
        Goals + program from SPEC.md · synthesis from training literature · keep this honest, update when your priorities shift.
      </p>
    </main>
  );
}
