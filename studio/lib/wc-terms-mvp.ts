// Canonical domain options for Catenaccio Studio forms.
// Pablo sees `label`; server actions resolve `termId` internally.
// termId = '' means the WC term ID is not yet known — S022C blocks publish if termId is needed.

export type TermOption = {
  label: string
  termId: string
  aliases?: string[]
}

// ── Liga ──────────────────────────────────────────────────────────────────────

export const ligaOptions: TermOption[] = [
  { label: 'Sin liga / Selección nacional', termId: '' },
  { label: 'LaLiga', termId: '72', aliases: ['la liga', 'primera division', 'primera división'] },
  { label: 'Premier League', termId: '95' },
  { label: 'Serie A', termId: '51' },
  { label: 'Eredivisie', termId: '177' },
  { label: 'Bundesliga', termId: '' },
  { label: 'Ligue 1', termId: '' },
  { label: 'Liga Portugal', termId: '' },
  { label: 'Primera División Argentina', termId: '' },
]

// ── Equipo ────────────────────────────────────────────────────────────────────

export const equipoOptions: TermOption[] = [
  // España
  { label: 'FC Barcelona', termId: '', aliases: ['barcelona', 'barça', 'barca'] },
  { label: 'Real Madrid', termId: '' },
  { label: 'Atlético de Madrid', termId: '', aliases: ['atletico', 'atlético'] },
  { label: 'Valencia CF', termId: '', aliases: ['valencia'] },
  { label: 'Sevilla FC', termId: '', aliases: ['sevilla'] },
  { label: 'Real Sociedad', termId: '' },
  { label: 'Athletic Club', termId: '', aliases: ['athletic bilbao'] },
  { label: 'Villarreal CF', termId: '', aliases: ['villarreal'] },
  { label: 'Betis', termId: '', aliases: ['real betis'] },
  { label: 'Deportivo de La Coruña', termId: '', aliases: ['deportivo', 'celta', 'depor'] },
  { label: 'Málaga CF', termId: '', aliases: ['malaga', 'málaga'] },
  { label: 'Espanyol', termId: '' },
  { label: 'Celta de Vigo', termId: '' },
  { label: 'Rayo Vallecano', termId: '' },
  { label: 'Racing de Santander', termId: '' },
  // England
  { label: 'Arsenal', termId: '' },
  { label: 'Chelsea', termId: '' },
  { label: 'Liverpool', termId: '' },
  { label: 'Manchester United', termId: '' },
  { label: 'Manchester City', termId: '' },
  { label: 'Tottenham Hotspur', termId: '', aliases: ['tottenham', 'spurs'] },
  { label: 'Newcastle United', termId: '', aliases: ['newcastle'] },
  { label: 'Everton', termId: '' },
  { label: 'Aston Villa', termId: '' },
  { label: 'Leicester City', termId: '', aliases: ['leicester'] },
  { label: 'West Ham United', termId: '', aliases: ['west ham'] },
  { label: 'Leeds United', termId: '', aliases: ['leeds'] },
  { label: 'Blackburn Rovers', termId: '' },
  // Germany
  { label: 'Bayern Munich', termId: '', aliases: ['bayern münchen', 'bayern'] },
  { label: 'Borussia Dortmund', termId: '', aliases: ['bvb', 'dortmund'] },
  { label: 'Borussia Mönchengladbach', termId: '' },
  { label: 'Schalke 04', termId: '' },
  { label: 'Bayer Leverkusen', termId: '' },
  { label: 'Werder Bremen', termId: '' },
  // Italy
  { label: 'AC Milan', termId: '', aliases: ['milan'] },
  { label: 'Inter Milan', termId: '', aliases: ['inter', 'internazionale'] },
  { label: 'Juventus', termId: '' },
  { label: 'AS Roma', termId: '', aliases: ['roma'] },
  { label: 'Lazio', termId: '', aliases: ['ss lazio'] },
  { label: 'Napoli', termId: '', aliases: ['ssc napoli'] },
  { label: 'Fiorentina', termId: '' },
  { label: 'Parma', termId: '' },
  // France
  { label: 'Paris Saint-Germain', termId: '', aliases: ['psg', 'paris sg'] },
  { label: 'Olympique de Marseille', termId: '', aliases: ['marseille', 'om'] },
  { label: 'Olympique Lyonnais', termId: '', aliases: ['lyon', 'ol'] },
  // Netherlands
  { label: 'Ajax', termId: '' },
  { label: 'PSV Eindhoven', termId: '', aliases: ['psv'] },
  { label: 'Feyenoord', termId: '' },
  // Portugal
  { label: 'Benfica', termId: '' },
  { label: 'FC Porto', termId: '', aliases: ['porto'] },
  { label: 'Sporting CP', termId: '', aliases: ['sporting'] },
  // Selecciones
  { label: 'España', termId: '', aliases: ['spain', 'selección española'] },
  { label: 'Francia', termId: '129', aliases: ['france'] },
  { label: 'Alemania', termId: '', aliases: ['germany', 'deutschland'] },
  { label: 'Italia', termId: '', aliases: ['italy'] },
  { label: 'Inglaterra', termId: '', aliases: ['england'] },
  { label: 'Portugal', termId: '' },
  { label: 'Brasil', termId: '', aliases: ['brazil'] },
  { label: 'Argentina', termId: '' },
  { label: 'Colombia', termId: '' },
  { label: 'Paraguay', termId: '' },
  { label: 'Uruguay', termId: '' },
  { label: 'Países Bajos', termId: '', aliases: ['netherlands', 'holland', 'holanda'] },
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
  return seasons
}

