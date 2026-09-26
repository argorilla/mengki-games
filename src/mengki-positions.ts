export interface MengkiPosition {
  x: number;
  y: number;
  hidden?: boolean;
}

export const MENGKI_POSITIONS: readonly MengkiPosition[] = [
  { x: 16, y: 24 },
  { x: 33, y: 14 },
  { x: 54, y: 32 },
  { x: 76, y: 19 },
  { x: 89, y: 47 },
  { x: 24, y: 74 },
  { x: 43, y: 59, hidden: true },
  { x: 65, y: 75, hidden: true },
  { x: 91, y: 81, hidden: true },
  { x: 8, y: 52, hidden: true },
];
