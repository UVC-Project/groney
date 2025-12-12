export type OverlayStyle = {
  top: string;
  left: string;
  width: string;
  rotate?: string;
};

export const overlayMap: Record<string, OverlayStyle> = {
  'red-cap': { top: '18%', left: '50%', width: '100%' },
  'blue-cap': { top: '18%', left: '50%', width: '100%' },
  'sunglasses': { top: '45%', left: '48%', width: '62%' },
  'bow-tie': { top: '70%', left: '48.5%', width: '50%' }
};