export function isPendingImportedCost(cost: number | null, internalNotes?: string | null): boolean {
  if (cost == null || Number(cost) !== 0) return false
  const notes = internalNotes?.toLowerCase() ?? ''
  return notes.includes('coste pendiente') || notes.includes('coste real')
}
