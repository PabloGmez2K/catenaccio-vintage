'use server'

// Taxonomy/category cache sync as a first-class UI action (Auditoría web).
// Wraps syncWcTaxonomyCache (GET-only against Woo + local Supabase cache writes)
// in a serializable shape the TaxonomySyncPanel can render: per-taxonomy term
// counts, category count, known checks and sanitized errors. No Woo writes.

import { revalidatePath } from 'next/cache'
import { syncWcTaxonomyCache } from '@/lib/wc/taxonomy-sync'

export type TaxonomySyncActionResult =
  | {
      ok: true
      syncedAt: string
      taxonomies: Array<{ slug: string; name: string; terms: number }>
      categories: number
      knownChecks: { realMadrid70: boolean; fcBarcelona170: boolean; season2014_15_139: boolean }
      /** Contract taxonomies expected but not returned by this run (skipped/missing). */
      missingSlugs: string[]
    }
  | { ok: false; code: string; message: string }

const EXPECTED_SLUGS = [
  'pa_equipo',
  'pa_liga',
  'pa_jugador',
  'pa_ano',
  'pa_talla',
  'pa_condicion',
  'pa_marca',
]

export async function runTaxonomySync(): Promise<TaxonomySyncActionResult> {
  const result = await syncWcTaxonomyCache()

  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message }
  }

  const returnedSlugs = new Set(result.summary.taxonomies.map((t) => t.slug))
  const missingSlugs = EXPECTED_SLUGS.filter((slug) => !returnedSlugs.has(slug))

  // Fresh caches change term suggestions, hydration resolution and brand hints.
  revalidatePath('/inventory')
  revalidatePath('/inventory/woo')

  return {
    ok: true,
    syncedAt: result.summary.syncedAt,
    taxonomies: result.summary.taxonomies.map((t) => ({
      slug: t.slug,
      name: t.name,
      terms: t.terms,
    })),
    categories: result.summary.categories,
    knownChecks: result.summary.knownChecks,
    missingSlugs,
  }
}
