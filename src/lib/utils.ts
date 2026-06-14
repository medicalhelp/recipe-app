const KNOWN_UNITS = new Set([
  'g', 'kg', 'mg',
  'ml', 'l', 'cl', 'dl',
  'oz', 'lb', 'lbs',
  'tsp', 'tbsp',
  'cup', 'cups',
  'pinch', 'handful', 'bunch', 'slice', 'slices', 'piece', 'pieces', 'can', 'cans',
])

export function parseIngredientLine(line: string): { name: string; amount: string; unit: string } | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  const amountMatch = trimmed.match(/^([\d½¼⅓⅔¾.,\/\s]+?)(?=\s|[a-zA-Z]|$)/)
  if (!amountMatch) return { amount: '', unit: '', name: trimmed }

  let raw = amountMatch[1].trimEnd()
  let rest = trimmed.slice(raw.length).trimStart()

  // Amount concatenated with unit (e.g. "200g", "20ml")
  const concatUnit = raw.match(/^([\d.,\/½¼⅓⅔¾]+)([a-zA-Z]+)$/)
  if (concatUnit) {
    const [, num, maybeUnit] = concatUnit
    if (KNOWN_UNITS.has(maybeUnit.toLowerCase())) return { amount: num, unit: maybeUnit, name: rest }
    return { amount: '', unit: '', name: trimmed }
  }

  // Separate unit word
  const unitMatch = rest.match(/^([a-zA-Z]+)(\s|$)/)
  if (unitMatch && KNOWN_UNITS.has(unitMatch[1].toLowerCase())) {
    return { amount: raw, unit: unitMatch[1], name: rest.slice(unitMatch[1].length).trimStart() }
  }

  return { amount: raw, unit: '', name: rest }
}

export function parseIngredients(text: string) {
  return text.split('\n').map(parseIngredientLine).filter(Boolean) as { name: string; amount: string; unit: string }[]
}

export function parseSteps(text: string) {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map(t => ({ text: t }))
}

export function ingredientsToText(ings: { amount: string | null; unit: string | null; name: string }[]): string {
  return ings.map(i => [i.amount, i.unit, i.name].filter(Boolean).join(' ')).join('\n')
}

export function stepsToText(ss: { text: string }[]): string {
  return ss.map(s => s.text).join('\n')
}

// ── Display helpers ───────────────────────────────────────────────────────────

export function formatMeta(recipe: { timeMinutes?: number | null; calories?: number | null; proteinGrams?: number | null }): string {
  const parts: string[] = []
  if (recipe.timeMinutes) parts.push(`${recipe.timeMinutes}min`)
  if (recipe.calories) parts.push(`${recipe.calories}kcal`)
  if (recipe.proteinGrams) parts.push(`${recipe.proteinGrams}g Protein`)
  return parts.join('  ')
}

export function formatPortionMultiplier(multiplier: string): string {
  const fractions: Record<string, string> = {
    '0.25': '¼', '0.33': '⅓', '0.5': '½', '0.67': '⅔', '0.75': '¾',
  }
  const num = parseFloat(multiplier)
  if (num === 1) return ''
  const frac = fractions[multiplier] ?? `${num}×`
  return `${frac} Portions`
}

// ── Scaling ───────────────────────────────────────────────────────────────────

const UNICODE_FRACS: [string, number][] = [
  ['½', 1 / 2], ['¼', 1 / 4], ['¾', 3 / 4],
  ['⅓', 1 / 3], ['⅔', 2 / 3],
  ['⅛', 1 / 8], ['⅜', 3 / 8], ['⅝', 5 / 8], ['⅞', 7 / 8],
]

export function parseAmount(str: string | null): number | null {
  if (!str) return null
  const s = str.trim()
  if (!s) return null

  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s)

  for (const [sym, val] of UNICODE_FRACS) {
    if (s === sym) return val
    const m = s.match(new RegExp(`^(\\d+)\\s*${sym}$`))
    if (m) return parseInt(m[1]) + val
  }

  const slashFrac = s.match(/^(\d+)\/(\d+)$/)
  if (slashFrac) return parseInt(slashFrac[1]) / parseInt(slashFrac[2])

  const mixedSlash = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixedSlash) return parseInt(mixedSlash[1]) + parseInt(mixedSlash[2]) / parseInt(mixedSlash[3])

  return null
}

export function formatAmount(n: number): string {
  if (n <= 0) return '0'
  const whole = Math.floor(n)
  const frac = n - whole

  if (frac < 0.02) return whole.toString()

  for (const [sym, val] of UNICODE_FRACS) {
    if (Math.abs(frac - val) < 0.05) return whole > 0 ? `${whole}${sym}` : sym
  }

  const s = n.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}
