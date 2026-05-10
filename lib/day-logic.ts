import type { DayKey } from './program';

export function suggestDayKey(
  weekday: string,
  lastFridayType: DayKey | null,
): DayKey | null {
  switch (weekday) {
    case 'monday':
      return 'lower_heavy';
    case 'wednesday':
      return 'upper_full';
    case 'friday':
      // Toggle on the last completed Friday workout. Default to lower_power.
      return lastFridayType === 'lower_power' ? 'upper_pull' : 'lower_power';
    default:
      return null;
  }
}

export function dayLabel(key: DayKey): string {
  switch (key) {
    case 'lower_heavy':
      return 'Lower (Heavy)';
    case 'upper_full':
      return 'Upper (Full)';
    case 'lower_power':
      return 'Lower (Power)';
    case 'upper_pull':
      return 'Upper (Pull)';
  }
}
