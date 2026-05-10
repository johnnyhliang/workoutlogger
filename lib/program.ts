export type DayKey = 'lower_heavy' | 'upper_full' | 'lower_power' | 'upper_pull';

export type Exercise = {
  key: string;
  name: string;
  sets: number;
  reps: string;
  notes?: string;
  swaps?: string[];
};

export type Workout = {
  label: string;
  exercises: Exercise[];
};

export const program = {
  weeks: ['A', 'B'] as const,
  days: {
    monday: 'lower_heavy',
    wednesday: 'upper_full',
    friday_A: 'lower_power',
    friday_B: 'upper_pull',
  } satisfies Record<string, DayKey>,
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
  } satisfies Record<DayKey, Workout>,
  daily_mobility: [
    { name: 'Band Pull-aparts', reps: '50' },
    { name: 'External Rotations', reps: '20 each side' },
    { name: 'Shoulder Dislocates', reps: '10' },
    { name: 'Sleeper Stretch', reps: '1 min each side' },
    { name: 'Deep Squat Hold', reps: '60 sec' },
  ],
};

const EXERCISE_NAMES: Record<string, string> = {
  trap_bar_dl: 'Trap Bar Deadlift',
  front_squat: 'Front Squat',
  bulgarian_ss: 'Bulgarian Split Squat',
  hack_squat: 'Hack Squat',
  walking_lunge: 'Walking Lunge',
  step_up: 'Step Up',
  split_squat: 'Split Squat',
  db_rdl: 'DB Romanian Deadlift',
  good_morning: 'Good Morning',
  hip_thrust: 'Hip Thrust',
  seated_calf: 'Seated Calf Raise',
  donkey_calf: 'Donkey Calf Raise',
  plank: 'Plank',
  ab_wheel: 'Ab Wheel',
  cable_crunch: 'Cable Crunch',
  db_ohp: 'DB Overhead Press',
  machine_press: 'Machine Press',
  landmine_press: 'Landmine Press',
  pull_up: 'Pull-up',
  assisted_pullup: 'Assisted Pull-up',
  inverted_row: 'Inverted Row',
  flat_db_bench: 'Flat DB Bench',
  dips: 'Dips',
  barbell_row: 'Barbell Row',
  cable_row: 'Cable Row',
  t_bar_row: 'T-Bar Row',
  db_lat_raise: 'DB Lateral Raise',
  machine_lat_raise: 'Machine Lateral Raise',
  preacher_curl: 'Preacher Curl',
  bayesian_curl: 'Bayesian Curl',
  cable_curl: 'Cable Curl',
  rope_pushdown: 'Rope Pushdown',
  skull_crusher: 'Skull Crusher',
  cgbp: 'Close-Grip Bench Press',
  reverse_pec_deck: 'Reverse Pec Deck',
  band_pullaparts: 'Band Pull-aparts',
  high_bar_squat: 'High Bar Squat',
  safety_bar_squat: 'Safety Bar Squat',
  goblet_squat: 'Goblet Squat',
  glute_bridge: 'Glute Bridge',
  cable_pullthrough: 'Cable Pull-through',
  kickstand_rdl: 'Kickstand RDL',
  b_stance_rdl: 'B-Stance RDL',
  nordic_curl: 'Nordic Curl',
  glute_ham_raise: 'Glute Ham Raise',
  straight_arm_pulldown: 'Straight-Arm Pulldown',
  pullover: 'Pullover',
  cable_lat_raise: 'Cable Lateral Raise',
  rope_hammer_curl: 'Rope Hammer Curl',
  cross_body_hammer: 'Cross-Body Hammer Curl',
  face_pulls: 'Face Pulls',
  rear_delt_fly: 'Rear Delt Fly',
  suitcase_carry: 'Suitcase Carry',
  trap_bar_carry: 'Trap Bar Carry',
};

export function exerciseName(key: string): string {
  for (const day of Object.values(program.workouts)) {
    const ex = day.exercises.find((e) => e.key === key);
    if (ex) return ex.name;
  }
  return EXERCISE_NAMES[key] ?? key;
}
