import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, real, index } from 'drizzle-orm/sqlite-core';

export const workouts = sqliteTable(
  'workouts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    dayKey: text('day_key').notNull(),
    notes: text('notes'),
    sleptOk: integer('slept_ok'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('workouts_date_idx').on(t.date)],
);

export const vertLog = sqliteTable(
  'vert_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    vertIn: real('vert_in').notNull(),
    notes: text('notes'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('vert_log_date_idx').on(t.date)],
);

export const pickupLog = sqliteTable(
  'pickup_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    sport: text('sport').notNull(),
    durationMin: integer('duration_min'),
    notes: text('notes'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('pickup_log_date_idx').on(t.date)],
);

export const sets = sqliteTable(
  'sets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workoutId: integer('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseKey: text('exercise_key').notNull(),
    setNumber: integer('set_number').notNull(),
    weight: real('weight'),
    reps: integer('reps').notNull(),
    rpe: integer('rpe'),
    isSwap: integer('is_swap').notNull().default(0),
    isWarmup: integer('is_warmup').notNull().default(0),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    index('sets_workout_id_idx').on(t.workoutId),
    index('sets_exercise_key_idx').on(t.exerciseKey),
  ],
);

export const meals = sqliteTable(
  'meals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    proteinG: integer('protein_g').notNull(),
    source: text('source').notNull(),
    note: text('note'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('meals_date_idx').on(t.date)],
);

export const bodyLog = sqliteTable(
  'body_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    weightLb: real('weight_lb').notNull(),
    bodyFatPct: real('body_fat_pct'),
    photoUrl: text('photo_url'),
    notes: text('notes'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('body_log_date_idx').on(t.date)],
);

export const dayNotes = sqliteTable('day_notes', {
  date: text('date').primaryKey(),
  note: text('note').notNull(),
  updatedAt: integer('updated_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const customExercises = sqliteTable('custom_exercises', {
  key: text('key').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  videoUrl: text('video_url'),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const guideContent = sqliteTable('guide_content', {
  id: integer('id').primaryKey(), // singleton; always 1
  content: text('content').notNull(),
  updatedAt: integer('updated_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutSet = typeof sets.$inferSelect;
export type NewWorkoutSet = typeof sets.$inferInsert;
export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
export type BodyLogEntry = typeof bodyLog.$inferSelect;
export type NewBodyLogEntry = typeof bodyLog.$inferInsert;
export type VertLogEntry = typeof vertLog.$inferSelect;
export type NewVertLogEntry = typeof vertLog.$inferInsert;
export type PickupLogEntry = typeof pickupLog.$inferSelect;
export type NewPickupLogEntry = typeof pickupLog.$inferInsert;
export type DayNote = typeof dayNotes.$inferSelect;
export type CustomExercise = typeof customExercises.$inferSelect;
export type GuideContent = typeof guideContent.$inferSelect;
