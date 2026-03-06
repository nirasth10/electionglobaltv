/** Devanagari digit map */
const NP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Convert a number (or Arabic-numeral string) to Nepali (Devanagari) digits.
 * Preserves commas/separators from toLocaleString.
 * e.g. 12345 → "१२,३४५"  (after toLocaleString → "12,345" → "१२,३४५")
 */
export function toNepali(value: number | string): string {
    return String(value).replace(/[0-9]/g, d => NP_DIGITS[+d]);
}

/**
 * Convert a Nepali (Devanagari) digit string back to ASCII digits.
 * Also handles mixed input (some Nepali, some Arabic).
 * e.g. "१२,३४५" → "12,345"
 */
export function fromNepali(value: string): string {
    return value.replace(/[०-९]/g, d => String(NP_DIGITS.indexOf(d)));
}

/**
 * Parse a string that may contain Nepali or Arabic digits into an integer.
 * Strips commas and spaces before parsing.
 */
export function parseNepaliInt(value: string): number {
    const arabic = fromNepali(value).replace(/[,\s]/g, '');
    return parseInt(arabic, 10) || 0;
}

/**
 * Format a vote count as Nepali numerals with locale separators.
 * e.g. 12345 → "१२,३४५"
 */
export function formatNepaliVotes(votes: number): string {
    return toNepali(votes.toLocaleString());
}
