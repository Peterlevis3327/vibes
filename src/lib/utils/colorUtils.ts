export function getLuminance(hex: string) {
  const rgb = hex.replace(/^#/, '');
  // Default to black if invalid
  if (rgb.length !== 6) return 0;
  
  const r = parseInt(rgb.substring(0, 2), 16) / 255;
  const g = parseInt(rgb.substring(2, 4), 16) / 255;
  const b = parseInt(rgb.substring(4, 6), 16) / 255;
  
  const [R, G, B] = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrastRatio(l1: number, l2: number) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getOptimalForeground(bgHex: string) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(bgHex)) return "#ffffff";
  const bgLum = getLuminance(bgHex);
  const whiteLum = 1; // #ffffff
  const darkLum = getLuminance("#0f172a"); // slate-900
  
  const contrastWithWhite = getContrastRatio(bgLum, whiteLum);
  const contrastWithDark = getContrastRatio(bgLum, darkLum);
  
  // Return white if it meets AA (4.5), OR if it's better than dark
  return (contrastWithWhite >= 4.5 || contrastWithWhite > contrastWithDark) ? "#ffffff" : "#0f172a";
}

export function getContrastString(bgHex: string, fgHex: string) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(bgHex)) return "0.00";
  if (!/^#[0-9A-Fa-f]{6}$/.test(fgHex)) return "0.00";
  return getContrastRatio(getLuminance(bgHex), getLuminance(fgHex)).toFixed(2);
}
