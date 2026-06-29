import { createClient } from '@/lib/supabase/server'

const WC_TAXONOMIES = [
  { id: 4, slug: 'pa_equipo', labelStudio: 'Equipo' },
  { id: 5, slug: 'pa_liga', labelStudio: 'Liga' },
  { id: 6, slug: 'pa_jugador', labelStudio: 'Jugador' },
  { id: 7, slug: 'pa_ano', labelStudio: 'Ano' },
] as const

type WcAttribute = {
  id: number
  name: string
  slug: string
  type?: string
  order_by?: string
  has_archives?: boolean
}

type WcTerm = {
  id: number
  name: string
  slug: string
  count?: number
}

type WcCategory = {
  id: number
  name: string
  slug: string
  parent?: number
  count?: number
  description?: string
  menu_order?: number
}

type TaxonomySummary = {
  attributeId: number
  slug: string
  name: string
  terms: number
}

export type WcTaxonomySyncSummary = {
  syncedAt: string
  taxonomies: TaxonomySummary[]
  categories: number
  knownChecks: {
    realMadrid70: boolean
    fcBarcelona170: boolean
    season2014_15_139: boolean
  }
  wcGetCalled: true
  wcPostCalled: false
}

export type WcTaxonomySyncResult =
  | { ok: true; summary: WcTaxonomySyncSummary }
  | { ok: false; code: string; message: string; wcGetCalled: boolean; wcPostCalled: false }

type WcFetchContext = {
  siteUrl: string
  credentials: string
  appUser: string
  appPassword: string
  wcGetCalled: boolean
}

export async function syncWcTaxonomyCache(): Promise<WcTaxonomySyncResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      ok: false,
      code: 'auth_required',
      message: 'No autenticado.',
      wcGetCalled: false,
      wcPostCalled: false,
    }
  }

  const siteUrl = process.env.WP_SITE_URL
  const appUser = process.env.WP_APP_USER
  const appPassword = process.env.WP_APP_PASSWORD

  if (!siteUrl || !appUser || !appPassword) {
    return {
      ok: false,
      code: 'missing_credentials',
      message: 'WP_SITE_URL, WP_APP_USER o WP_APP_PASSWORD no estan configurados en el servidor.',
      wcGetCalled: false,
      wcPostCalled: false,
    }
  }

  const ctx: WcFetchContext = {
    siteUrl: siteUrl.replace(/\/$/, ''),
    credentials: Buffer.from(`${appUser}:${appPassword}`).toString('base64'),
    appUser,
    appPassword,
    wcGetCalled: false,
  }

  const syncedAt = new Date().toISOString()

  try {
    const attributes = await wcGet<WcAttribute[]>(ctx, '/wp-json/wc/v3/products/attributes')
    const relevantAttributes = WC_TAXONOMIES.map((expected) => {
      const attribute = attributes.find((candidate) => candidate.id === expected.id)
      if (!attribute) {
        throw new Error(`missing_wc_attribute:${expected.id}:${expected.slug}`)
      }
      return { expected, attribute }
    })

    const taxonomyRows = relevantAttributes.map(({ expected, attribute }) => ({
      id: expected.id,
      slug: expected.slug,
      name: attribute.name,
      label_studio: expected.labelStudio,
      type: attribute.type ?? null,
      order_by: attribute.order_by ?? null,
      has_archives: attribute.has_archives ?? null,
      source: 'wc_sync',
      synced_at: syncedAt,
      raw: attribute,
    }))

    const { error: taxonomyError } = await supabase
      .from('wc_taxonomies')
      .upsert(taxonomyRows, { onConflict: 'id' })

    if (taxonomyError) {
      return {
        ok: false,
        code: 'supabase_taxonomies_upsert_failed',
        message: taxonomyError.message,
        wcGetCalled: ctx.wcGetCalled,
        wcPostCalled: false,
      }
    }

    const taxonomySummaries: TaxonomySummary[] = []
    const allTerms: Array<WcTerm & { taxonomy_slug: string }> = []

    for (const taxonomy of WC_TAXONOMIES) {
      const terms = await wcGetPaginated<WcTerm>(
        ctx,
        `/wp-json/wc/v3/products/attributes/${taxonomy.id}/terms`,
        { hide_empty: 'false' }
      )

      allTerms.push(
        ...terms.map((term) => ({
          ...term,
          taxonomy_slug: taxonomy.slug,
        }))
      )

      const sourceAttribute = relevantAttributes.find(({ expected }) => expected.id === taxonomy.id)
      taxonomySummaries.push({
        attributeId: taxonomy.id,
        slug: taxonomy.slug,
        name: sourceAttribute?.attribute.name ?? taxonomy.labelStudio,
        terms: terms.length,
      })

      const termRows = terms.map((term) => ({
        id: term.id,
        taxonomy_id: taxonomy.id,
        taxonomy_slug: taxonomy.slug,
        name: term.name,
        slug: term.slug,
        count: term.count ?? 0,
        source: 'wc_sync',
        synced_at: syncedAt,
        raw: term,
      }))

      if (termRows.length > 0) {
        const { error: termError } = await supabase
          .from('wc_terms')
          .upsert(termRows, { onConflict: 'id' })

        if (termError) {
          return {
            ok: false,
            code: 'supabase_terms_upsert_failed',
            message: termError.message,
            wcGetCalled: ctx.wcGetCalled,
            wcPostCalled: false,
          }
        }
      }
    }

    const categories = await wcGetPaginated<WcCategory>(
      ctx,
      '/wp-json/wc/v3/products/categories',
      { hide_empty: 'false' }
    )

    const categoryRows = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parent: category.parent ?? null,
      count: category.count ?? 0,
      description: category.description ?? null,
      menu_order: category.menu_order ?? null,
      is_curatorial: category.id === 22 || category.id === 149,
      source: 'wc_sync',
      synced_at: syncedAt,
      raw: category,
    }))

    if (categoryRows.length > 0) {
      const { error: categoryError } = await supabase
        .from('wc_categories')
        .upsert(categoryRows, { onConflict: 'id' })

      if (categoryError) {
        return {
          ok: false,
          code: 'supabase_categories_upsert_failed',
          message: categoryError.message,
          wcGetCalled: ctx.wcGetCalled,
          wcPostCalled: false,
        }
      }
    }

    return {
      ok: true,
      summary: {
        syncedAt,
        taxonomies: taxonomySummaries,
        categories: categories.length,
        knownChecks: {
          realMadrid70: allTerms.some(
            (term) => term.taxonomy_slug === 'pa_equipo' && term.id === 70 && term.name === 'Real Madrid'
          ),
          fcBarcelona170: allTerms.some(
            (term) => term.taxonomy_slug === 'pa_equipo' && term.id === 170 && term.name === 'FC Barcelona'
          ),
          season2014_15_139: allTerms.some(
            (term) => term.taxonomy_slug === 'pa_ano' && term.id === 139 && term.name === '2014-15'
          ),
        },
        wcGetCalled: true,
        wcPostCalled: false,
      },
    }
  } catch (err) {
    return {
      ok: false,
      code: 'wc_get_failed',
      message: sanitizeMessage(err instanceof Error ? err.message : 'WooCommerce GET failed', appUser, appPassword),
      wcGetCalled: ctx.wcGetCalled,
      wcPostCalled: false,
    }
  }
}

