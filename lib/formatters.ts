/**
 * Helper formatting utilities for display labels across the portal
 */

/**
 * Converts shift timing descriptions into concise, readable abbreviations
 * e.g., "Day Shift (India)" -> "IST", "US / American Shift" -> "UST"
 */
export function formatShiftShort(shift?: string | null): string {
  if (!shift || !shift.trim()) return 'IST';
  const s = shift.toLowerCase().trim();

  // Day Shift (India) / IST
  if (s.includes('day') || s.includes('india') || s.includes('ist')) {
    return 'IST';
  }

  // US / American Shift / EST / PST / CST / UST
  if (
    s.includes('us') ||
    s.includes('american') ||
    s.includes('est') ||
    s.includes('pst') ||
    s.includes('cst') ||
    s.includes('ust')
  ) {
    return 'UST';
  }

  // UK / European Shift
  if (
    s.includes('uk') ||
    s.includes('european') ||
    s.includes('europe') ||
    s.includes('gmt') ||
    s.includes('bst')
  ) {
    return 'UK';
  }

  // Australian Shift
  if (s.includes('australia') || s.includes('aest') || s.includes('aedt')) {
    return 'AUS';
  }

  // Middle East / Gulf Shift
  if (
    s.includes('middle east') ||
    s.includes('gulf') ||
    s.includes('dubai') ||
    s.includes('uae')
  ) {
    return 'Gulf';
  }

  // Rotational Shift
  if (s.includes('rotational') || s.includes('rotation') || s.includes('24/7')) {
    return 'Rotational';
  }

  // Night Shift
  if (s.includes('night') || s.includes('graveyard')) {
    return 'Night';
  }

  // Flexible / Hybrid
  if (s.includes('flexible') || s.includes('flexi') || s.includes('hybrid')) {
    return 'Hybrid';
  }

  // If custom short string, return trimmed up to 12 chars
  if (shift.length <= 12) {
    return shift.trim();
  }

  return shift.slice(0, 10).trim() + '…';
}
