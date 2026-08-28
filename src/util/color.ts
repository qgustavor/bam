import { wcagContrast } from 'culori'

// Small, single-purpose color helpers.

export function isValidHexColor (value: unknown): value is string {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
}

// Picks whichever of the two given colors reads better (by WCAG contrast
// ratio) on top of `backgroundHex`. Both readable colors are parameters
// (not hardcoded) so callers can match their own palette instead of
// always getting gray-900/gray-100. Contrast math itself is delegated to
// culori instead of a hand-rolled luminance formula.
export function pickReadableColor (
  backgroundHex: string,
  { light = '#f3f4f6', dark = '#111827' }: { light?: string, dark?: string } = {}
): string {
  const contrastWithLight = wcagContrast(backgroundHex, light)
  const contrastWithDark = wcagContrast(backgroundHex, dark)
  return contrastWithDark >= contrastWithLight ? dark : light
}
