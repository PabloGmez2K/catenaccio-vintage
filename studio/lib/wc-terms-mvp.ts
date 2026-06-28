// Canonical domain options for Catenaccio Studio forms.
// Pablo sees `label`; server actions resolve `termId` internally.
// termId = '' means the WC term ID is not yet known — S022C blocks publish if termId is needed.
// value = internal stored value (defaults to label when omitted).
// titleLabel = short form for title construction; '' means omit from title.

export type TermOption = {
  label: string
  value?: string      // stored in DB; defaults to label when omitted
  termId: string
  aliases?: string[]
  titleLabel?: string // used in title; '' = omit; undefined = use label
  helpText?: string
}

// ── Liga ──────────────────────────────────────────────────────────────────────

export const ligaOptions: TermOption[] = [
  { label: 'Sin liga / Selección nacional', termId: '' },
  { label: 'Bundesliga', termId: '' },
  { label: 'Eredivisie', termId: '177' },
  { label: 'LaLiga', termId: '72', aliases: ['la liga', 'primera division', 'primera división'] },
  { label: 'Liga Portugal', termId: '' },
  { label: 'Ligue 1', termId: '' },
  { label: 'Premier League', termId: '95' },
  { label: 'Primera División Argentina', termId: '' },
  { label: 'Serie A', termId: '51' },
]

// ── Equipo ────────────────────────────────────────────────────────────────────

export const equipoOptions: TermOption[] = [
  { label: 'AC Milan', termId: '', aliases: ['milan'] },
  { label: 'Ajax', termId: '' },
  { label: 'Alemania', termId: '', aliases: ['germany', 'deutschland'] },
  { label: 'Argentina', termId: '' },
  { label: 'Arsenal', termId: '' },
  { label: 'AS Roma', termId: '', aliases: ['roma'] },
  { label: 'Aston Villa', termId: '' },
  { label: 'Athletic Club', termId: '', aliases: ['athletic bilbao'] },
  { label: 'Atlético de Madrid', termId: '', aliases: ['atletico', 'atlético'] },
  { label: 'Bayer Leverkusen', termId: '' },
  { label: 'Bayern Munich', termId: '', aliases: ['bayern münchen', 'bayern'] },
  { label: 'Benfica', termId: '' },
  { label: 'Betis', termId: '', aliases: ['real betis'] },
  { label: 'Blackburn Rovers', termId: '' },
  { label: 'Borussia Dortmund', termId: '', aliases: ['bvb', 'dortmund'] },
  { label: 'Borussia Mönchengladbach', termId: '' },
  { label: 'Brasil', termId: '', aliases: ['brazil'] },
  { label: 'Celta de Vigo', termId: '' },
  { label: 'Chelsea', termId: '' },
  { label: 'Colombia', termId: '' },
  { label: 'Deportivo de La Coruña', termId: '', aliases: ['deportivo', 'depor'] },
  { label: 'Espanyol', termId: '' },
  { label: 'España', termId: '', aliases: ['spain', 'selección española'] },
  { label: 'Everton', termId: '' },
  { label: 'FC Barcelona', termId: '', aliases: ['barcelona', 'barça', 'barca'] },
  { label: 'FC Porto', termId: '', aliases: ['porto'] },
  { label: 'Feyenoord', termId: '' },
  { label: 'Fiorentina', termId: '' },
  { label: 'Francia', termId: '129', aliases: ['france'] },
  { label: 'Inglaterra', termId: '', aliases: ['england'] },
  { label: 'Inter Milan', termId: '', aliases: ['inter', 'internazionale'] },
  { label: 'Italia', termId: '', aliases: ['italy'] },
  { label: 'Juventus', termId: '' },
  { label: 'Lazio', termId: '', aliases: ['ss lazio'] },
  { label: 'Leeds United', termId: '', aliases: ['leeds'] },
  { label: 'Leicester City', termId: '', aliases: ['leicester'] },
  { label: 'Liverpool', termId: '' },
  { label: 'Málaga CF', termId: '', aliases: ['malaga', 'málaga'] },
  { label: 'Manchester City', termId: '' },
  { label: 'Manchester United', termId: '' },
  { label: 'Napoli', termId: '', aliases: ['ssc napoli'] },
  { label: 'Newcastle United', termId: '', aliases: ['newcastle'] },
  { label: 'Olympique de Marseille', termId: '', aliases: ['marseille', 'om'] },
  { label: 'Olympique Lyonnais', termId: '', aliases: ['lyon', 'ol'] },
  { label: 'Países Bajos', termId: '', aliases: ['netherlands', 'holland', 'holanda'] },
  { label: 'Paraguay', termId: '' },
  { label: 'Paris Saint-Germain', termId: '', titleLabel: 'PSG', aliases: ['psg', 'paris sg'] },
  { label: 'Parma', termId: '' },
  { label: 'Portugal', termId: '' },
  { label: 'PSV Eindhoven', termId: '179', titleLabel: 'PSV', aliases: ['psv'] },
  { label: 'Racing de Santander', termId: '' },
  { label: 'Rayo Vallecano', termId: '' },
  { label: 'Real Madrid', termId: '' },
  { label: 'Real Sociedad', termId: '' },
  { label: 'Schalke 04', termId: '' },
  { label: 'Sevilla FC', termId: '', aliases: ['sevilla'] },
  { label: 'Sporting CP', termId: '', aliases: ['sporting'] },
  { label: 'Tottenham Hotspur', termId: '', aliases: ['tottenham', 'spurs'] },
  { label: 'Uruguay', termId: '' },
  { label: 'Valencia CF', termId: '', aliases: ['valencia'] },
  { label: 'Villarreal CF', termId: '', aliases: ['villarreal'] },
  { label: 'Werder Bremen', termId: '' },
  { label: 'West Ham United', termId: '', aliases: ['west ham'] },
]

