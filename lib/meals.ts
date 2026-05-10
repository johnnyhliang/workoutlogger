export const PROTEIN_GOAL_G = 180;

export type ProteinQuickAdd = {
  label: string;
  protein: number;
  source: string;
};

export const proteinQuickAdds: ProteinQuickAdd[] = [
  { label: '3 eggs', protein: 21, source: 'eggs' },
  { label: '4 eggs', protein: 28, source: 'eggs' },
  { label: 'Chicken (palm)', protein: 35, source: 'chicken' },
  { label: 'Beef (palm)', protein: 35, source: 'beef' },
  { label: 'Fish (palm)', protein: 30, source: 'fish' },
  { label: 'Greek yogurt cup', protein: 20, source: 'yogurt' },
  { label: 'Cottage cheese cup', protein: 25, source: 'yogurt' },
  { label: 'Whey shake', protein: 25, source: 'shake' },
  { label: 'Tuna can', protein: 30, source: 'fish' },
];
