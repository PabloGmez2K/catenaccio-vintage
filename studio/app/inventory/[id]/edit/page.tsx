import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { ErrorState } from '@/components/ErrorState'
import { ItemForm, type ItemFormDefaults, type MarcaFieldContext } from '@/components/ItemForm'
import { ManualSeoPanel } from '@/components/ManualSeoPanel'
import {
  DEFAULT_CATEGORY_IDS,
  findCategoryName,
  loadCachedCategories,
} from '@/lib/wc/category-cache'
import { isPendingImportedCost } from '@/lib/inventory/cost'
import { loadCachedTerms } from '@/lib/wc/term-cache'
import { buildTermOptions, type TermOptionsBySlug } from '@/lib/wc/term-options'
import { buildSuggestionContext } from '@/lib/ai/suggestion-context'
import { buildManualSeoPrompt } from '@/lib/seo/manual-seo-prompt'
import { fetchWooProductDetail } from '@/lib/wc/product-catalog'
import { extractWooProduct } from '@/lib/inventory/woo-studio-sync-contract'
import { listItemImages } from '@/app/inventory/image-actions'
import type { AiSuggestion, InventoryItemWithDetails } from '@/lib/types'

// Editar = the operative surface where fields change (STUDIO_OPERATIVE_EDIT_SURFACE):
// catalogue + commercial price block in the form, SEO/description workflow below it,
// and a clear path to photo management. Woo is never written from this page.

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, football_shirt_details(*)')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error?.code === 'PGRST116' || (!data && !error)) {
    notFound()
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error.message} />
      </AppShell>
    )
  }

  const shirt = data.football_shirt_details
  const costPending = isPendingImportedCost(Number(data.coste), data.notas_internas ?? null)

  // One cache read for the 7 contract taxonomies: form suggestions (liga/equipo/
  // año/jugador), real marca datalist, and the Woo-side extraction below.
  const [cachedTerms, categories, images, { data: suggestionsData }] = await Promise.all([
    loadCachedTerms(supabase, [
      'pa_liga',
      'pa_equipo',
      'pa_ano',
      'pa_jugador',
      'pa_talla',
      'pa_condicion',
      'pa_marca',
    ]),
    loadCachedCategories(supabase),
    listItemImages(supabase, id),
    supabase
      .from('ai_suggestions')
      .select('*')
      .eq('item_id', id)
      .order('version', { ascending: false }),
  ])

  const termOptions: TermOptionsBySlug = {
    pa_liga: buildTermOptions(cachedTerms.pa_liga),
    pa_equipo: buildTermOptions(cachedTerms.pa_equipo),
    pa_ano: buildTermOptions(cachedTerms.pa_ano),
    pa_jugador: buildTermOptions(cachedTerms.pa_jugador),
  }
  const marcaCacheNames = (cachedTerms.pa_marca ?? [])
    .map((t) => t.name)
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }))
  const recommendedNames = {
    withLiga: findCategoryName(categories, DEFAULT_CATEGORY_IDS.otrosClubs),
    withoutLiga: findCategoryName(categories, DEFAULT_CATEGORY_IDS.seleccionesNacionales),
  }

  // Live Woo side (GET only) for linked items: brand state under the marca field
  // and the current web description as SEO base.
  const marcaCacheEmpty = (cachedTerms.pa_marca ?? []).length === 0
  let marcaContext: MarcaFieldContext
  let wooDescription: string | null = null
  let wooTitle: string | null = null

  if (data.wc_product_id != null) {
    const liveResult = await fetchWooProductDetail(data.wc_product_id)
    if (liveResult.ok) {
      const extraction = extractWooProduct(liveResult.product, cachedTerms, categories)
      const marcaField = extraction.fields.marca
      marcaContext = {
        wooState:
          marcaField.origin === 'absent'
            ? 'absent'
            : marcaField.origin === 'unresolved'
              ? 'unresolved'
              : 'present',
        cacheEmpty: marcaCacheEmpty,
        wooValue: marcaField.display,
      }
      wooDescription = liveResult.product.description || null
      wooTitle = liveResult.product.name || null
    } else {
      marcaContext = { wooState: 'unknown', cacheEmpty: marcaCacheEmpty }
    }
  } else {
    marcaContext = { wooState: 'not_linked', cacheEmpty: marcaCacheEmpty }
  }

  const suggestions = (suggestionsData ?? []) as AiSuggestion[]
  const approvedSuggestion =
    suggestions.find((s) => s.status === 'editado_aprobado' || s.status === 'aprobado') ?? null
  const ctx = buildSuggestionContext(data as InventoryItemWithDetails)
  const manualSeoPromptText = buildManualSeoPrompt(ctx)

  const defaultValues: ItemFormDefaults = {
    referencia: data.referencia ?? '',
    coste: costPending ? '' : data.coste != null ? String(data.coste) : '',
    cost_pending: costPending,
    precio_objetivo: data.precio_objetivo != null ? String(data.precio_objetivo) : '',
    precio_publicado_web:
      data.precio_publicado_web != null ? String(data.precio_publicado_web) : '',
    fecha_compra: data.fecha_compra ?? '',
    proveedor: data.proveedor ?? '',
    notas_compra: data.notas_compra ?? '',
    notas_internas: data.notas_internas ?? '',
    // Shirt fields — use defaults if shirt row exists
    liga_display: shirt?.liga_display ?? '',
    equipo_display: shirt?.equipo_display ?? '',
    temporada_display: shirt?.temporada_display ?? '',
    marca_display: shirt?.marca_display ?? '',
    talla: shirt?.talla ?? '',
    condicion: shirt?.condicion ?? '',
    categoria: shirt?.categoria != null ? String(shirt.categoria) : '',
    product_type: shirt?.product_type ?? 'Shirt',
    shirt_version: shirt?.shirt_version ?? 'Home',
    authenticity_type: shirt?.authenticity_type ?? 'Replica',
    sleeve_length: shirt?.sleeve_length ?? 'Short Sleeve',
    sponsor: shirt?.sponsor ?? '',
    jugador_display: shirt?.jugador_display ?? '',
    numero_dorsal: shirt?.numero_dorsal ?? '',
    nombre_dorsal: shirt?.nombre_dorsal ?? '',
    tiene_parches: shirt?.tiene_parches ?? false,
    parches_descripcion: shirt?.parches_descripcion ?? '',
    tiene_etiquetas: shirt?.tiene_etiquetas ?? false,
    es_match_worn: shirt?.es_match_worn ?? false,
    largo_cm: shirt?.largo_cm != null ? String(shirt.largo_cm) : '',
    ancho_cm: shirt?.ancho_cm != null ? String(shirt.ancho_cm) : '',
    condicion_notas: shirt?.condicion_notas ?? '',
    autenticidad: shirt?.autenticidad ?? '',
  }

  return (
    <AppShell>
      <ItemForm
        mode="edit"
        itemId={id}
        defaultValues={defaultValues}
        categoryOptions={categoryOptions}
        recommendedCategoryNames={recommendedNames}
        termOptions={termOptions}
        marcaContext={marcaContext}
        marcaCacheNames={marcaCacheNames}
      />

      <div className="edit-extras">
        <section className="detail-section edit-photos-access">
          <h3>Fotos</h3>
          <p className="sale-hint">
            {images.length > 0
              ? `Esta camiseta tiene ${images.length} foto${images.length !== 1 ? 's' : ''} en Studio.`
              : 'Esta camiseta aún no tiene fotos en Studio.'}{' '}
            Las fotos se gestionan desde la ficha (subir, ordenar, importar las de la web).
          </p>
          <Link href={`/inventory/${id}#fotos`} className="btn-secondary btn-sm">
            Gestionar fotos en la ficha
          </Link>
        </section>

        <ManualSeoPanel
          itemId={id}
          promptText={manualSeoPromptText}
          approvedSuggestion={approvedSuggestion}
          precioPubWeb={data.precio_publicado_web != null ? Number(data.precio_publicado_web) : null}
          wooDescription={wooDescription}
          wooTitle={wooTitle ?? data.referencia ?? null}
        />
      </div>
    </AppShell>
  )
}