// ── Temporada ─────────────────────────────────────────────────────────────────

function buildSeasonOptions(): TermOption[] {
  const seasons: TermOption[] = []
  for (let y = 2025; y >= 1990; y--) {
    const next = (y + 1) % 100
    const label = `${y}-${String(next).padStart(2, '0')}`
    const termId = label === '2014-15' ? '139' : ''
    seasons.push({ label, termId })
  }
  // Non-standard season label confirmed in WooCommerce pa_ano (term 180)
  const idx = seasons.findIndex((s) => s.label === '2008-09')
  seasons.splice(idx + 1, 0, { label: '2007-09', termId: '180' })
  return seasons
}

export const temporadaOptions: TermOption[] = buildSeasonOptions()

// ── Marca ─────────────────────────────────────────────────────────────────────

export const marcaOptions: TermOption[] = [
  { label: 'Adidas', termId: '' },
  { label: 'Asics', termId: '' },
  { label: 'Diadora', termId: '' },
  { label: 'Hummel', termId: '' },
  { label: 'Joma', termId: '' },
  { label: 'Kappa', termId: '' },
  { label: 'Le Coq Sportif', termId: '' },
  { label: 'Lotto', termId: '' },
  { label: 'Meyba', termId: '' },
  { label: 'New Balance', termId: '' },
  { label: 'Nike', termId: '' },
  { label: 'Puma', termId: '' },
  { label: 'Reebok', termId: '' },
  { label: 'Umbro', termId: '' },
  { label: 'Under Armour', termId: '' },
]

// ── Talla ─────────────────────────────────────────────────────────────────────
// Order is size scale (XS → XXXL), not alphabetical — intentional.

export const tallaOptions: TermOption[] = [
  { label: 'XS', termId: '' },
  { label: 'S', termId: '' },
  { label: 'M', termId: '' },
  { label: 'L', termId: '' },
  { label: 'XL', termId: '' },
  { label: 'XXL', termId: '' },
  { label: 'XXXL', termId: '' },
  { label: 'Única', termId: '' },
]

