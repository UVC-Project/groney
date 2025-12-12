export type OverlayStyle = {
 
  top: string;
  left: string;
  width: string;
  rotate?: string;

};

export const overlayMap: Record<string, OverlayStyle> = {
  
  'red-cap': { top: '20%', left: '50%', width: '100%' },
  'blue-cap': { top: '20%', left: '50%', width: '100%' },
  'sunglasses': { top: '46%', left: '48%', width: '70%' },
  'bow-tie': { top: '72%', left: '47.7%', width: '50%' }

};