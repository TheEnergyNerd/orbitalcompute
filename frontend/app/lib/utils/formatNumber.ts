/**
 * Format a number to at most 4 significant figures
 */
export function formatSigFigs(value: number, maxSigFigs: number = 4): string {
  if (value === 0) return "0";
  
  // Use toPrecision to get significant figures, then remove trailing zeros
  const formatted = value.toPrecision(maxSigFigs);
  
  // Remove trailing zeros and decimal point if not needed
  return formatted.replace(/\.?0+$/, "");
}

/**
 * Format a number with a specific number of decimal places (for percentages, etc.)
 */
export function formatDecimal(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