async function wcGetPaginated<T>(
  ctx: WcFetchContext,
  path: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const firstPage = await wcGetPage<T>(ctx, path, { ...params, page: '1', per_page: '100' })
  const rows = [...firstPage.data]

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const nextPage = await wcGetPage<T>(ctx, path, {
      ...params,
      page: page.toString(),
      per_page: '100',
    })
    rows.push(...nextPage.data)
  }

  return rows
}

async function wcGetPage<T>(
  ctx: WcFetchContext,
  path: string,
  params: Record<string, string>
): Promise<{ data: T[]; totalPages: number }> {
  const url = buildUrl(ctx.siteUrl, path, params)
  const response = await wcFetch(ctx, url)

  if (!response.ok) {
    throw new Error(await parseWcError(response))
  }

  const data = (await response.json()) as T[]
  const totalPagesHeader = response.headers.get('x-wp-totalpages')
  const totalPages = totalPagesHeader ? Number(totalPagesHeader) : 1

  return {
    data,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  }
}

async function wcGet<T>(ctx: WcFetchContext, path: string): Promise<T> {
  const response = await wcFetch(ctx, buildUrl(ctx.siteUrl, path))

  if (!response.ok) {
    throw new Error(await parseWcError(response))
  }

  return (await response.json()) as T
}

async function wcFetch(ctx: WcFetchContext, url: string): Promise<Response> {
  ctx.wcGetCalled = true
  return fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${ctx.credentials}`,
      Accept: 'application/json',
    },
  })
}

function buildUrl(siteUrl: string, path: string, params: Record<string, string> = {}): string {
  const url = new URL(path, siteUrl)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return url.toString()
}

async function parseWcError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { code?: string; message?: string }
    return `[HTTP ${response.status}] ${body.code ?? 'wc_api_error'}: ${body.message ?? response.statusText}`
  } catch {
    return `[HTTP ${response.status}] ${response.statusText}`
  }
}

function sanitizeMessage(msg: string, user: string, password: string): string {
  let s = msg
  if (user) s = s.replaceAll(user, '[REDACTED]')
  if (password) s = s.replaceAll(password, '[REDACTED]')
  return s.slice(0, 500)
}