// ── Condición ─────────────────────────────────────────────────────────────────

export const condicionOptions: TermOption[] = [
  { label: 'Aceptable', termId: '' },
  { label: 'Buena', termId: '' },
  { label: 'Excelente', termId: '' },
  { label: 'Mint', termId: '' },
  { label: 'Muy buena', termId: '' },
]

// ── Product type ──────────────────────────────────────────────────────────────

export const productTypeOptions: TermOption[] = [
  { label: 'Accessories', termId: '' },
  { label: 'Jacket', termId: '' },
  { label: 'Shirt', termId: '' },
  { label: 'Shorts', termId: '' },
  { label: 'Socks', termId: '' },
  { label: 'Tracksuit', termId: '' },
]

// ── Shirt version ─────────────────────────────────────────────────────────────

export const shirtVersionOptions: TermOption[] = [
  { label: 'Away', termId: '' },
  { label: 'Goalkeeper', termId: '' },
  { label: 'Home', termId: '' },
  { label: 'None', termId: '' },
  { label: 'Pre-match', termId: '' },
  { label: 'Special', termId: '' },
  { label: 'Third', termId: '' },
  { label: 'Training', termId: '' },
]

// ── Authenticity type ─────────────────────────────────────────────────────────
// "Original retail / Fan version" is shown first as the default option.
// Its stored value is 'Replica' for backward compatibility with existing DB records.
// titleLabel: '' means it is omitted from the catalogue title.

export const authenticityTypeOptions: TermOption[] = [
  {
    label: 'Original',
    value: 'Replica',
    termId: '',
    titleLabel: '',
    helpText: 'Camiseta original vendida al público. No significa falsa.',
  },
  { label: 'Deadstock / BNWT', termId: '', titleLabel: 'Deadstock' },
  { label: 'Match Issue', termId: '', titleLabel: 'Match Issue' },
  { label: 'Match Worn', termId: '', titleLabel: 'Match Worn' },
  { label: 'No determinado', termId: '', titleLabel: '' },
  { label: 'Official Reissue', termId: '', titleLabel: 'Official Reissue' },
  { label: 'Player Issue / Authentic', termId: '', titleLabel: 'Player Issue' },
]

// ── Sleeve length ─────────────────────────────────────────────────────────────

export const sleeveLengthOptions: TermOption[] = [
  { label: 'Short Sleeve', termId: '' },
  { label: 'Long Sleeve', termId: '' },
]

// ── Resolvers ─────────────────────────────────────────────────────────────────

export function resolveTermId(options: TermOption[], input: string): string {
  if (!input) return ''
  const normalized = input.toLowerCase().trim()
  const match = options.find(
    (o) =>
      o.label.toLowerCase() === normalized ||
      (o.value && o.value.toLowerCase() === normalized) ||
      o.aliases?.some((a) => a.toLowerCase() === normalized)
  )
  return match?.termId ?? ''
}

export function getTermLabelById(options: TermOption[], termId: string): string {
  if (!termId.trim()) return ''
  const match = options.find((o) => o.termId === termId.trim())
  if (!match) return ''
  return match.titleLabel !== undefined ? match.titleLabel : match.label
}

// Returns the titleLabel for a given input, matching by label, value, or alias.
// If no titleLabel is defined on the match, returns the input as-is.
// '' means the caller should omit this field from the title.
export function getTitleLabel(options: TermOption[], input: string): string {
  if (!input) return ''
  const normalized = input.toLowerCase().trim()
  const match = options.find(
    (o) =>
      o.label.toLowerCase() === normalized ||
      (o.value && o.value.toLowerCase() === normalized) ||
      o.aliases?.some((a) => a.toLowerCase() === normalized)
  )
  if (!match) return input
  return match.titleLabel !== undefined ? match.titleLabel : input
}
