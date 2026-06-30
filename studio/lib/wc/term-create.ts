// S023C/D — Controlled WooCommerce term creation with dedupe + write-through to wc_terms.
// Scope: pa_liga / pa_equipo / pa_ano / pa_jugador. pa_jugador added in S023D — jugador is
// open vocabulary (no static option list), so controlled creation is the only way to add a
// missing player term without inventing IDs.
// Only ever calls GET/POST .../products/attributes/{id}/terms — never /products.

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadCachedTerms } from './term-cache'

const CONTROLLED_TAXONOMIES = {
  pa_liga: 5,
  pa_equipo: 4,
  pa_ano: 7,
  pa_jugador: 6,
} as const

export type ControlledTaxonomySlug = keyof typeof CONTROLLED_TAXONOMIES

export type CreateTermResult =
  | {
      ok: true
      created: boolean
      existing: boolean
      taxonomySlug: ControlledTaxonomySlug
      termId: string
      name: string
      slug: string
    }
  | { ok: false; code: string; error: string }

type WcTermPayload = { id: number; name: string; slug: string; count?: number }

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

export async function createControlledTerm(
  taxonomySlug: string,
  rawName: string
): Promise<CreateTermResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, code: 'auth_required', error: 'No autenticado.' }
  }

  if (!Object.prototype.hasOwnProperty.call(CONTROLLED_TAXONOMIES, taxonomySlug)) {
    return {
      ok: false,
      code: 'unsupported_taxonomy',
      error: `unsupported_taxonomy: "${taxonomySlug}" no está soportado. Solo pa_liga, pa_equipo, pa_ano, pa_jugador.`,
    }
  }
  const slug = taxonomySlug as ControlledTaxonomySlug
  const attributeId = CONTROLLED_TAXONOMIES[slug]

  const name = rawName.trim().replace(/\s+/g, ' ')
  if (!name) {
    return { ok: false, code: 'name_required', error: 'name_required: el nombre del término está vacío.' }
  }

  const siteUrl = process.env.WP_SITE_URL
  const appUser = process.env.WP_APP_USER
  const appPassword = process.env.WP_APP_PASSWORD

  if (!siteUrl || !appUser || !appPassword) {
    return {
      ok: false,
      code: 'missing_credentials',
      error: 'WP_SITE_URL, WP_APP_USER o WP_APP_PASSWORD no están configurados en el servidor.',
    }
  }

  const base = siteUrl.replace(/\/$/, '')
  const credentials = Buffer.from(`${appUser}:${appPassword}`).toString('base64')

  // ── 1. Dedupe against the Supabase cache (S023A/B) ────────────────────────
  const cached = await loadCachedTerms(supabase, [slug])
  const cachedMatch = (cached[slug] ?? []).find(
    (t) => normalize(t.name) === normalize(name) || normalize(t.slug) === normalize(name)
  )
  if (cachedMatch) {
    return {
      ok: true,
      created: false,
      existing: true,
      taxonomySlug: slug,
      termId: cachedMatch.id.toString(),
      name: cachedMatch.name,
      slug: cachedMatch.slug,
    }
  }

  // ── 2. Dedupe against live WooCommerce (catches cache drift) ─────────────
  let wcMatch: WcTermPayload | null = null
  try {
    const searchUrl = new URL(`/wp-json/wc/v3/products/attributes/${attributeId}/terms`, base)
    searchUrl.searchParams.set('search', name)
    const searchRes = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: { Authorization: `Basic ${credentials}`, Accept: 'application/json' },
    })
    if (searchRes.ok) {
      const candidates = (await searchRes.json()) as WcTermPayload[]
      wcMatch = candidates.find((t) => normalize(t.name) === normalize(name)) ?? null
    }
  } catch {
    // Non-fatal: the live search is a best-effort second dedupe layer. Fall through
    // to POST, which has its own duplicate-name guard from WooCommerce (step 3).
  }

  if (wcMatch) {
    await upsertTermCache(supabase, slug, attributeId, wcMatch, 'wc_sync')
    return {
      ok: true,
      created: false,
      existing: true,
      taxonomySlug: slug,
      termId: wcMatch.id.toString(),
      name: wcMatch.name,
      slug: wcMatch.slug,
    }
  }

  // ── 3. Create the term in WooCommerce ─────────────────────────────────────
  let createRes: Response
  try {
    createRes = await fetch(
      new URL(`/wp-json/wc/v3/products/attributes/${attributeId}/terms`, base).toString(),
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      }
    )
  } catch (err) {
    return {
      ok: false,
      code: 'network_error',
      error: sanitizeMessage(err instanceof Error ? err.message : 'Network error', appUser, appPassword),
    }
  }

  if (createRes.ok) {
    const created = (await createRes.json()) as WcTermPayload
    await upsertTermCache(supabase, slug, attributeId, created, 'studio_created')
    return {
      ok: true,
      created: true,
      existing: false,
      taxonomySlug: slug,
      termId: created.id.toString(),
      name: created.name,
      slug: created.slug,
    }
  }

  // WooCommerce rejects an exact duplicate name with a 400 carrying the existing term id
  // in data.resource_id. Treat that as a dedupe hit, not an error.
  let errBody: { code?: string; message?: string; data?: { resource_id?: number } } = {}
  try {
    errBody = await createRes.json()
  } catch {
    // ignore parse failure on error body
  }

  if (errBody.data?.resource_id) {
    const existingId = errBody.data.resource_id
    const fallbackSlug = name.toLowerCase().replace(/\s+/g, '-')
    await upsertTermCache(supabase, slug, attributeId, { id: existingId, name, slug: fallbackSlug }, 'wc_sync')
    return {
      ok: true,
      created: false,
      existing: true,
      taxonomySlug: slug,
      termId: existingId.toString(),
      name,
      slug: fallbackSlug,
    }
  }

  return {
    ok: false,
    code: errBody.code ?? 'wc_post_failed',
    error: sanitizeMessage(
      `[HTTP ${createRes.status}] ${errBody.code ?? 'wc_api_error'}: ${errBody.message ?? createRes.statusText}`,
      appUser,
      appPassword
    ),
  }
}

async function upsertTermCache(
  supabase: SupabaseClient,
  taxonomySlug: ControlledTaxonomySlug,
  attributeId: number,
  term: WcTermPayload,
  source: 'wc_sync' | 'studio_created'
): Promise<void> {
  const { error } = await supabase.from('wc_terms').upsert(
    {
      id: term.id,
      taxonomy_id: attributeId,
      taxonomy_slug: taxonomySlug,
      name: term.name,
      slug: term.slug,
      count: term.count ?? 0,
      source,
      synced_at: new Date().toISOString(),
      raw: term,
    },
    { onConflict: 'id' }
  )
  if (error) {
    // Non-fatal: the term exists in WooCommerce regardless. A taxonomy re-sync
    // (POST /inventory/sync, S023A) repairs the cache if this write fails.
    console.warn(`[term-create] failed to upsert wc_terms cache for term ${term.id}: ${error.message}`)
  }
}

function sanitizeMessage(msg: string, user: string, password: string): string {
  let s = msg
  if (user) s = s.replaceAll(user, '[REDACTED]')
  if (password) s = s.replaceAll(password, '[REDACTED]')
  return s.slice(0, 500)
}
