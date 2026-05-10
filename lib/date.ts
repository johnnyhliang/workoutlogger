// All dates in this app are local-day ISO (YYYY-MM-DD), not UTC.
// Server is UTC; we never compute a date there. Compute in the browser
// (client component) and pass the string to server actions.

export function todayISO(d: Date = new Date()): string {
  // 'en-CA' is YYYY-MM-DD with 2-digit padding.
  return d.toLocaleDateString('en-CA');
}

export function weekdayKey(d: Date = new Date()): string {
  return d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
}
