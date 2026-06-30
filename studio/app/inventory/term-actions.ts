'use server'

import { createControlledTerm, type CreateTermResult } from '@/lib/wc/term-create'

// Explicit, Pablo-triggered term creation. Never called on item save and never
// called automatically — only from a dedicated "Crear término en Woo" button.
export async function createTermAction(
  taxonomySlug: string,
  name: string
): Promise<CreateTermResult> {
  return createControlledTerm(taxonomySlug, name)
}
