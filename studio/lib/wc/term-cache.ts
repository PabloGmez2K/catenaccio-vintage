// S023B — Resolves WooCommerce term identity against the Supabase taxonomy cache
// (wc_terms) populated by S023A. This is the operative source of term IDs/labels
// for pa_liga/pa_equipo/pa_ano. wc-terms-mvp.ts stays presentation-only (labels,
// aliases, titleLabel) and is consulted here only to resolve aliases to a
// canonical label before matching against the cache. Never invents term IDs —
// returns '' when no cached term matches; missing-term creation is S023C.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { WcTermCacheRow } from '@/lib/types'

export type CachedTaxonomySlug = WcTermCacheRow['taxonomy_slug']

export type CachedTermsBySlug = Partial<Record<CachedTaxonomySlug, WcTermCacheRow[]>>

export async function loadCachedTerms(
  supabase: SupabaseClient,
  taxonomySlugs: CachedTaxonomySlug[]
): Promise<CachedTermsBySlug> {
  const { data, error } = await supabase
    .from('wc_terms')
    .select('id, taxonomy_id, taxonomy_slug, name, slug, count, source, synced_at')
    .in('taxonomy_slug', taxonomySlugs)

  if (error || !data) {
    console.warn(`[term-cache] failed to load wc_terms cache: ${error?.message ?? 'no data'}`)
    return {}
  }

  const bySlug: CachedTermsBySlug = {}
  for (const row of data as WcTermCacheRow[]) {
    const list = bySlug[row.taxonomy_slug] ?? []
    list.push(row)
    bySlug[row.taxonomy_slug] = list
  }
  return bySlug
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

// Resolves a display label (e.g. "Real Madrid") to a cached WC term ID by exact
// case-insensitive name/slug match. Falls back to alias resolution via the local
// presentation options (label/aliases from wc-terms-mvp.ts) when the raw display
// label has no direct cache match but a known alias does. Returns '' if no term
// is found in the cache.
export function matchCachedTermId(
  terms: WcTermCacheRow[] | undefined,
  displayLabel: string,
  aliasOptions?: Array<{ label: string; aliases?: string[] }>
): string {
  if (!displayLabel.trim() || !terms || terms.length === 0) return ''
  const normalized = normalize(displayLabel)

  const direct = terms.find(
    (t) => normalize(t.name) === normalized || normalize(t.slug) === normalized
  )
  if (direct) return direct.id.toString()

  const aliasOption = aliasOptions?.find(
    (o) => normalize(o.label) === normalized || o.aliases?.some((a) => normalize(a) === normalized)
  )
  if (aliasOption) {
    const aliasMatch = terms.find((t) => normalize(t.name) === normalize(aliasOption.label))
    if (aliasMatch) return aliasMatch.id.toString()
  }

  return ''
}

// Resolves a cached WC term ID back to its canonical name. Used by the bridge as a
// fallback when an item has no *_display cache value (legacy items saved before
// display caching existed). Returns '' if the term ID is not present in the cache.
export function matchCachedTermLabel(terms: WcTermCacheRow[] | undefined, termId: string): string {
  if (!termId.trim() || !terms) return ''
  const match = terms.find((t) => t.id.toString() === termId.trim())
  return match?.name ?? ''
}
