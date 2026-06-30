// S023E — Resolves WooCommerce product category identity against the Supabase
// category cache (wc_categories) populated by S023A. This is the operative source
// of category options for the Studio selector and the single home for the
// liga-based default heuristic, consumed by both the form hint and the bridge.
// Never invents a category id: an explicit override must already exist in the cache,
// and the fallback uses the documented curatorial category IDs (S022C.5).

import type { SupabaseClient } from '@supabase/supabase-js'
import type { WcCategoryCacheRow } from '@/lib/types'

// WooCommerce product category IDs — confirmed in S022C.5 and the S023A category cache.
// liga resolved to '' → national team → Selecciones Nacionales.
// liga resolved to a term ID → club in a league → Otros Clubs.
// Leyendas (149) and Nuevo (22) are curatorial: Pablo picks them via the selector (S023E).
export const DEFAULT_CATEGORY_IDS = {
  otrosClubs: 147,
  seleccionesNacionales: 148,
} as const

export type CategoryOption = { id: number; name: string }

export type RecommendedCategoryNames = {
  withLiga: string | null
  withoutLiga: string | null
}

// Liga-based default: no liga (national team) → Selecciones; with liga (club) → Otros Clubs.
export function resolveHeuristicCategoryId(ligaValue: string | null | undefined): number {
  const liga = ligaValue?.trim() ?? ''
  return liga === '' ? DEFAULT_CATEGORY_IDS.seleccionesNacionales : DEFAULT_CATEGORY_IDS.otrosClubs
}

// Resolves the WC category id for a draft: an explicit Studio override (selected from the
// wc_categories cache and persisted on the item) wins; otherwise fall back to the liga-based
// heuristic. Never invents an id — a non-numeric or non-positive override is ignored.
export function resolveCategoryId(
  ligaValue: string | null | undefined,
  selected: number | null | undefined
): number {
  if (selected != null && Number.isInteger(selected) && selected > 0) return selected
  return resolveHeuristicCategoryId(ligaValue)
}

// Loads the cached WooCommerce product categories (S023A). Returns [] on error so the
// form degrades to "Automática (según liga)" only, never blocking the save.
export async function loadCachedCategories(
  supabase: SupabaseClient
): Promise<WcCategoryCacheRow[]> {
  const { data, error } = await supabase
    .from('wc_categories')
    .select('id, name, slug, parent, count, is_curatorial, source, synced_at')
    .order('name', { ascending: true })

  if (error || !data) {
    console.warn(`[category-cache] failed to load wc_categories cache: ${error?.message ?? 'no data'}`)
    return []
  }
  return data as WcCategoryCacheRow[]
}

export function findCategoryName(
  categories: WcCategoryCacheRow[],
  id: number
): string | null {
  return categories.find((c) => c.id === id)?.name ?? null
}

// Single server-side entry point for the category selector: cached options + the two
// heuristic recommendation names (Otros Clubs / Selecciones) resolved against the cache.
export async function getCategorySelectorData(supabase: SupabaseClient): Promise<{
  options: CategoryOption[]
  recommendedNames: RecommendedCategoryNames
}> {
  const categories = await loadCachedCategories(supabase)
  return {
    options: categories.map((c) => ({ id: c.id, name: c.name })),
    recommendedNames: {
      withLiga: findCategoryName(categories, DEFAULT_CATEGORY_IDS.otrosClubs),
      withoutLiga: findCategoryName(categories, DEFAULT_CATEGORY_IDS.seleccionesNacionales),
    },
  }
}
