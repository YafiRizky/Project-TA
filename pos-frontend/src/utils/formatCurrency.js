/**
 * Format number as Indonesian Rupiah currency string.
 * Example: formatCurrency(15000) -> "15.000"
 */
export const formatCurrency = (n) => Number(n || 0).toLocaleString('id-ID')
export const fmt = formatCurrency

/**
 * Format a raw value for display inside an input field with thousand separators.
 * Strips non-digit characters, then formats with dots.
 * Example: "10000" -> "10.000", "1500000" -> "1.500.000"
 */
export const formatNumberInput = (value) => {
  if (value === '' || value === null || value === undefined) return ''
  const digits = String(value).replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('id-ID')
}

/**
 * Parse a formatted number string back to a plain number.
 * Strips dots (thousand separators) and returns a number.
 * Example: "10.000" -> 10000, "1.500.000" -> 1500000
 */
export const parseFormattedNumber = (formatted) => {
  if (!formatted && formatted !== 0) return ''
  const cleaned = String(formatted).replace(/\./g, '').replace(/\D/g, '')
  if (cleaned === '') return ''
  return Number(cleaned)
}
