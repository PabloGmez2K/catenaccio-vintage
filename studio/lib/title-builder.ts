export interface TitleParams {
  season?: string
  team?: string
  productType?: string
  shirtVersion?: string
  authenticityType?: string
  sleeveLength?: string
  player?: string
  number?: string
  size?: string
}

// Builds an English catalogue title following Catenaccio Vintage conventions.
// Examples:
//   2001-02 Real Madrid Home Shirt (L)
//   2005-06 Arsenal Match Worn Home L/S Shirt – Henry #14 – (L)
//   1997-98 Arsenal Home L/S Shirt (XL)
//   2010-11 Chelsea GK Shirt (M)
//   2001-02 Real Madrid Home Shorts (L)
//   2001-02 Real Madrid Tracksuit (L)
export function buildTitle({
  season = '',
  team = '',
  productType = 'Shirt',
  shirtVersion = 'Home',
  authenticityType = 'Replica',
  sleeveLength = 'Short Sleeve',
  player = '',
  number = '',
  size = '',
}: TitleParams): string {
  const parts: string[] = []

  if (season) parts.push(season)
  if (team) parts.push(team)

  // Pre-resolved titleLabel from getTitleLabel(); '' means omit (e.g. Original retail, No determinado)
  if (authenticityType && authenticityType !== 'Replica') {
    parts.push(authenticityType)
  }

  if (productType === 'Shirt') {
    const isGK = shirtVersion === 'Goalkeeper'
    const isLS = sleeveLength === 'Long Sleeve'

    if (!isGK && shirtVersion && shirtVersion !== 'None') {
      parts.push(shirtVersion)
    }

    if (isGK) {
      parts.push(isLS ? 'L/S GK Shirt' : 'GK Shirt')
    } else {
      parts.push(isLS ? 'L/S Shirt' : 'Shirt')
    }
  } else if (productType) {
    parts.push(productType)
  }

  let title = parts.join(' ')

  const hasPlayer = player.trim().length > 0
  const hasNumber = number.trim().length > 0

  if (hasPlayer || hasNumber) {
    const playerPart = hasPlayer
      ? hasNumber
        ? `${player.trim()} #${number.trim()}`
        : player.trim()
      : `#${number.trim()}`
    title += ` – ${playerPart} –`
  }

  if (size) {
    title += ` (${size})`
  }

  return title.trim()
}
