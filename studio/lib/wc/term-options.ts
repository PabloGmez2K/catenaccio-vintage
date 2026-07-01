// S024A — Converts cached wc_terms rows (S023A) into form options per taxonomy and
// resolves a typed value to a cached option. This is the presentation source for the
// Liga/Equipo/Año/Jugador datalists in the Studio form: it replaces the static lists
// in wc-terms-mvp.ts as the *suggestion* source while that file stays the alias /
// titleLabel map. Never invents term IDs and never calls WooCommerce — it only reads
// the Supabase cache via loadCachedTerms.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { WcTermCacheRow } from '@/lib/types'
import { loadCachedTerms, type CachedTaxonomySlug } from './term-cache'

export interface TermFormOption {
  id: number
  name: string
  slug: string
  taxonomySlug: CachedTaxonomySlug
  source: 'wc_sync' | 'studio_created'
}

export type TermOptionsBySlug = Partial<Record<CachedTaxonomySlug, TermFormOption[]>>

// Maps cached term rows to form options, alphabetised for a stable datalist order.
export function buildTermOptions(terms: WcTermCacheRow[] | undefined): TermFormOption[] {
  if (!terms) return []
  return terms
    .map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      taxonomySlug: t.taxonomy_slug,
      source: t.source,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
}

// Server-side loader: one cache read for all requested taxonomies, grouped into
// per-taxonomy option lists ready to hand to the form. Empty list when the cache
// for a taxonomy is unsynced — never throws.
export async function loadTermOptions(
  supabase: SupabaseClient,
  slugs: CachedTaxonomySlug[]
): Promise<TermOptionsBySlug> {
  const bySlug = await loadCachedTerms(supabase, slugs)
  const out: TermOptionsBySlug = {}
  for (const slug of slugs) {
    out[slug] = buildTermOptions(bySlug[slug])
  }
  return out
}

// Resolves a typed value to a cached option by exact case-insensitive name/slug match.
// Returns null when the value is empty, the cache is empty, or nothing matches — which
// the field reads as "term does not exist yet in Woo". Alias resolution is intentionally
// left to save-time (matchCachedTermId); here a literal match keeps the visible status honest.
export function matchTermOption(
  options: TermFormOption[] | undefined,
  value: string
): TermFormOption | null {
  if (!value.trim() || !options || options.length === 0) return null
  const normalized = value.trim().toLowerCase()
  return (
    options.find(
      (o) => o.name.toLowerCase() === normalized || o.slug.toLowerCase() === normalized
    ) ?? null
  )
}
