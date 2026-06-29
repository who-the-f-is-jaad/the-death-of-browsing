export type PortraitId = 'red' | 'blue' | 'green' | 'yellow';

export type PortraitDef = {
  id: PortraitId;
  label: string;
  free: boolean;
  price?: number; // coins required if not free
};

export const PORTRAIT_DEFS: PortraitDef[] = [
  { id: 'red',    label: 'Red',    free: true },
  { id: 'blue',   label: 'Blue',   free: true },
  { id: 'green',  label: 'Green',  free: false, price: 3 },
  { id: 'yellow', label: 'Gold',   free: false, price: 20 },
];

export const ALL_PORTRAIT_IDS: PortraitId[] = PORTRAIT_DEFS.map(p => p.id);
export const FREE_PORTRAIT_IDS: PortraitId[] = PORTRAIT_DEFS.filter(p => p.free).map(p => p.id);