export const temporadaOptions: TermOption[] = buildSeasonOptions()

// ── Marca ─────────────────────────────────────────────────────────────────────

export const marcaOptions: TermOption[] = [
  { label: 'Adidas', termId: '' },
  { label: 'Nike', termId: '' },
  { label: 'Umbro', termId: '' },
  { label: 'Puma', termId: '' },
  { label: 'Kappa', termId: '' },
  { label: 'Lotto', termId: '' },
  { label: 'Reebok', termId: '' },
  { label: 'Hummel', termId: '' },
  { label: 'Le Coq Sportif', termId: '' },
  { label: 'Diadora', termId: '' },
  { label: 'Asics', termId: '' },
  { label: 'Joma', termId: '' },
  { label: 'Meyba', termId: '' },
  { label: 'New Balance', termId: '' },
  { label: 'Under Armour', termId: '' },
  { label: 'Otra', termId: '' },
]

// ── Talla ─────────────────────────────────────────────────────────────────────

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
  { label: 'Mint', termId: '' },
  { label: 'Excelente', termId: '' },
  { label: 'Muy buena', termId: '' },
  { label: 'Buena', termId: '' },
  { label: 'Aceptable', termId: '' },
]

// ── Product type ──────────────────────────────────────────────────────────────

export const productTypeOptions: TermOption[] = [
  { label: 'Shirt', termId: '' },
  { label: 'Shorts', termId: '' },
  { label: 'Jacket', termId: '' },
  { label: 'Tracksuit', termId: '' },
  { label: 'Socks', termId: '' },
  { label: 'Accessories', termId: '' },
]

// ── Shirt version ─────────────────────────────────────────────────────────────

export const shirtVersionOptions: TermOption[] = [
  { label: 'Home', termId: '' },
  { label: 'Away', termId: '' },
  { label: 'Third', termId: '' },
  { label: 'Goalkeeper', termId: '' },
  { label: 'Training', termId: '' },
  { label: 'Pre-match', termId: '' },
  { label: 'Special', termId: '' },
  { label: 'None', termId: '' },
]

// ── Authenticity type ─────────────────────────────────────────────────────────

export const authenticityTypeOptions: TermOption[] = [
  { label: 'Replica', termId: '' },
  { label: 'Player Issue', termId: '' },
  { label: 'Match Issue', termId: '' },
  { label: 'Match Worn', termId: '' },
  { label: 'Official Reissue', termId: '' },
  { label: 'Deadstock', termId: '' },
]

// ── Sleeve length ─────────────────────────────────────────────────────────────

export const sleeveLengthOptions: TermOption[] = [
  { label: 'Short Sleeve', termId: '' },
  { label: 'Long Sleeve', termId: '' },
]

// ── Resolver ──────────────────────────────────────────────────────────────────

export function resolveTermId(options: TermOption[], input: string): string {
  if (!input) return ''
  const normalized = input.toLowerCase().trim()
  const match = options.find(
    (o) =>
      o.label.toLowerCase() === normalized ||
      o.aliases?.some((a) => a.toLowerCase() === normalized)
  )
  return match?.termId ?? ''
}
