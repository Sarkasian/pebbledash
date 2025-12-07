export type SeamOrientation = 'vertical' | 'horizontal';

export interface Seam {
  id: string; // seam|v|<coord> or seam|h|<coord>
  orientation: SeamOrientation;
  coord: number; // percent [0,100]
}

export function makeSeamId(orientation: SeamOrientation, coord: number): string {
  const tag = orientation === 'vertical' ? 'v' : 'h';
  return `seam|${tag}|${coord.toFixed(6)}`;
}
