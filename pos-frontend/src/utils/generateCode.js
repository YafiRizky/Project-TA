/**
 * Generate a unique code from a given name.
 * Format: PREFIX-SUFFIX
 * - 1 word: first 3 uppercase letters (e.g. 'Aqua' -> 'AQU')
 * - 2 words: first letter of each word (e.g. 'Mie Goreng' -> 'MG')
 * - 3 words: first letter of each word (e.g. 'Nasi Goreng Spesial' -> 'NGS')
 * - 4+ words: first letter of first 3 words (e.g. 'Susu Ultra Milk' -> 'SUM')
 * - SUFFIX: 5 random alphanumeric characters
 */
export const generateCode = (name) => {
  if (!name || !name.trim()) return ''
  const words = name.trim().split(/\s+/)
  let prefix = ''
  if (words.length === 1) {
    prefix = words[0].substring(0, 3).toUpperCase()
  } else if (words.length === 2) {
    prefix = (words[0][0] + words[1][0]).toUpperCase()
  } else {
    prefix = (words[0][0] + words[1][0] + words[2][0]).toUpperCase()
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let suffix = ''
  for (let i = 0; i < 5; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${suffix}`
}
