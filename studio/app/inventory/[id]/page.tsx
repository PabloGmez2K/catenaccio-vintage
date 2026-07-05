import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { ErrorState } from '@/components/ErrorState'
import { StatusBadge } from '@/components/StatusBadge'
import { AiSuggestionsPanel } from '@/components/AiSuggestionsPanel'
import { ManualSeoPanel } from '@/components/ManualSeoPanel'
import { ProductPreflightPanel } from '@/components/ProductPreflightPanel'
import { WcDraftPanel } from '@/components/WcDraftPanel'
import { ItemImagesPanel } from '@/components/ItemImagesPanel'
import { SalePanel } from '@/components/SalePanel'
import { VintedPanel } from '@/components/VintedPanel'
import { WooSyncPanel, type WooLogEntry } from '@/components/WooSyncPanel'
import { fetchWooProductDetail, type WooProductDetail } from '@/lib/wc/product-catalog'
import { buildWooDiff, type WooDiffResult } from '@/lib/inventory/woo-diff'
import {
  buildCatalogComparison,
  extractWooProduct,
  type CatalogFieldRow,
  type WooExtraction,
} from '@/lib/inventory/woo-studio-sync-contract'
import { loadCachedTerms } from '@/lib/wc/term-cache'
import { loadCachedCategories } from '@/lib/wc/category-cache'
import { buildSuggestionContext } from '@/lib/ai/suggestion-context'
import { buildManualSeoPrompt } from '@/lib/seo/manual-seo-prompt'
import { evaluateProductPreflight, type PreflightInput } from '@/lib/preflight/product-preflight'
import { listItemImages } from '@/app/inventory/image-actions'
import { isPendingImportedCost } from '@/lib/inventory/cost'
import { notFound } from 'next/navigation'
import type {
  ItemStatus,
  PhotoStatus,
  WcSyncStatus,
  AiSuggestion,
  InventoryItemWithDetails,
  SaleChannel,
  VintedStatus,
} from '@/lib/types'

// Maps raw DB authenticity_type values to the UI label Pablo sees.
// 'Replica' is the stored value for "Original" (legacy + current internal value).
function formatAuthenticityLabel(value: string | null): string {
  if (!value) return '—'
  if (value === 'Replica' || value === 'Original retail / Fan version' || value === 'Original') {
    return 'Original'
  }
  return value
}

function displayTermValue(display: string | null): string {
  if (!display?.trim()) return 'Pendiente de mapear'
  return /^\d+$/.test(display.trim()) ? 'Pendiente de mapear' : display
}

// Optional fields: empty is a legitimate "no value" (—), but a raw numeric ID is
// still a pending mapping, never shown as human text.
function optionalTermValue(display: string | null): string {
  if (!display?.trim()) return '—'
  return /^\d+$/.test(display.trim()) ? 'Pendiente de mapear' : display
}

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, football_shirt_details(*)')
    .eq('id', id)
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

  // AI suggestions panel — only rendered when STUDIO_AI_ENABLED=true (server-side flag).
  // Default off: cost-deferred until AI integration is explicitly activated.
  const aiEnabled = process.env.STUDIO_AI_ENABLED === 'true'

  // S026B — Woo image attach flag (shadow-first, default off). Never set in .env.local by the agent.
  const attachImagesEnabled = process.env.STUDIO_WC_ATTACH_IMAGES_ENABLED === 'true'

  // Always load suggestions (needed for ManualSeoPanel regardless of aiEnabled).
  const { data: suggestionsData } = await supabase
    .from('ai_suggestions')
    .select('*')
    .eq('item_id', id)
    .order('version', { ascending: false })
  const suggestions = (suggestionsData ?? []) as AiSuggestion[]

  // Latest approved suggestion for display in ManualSeoPanel (covers both manual + AI sources).
  const approvedSuggestion =
    suggestions.find(
      s => s.status === 'editado_aprobado' || s.status === 'aprobado'
    ) ?? null

  // Build prompt text server-side (no secrets; SuggestionContext is already sanitized).
  const ctx = buildSuggestionContext(data as InventoryItemWithDetails)
  const manualSeoPromptText = buildManualSeoPrompt(ctx)

  const shirt = data.football_shirt_details
  const costPending = isPendingImportedCost(Number(data.coste), data.notas_internas ?? null)

  // S026A — images uploaded to Supabase Storage for this item (media_assets).
  const images = await listItemImages(supabase, id)

  // Sale notes live in the audit trail (event 'sold'/'sale_updated'), not in a column.
  const { data: saleEvents } = await supabase
    .from('item_lifecycle_events')
    .select('notes')
    .eq('item_id', id)
    .in('event_type', ['sold', 'sale_updated'])
    .order('created_at', { ascending: false })
    .limit(1)
  const saleNotes = data.status === 'vendida' ? (saleEvents?.[0]?.notes ?? null) : null

  // ── WOO_WRITE_SYNC — live web state + sync log for linked items ─────────────
  // One GET per ficha view: the sync panel works against the REAL product, never
  // against the local mirror alone. If the read fails, actions are disabled.
  const wpSiteBase = process.env.WP_SITE_URL?.replace(/\/$/, '') ?? null
  let wooLive: WooProductDetail | null = null
  let wooLiveError: string | null = null
  let wooFetchedAt: string | null = null
  let wooDiff: WooDiffResult | null = null
  let wooLog: WooLogEntry[] = []
  let wooExtraction: WooExtraction | null = null
  let catalogRows: CatalogFieldRow[] | null = null

  if (data.wc_product_id != null) {
    const [liveResult, { data: logRows }] = await Promise.all([
      fetchWooProductDetail(data.wc_product_id),
      supabase
        .from('item_lifecycle_events')
        .select('id, created_at, event_type, notes')
        .eq('item_id', id)
        .in('event_type', [
          'wc_sync_ok',
          'wc_price_synced',
          'wc_stock_synced',
          'wc_description_synced',
          'wc_trashed',
          'wc_sync_error',
          'wc_state_refreshed',
          'created_from_woo',
          'woo_rehydrated',
          'woo_images_imported',
        ])
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    if (liveResult.ok) {
      wooLive = liveResult.product
      wooFetchedAt = liveResult.fetchedAt
      wooDiff = buildWooDiff({
        itemStatus: data.status as ItemStatus,
        wcStatusMirror: data.wc_status as WcSyncStatus,
        precioPublicadoWeb:
          data.precio_publicado_web != null ? Number(data.precio_publicado_web) : null,
        approvedDescription: approvedSuggestion?.descripcion_larga ?? null,
        live: liveResult.product,
      })

      // STUDIO_WOO_SYNC_CONTRACT — canonical field mapping of the live product
      // and Studio↔Woo catalog comparison for the verification panel.
      const [terms, categories] = await Promise.all([
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
      ])
      wooExtraction = extractWooProduct(liveResult.product, terms, categories)
      catalogRows = buildCatalogComparison(
        {
          referencia: data.referencia ?? null,
          liga_display: shirt?.liga_display ?? null,
          equipo_display: shirt?.equipo_display ?? null,
          temporada_display: shirt?.temporada_display ?? null,
          jugador_display: shirt?.jugador_display ?? null,
          talla: shirt?.talla ?? null,
          condicion: shirt?.condicion ?? null,
          marca_display: shirt?.marca_display ?? null,
          ancho_cm: shirt?.ancho_cm != null ? Number(shirt.ancho_cm) : null,
          largo_cm: shirt?.largo_cm != null ? Number(shirt.largo_cm) : null,
          condicion_notas: shirt?.condicion_notas ?? null,
          categoria: shirt?.categoria ?? null,
          categoria_display: shirt?.categoria_display ?? null,
        },
        wooExtraction,
        liveResult.product.name
      )
    } else {
      wooLiveError = liveResult.message
    }
    wooLog = (logRows ?? []) as WooLogEntry[]
  }

  // S024 — completeness preflight. Pure evaluation over already-loaded data (no Woo, no writes).
  const preflightInput: PreflightInput = {
    referencia: data.referencia ?? null,
    wcProductId: data.wc_product_id ?? null,
    precioPublicadoWeb: data.precio_publicado_web != null ? Number(data.precio_publicado_web) : null,
    shirt: shirt
      ? {
          product_type: shirt.product_type ?? null,
          talla: shirt.talla ?? null,
          condicion: shirt.condicion ?? null,
          condicion_notas: shirt.condicion_notas ?? null,
          liga: shirt.liga ?? null,
          liga_display: shirt.liga_display ?? null,
          equipo: shirt.equipo ?? null,
          equipo_display: shirt.equipo_display ?? null,
          temporada: shirt.temporada ?? null,
          temporada_display: shirt.temporada_display ?? null,
          jugador: shirt.jugador ?? null,
          jugador_display: shirt.jugador_display ?? null,
          marca_display: shirt.marca_display ?? null,
          categoria: shirt.categoria ?? null,
          categoria_display: shirt.categoria_display ?? null,
          ancho_cm: shirt.ancho_cm != null ? Number(shirt.ancho_cm) : null,
          largo_cm: shirt.largo_cm != null ? Number(shirt.largo_cm) : null,
        }
      : null,
    approvedSeo: approvedSuggestion
      ? {
          titulo_seo: approvedSuggestion.titulo_seo,
          descripcion_larga: approvedSuggestion.descripcion_larga,
        }
      : null,
    imageCount: images.length,
    webImageAvailable: wooLive?.imageSrc != null,
    attachImagesEnabled,
  }
  const preflight = evaluateProductPreflight(preflightInput)
  const preflightBlockers = preflight.groups
    .flatMap((g) => g.checks)
    .filter((c) => c.status === 'blocker')
    .map((c) => c.message)

  return (
    <AppShell>
      <div className="item-detail">
        <div className="detail-top-row">
          <Link href="/inventory" className="back-link">
            ← Volver al inventario
          </Link>
          <Link href={`/inventory/${data.id}/edit`} className="btn-secondary btn-sm">
            Editar
          </Link>
        </div>

        <h2>{data.referencia}</h2>

        <section className="detail-section">
          <h3>Estado</h3>
          <div className="field-row">
            <span className="field-label">Pipeline</span>
            <StatusBadge type="item" value={data.status as ItemStatus} />
          </div>
          <div className="field-row">
            <span className="field-label">WooCommerce</span>
            <StatusBadge type="wc" value={data.wc_status as WcSyncStatus} />
          </div>
          <div className="field-row">
            <span className="field-label">Fotos</span>
            <StatusBadge type="photo" value={data.photo_status as PhotoStatus} />
          </div>
        </section>

        <section className="detail-section">
          <h3>Precios</h3>
          <div className="field-row">
            <span className="field-label">Coste</span>
            <span className="field-value">
              {costPending ? 'Coste pendiente' : `EUR ${Number(data.coste).toFixed(2)}`}
            </span>
          </div>
          {data.precio_objetivo != null && (
            <div className="field-row">
              <span className="field-label">Precio objetivo</span>
              <span className="field-value">EUR {Number(data.precio_objetivo).toFixed(2)}</span>
            </div>
          )}
          {data.precio_objetivo != null && (
            <div className="field-row">
              <span className="field-label">Margen esperado</span>
              <span className="field-value">
                {costPending
                  ? 'Margen pendiente: falta coste real'
                  : `EUR ${(Number(data.precio_objetivo) - Number(data.coste)).toFixed(2)}`}
              </span>
            </div>
          )}
          {data.precio_publicado_web != null && (
            <div className="field-row">
              <span className="field-label">Precio web</span>
              <span className="field-value">EUR {Number(data.precio_publicado_web).toFixed(2)}</span>
            </div>
          )}
        </section>

        {false && (
        <section className="detail-section">
          <h3>Precios</h3>
          <div className="field-row">
            <span className="field-label">Coste</span>
            <span className="field-value">€{Number(data.coste).toFixed(2)}</span>
          </div>
          {data.precio_objetivo != null && (
            <div className="field-row">
              <span className="field-label">Precio objetivo</span>
              <span className="field-value">
                €{Number(data.precio_objetivo).toFixed(2)}
              </span>
            </div>
          )}
          {data.precio_objetivo != null && (
            <div className="field-row">
              <span className="field-label">Margen esperado</span>
              <span className="field-value">
                €{(Number(data.precio_objetivo) - Number(data.coste)).toFixed(2)}
              </span>
            </div>
          )}
          {data.precio_publicado_web != null && (
            <div className="field-row">
              <span className="field-label">Precio web</span>
              <span className="field-value">
                €{Number(data.precio_publicado_web).toFixed(2)}
              </span>
            </div>
          )}
        </section>
        )}

        <SalePanel
          itemId={data.id}
          referencia={data.referencia}
          status={data.status as ItemStatus}
          coste={Number(data.coste)}
          costPending={costPending}
          canalVenta={(data.canal_venta ?? null) as SaleChannel | null}
          precioVendido={data.precio_vendido != null ? Number(data.precio_vendido) : null}
          fechaVenta={data.fecha_venta ?? null}
          saleNotes={saleNotes}
          hasWcProduct={data.wc_product_id != null}
          wooStockStatus={wooLive?.stockStatus ?? null}
        />

        {data.wc_product_id != null && (
          <WooSyncPanel
            itemId={data.id}
            wcProductId={data.wc_product_id}
            live={wooLive}
            liveError={wooLiveError}
            fetchedAt={wooFetchedAt}
            diff={wooDiff}
            catalogRows={catalogRows}
            unmappedAttributes={wooExtraction?.unmappedAttributes ?? []}
            unmappedMeta={wooExtraction?.unmappedMeta ?? []}
            studioPrice={
              data.precio_publicado_web != null ? Number(data.precio_publicado_web) : null
            }
            approvedSuggestionId={approvedSuggestion?.id ?? null}
            wpAdminUrl={
              wpSiteBase
                ? `${wpSiteBase}/wp-admin/post.php?post=${data.wc_product_id}&action=edit`
                : null
            }
            log={wooLog}
          />
        )}

        <VintedPanel
          itemId={data.id}
          vintedStatus={(data.vinted_status ?? 'no_aplica') as VintedStatus}
          vintedUrl={data.vinted_url ?? null}
          vintedPrice={data.vinted_price != null ? Number(data.vinted_price) : null}
          vintedPublishedAt={data.vinted_published_at ?? null}
          vintedNotes={data.vinted_notes ?? null}
        />

        {(data.proveedor || data.fecha_compra) && (
          <section className="detail-section">
            <h3>Adquisición</h3>
            {data.proveedor && (
              <div className="field-row">
                <span className="field-label">Proveedor</span>
                <span className="field-value">{data.proveedor}</span>
              </div>
            )}
            {data.fecha_compra && (
              <div className="field-row">
                <span className="field-label">Fecha compra</span>
                <span className="field-value">
                  {new Date(data.fecha_compra).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </section>
        )}

        {shirt && (
          <section className="detail-section">
            <h3>Camiseta</h3>

            {/* Canonical product fields */}
            <div className="field-row">
              <span className="field-label">Tipo</span>
              <span className="field-value">{shirt.product_type}</span>
            </div>
            {shirt.shirt_version && shirt.shirt_version !== 'None' && (
              <div className="field-row">
                <span className="field-label">Versión</span>
                <span className="field-value">{shirt.shirt_version}</span>
              </div>
            )}
            <div className="field-row">
              <span className="field-label">Autenticidad</span>
              <span className="field-value">{formatAuthenticityLabel(shirt.authenticity_type)}</span>
            </div>
            {shirt.product_type === 'Shirt' && (
              <div className="field-row">
                <span className="field-label">Manga</span>
                <span className="field-value">{shirt.sleeve_length}</span>
              </div>
            )}
            {shirt.sponsor && (
              <div className="field-row">
                <span className="field-label">Sponsor</span>
                <span className="field-value">{shirt.sponsor}</span>
              </div>
            )}

            {/* Catalogue taxonomy */}
            <div className="field-row">
              <span className="field-label">Equipo</span>
              <span className="field-value">{displayTermValue(shirt.equipo_display)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Temporada</span>
              <span className="field-value">{displayTermValue(shirt.temporada_display)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Talla</span>
              <span className="field-value">
                {/* A numeric talla can be a legit size name ("38"); legacy raw
                    term IDs are healed by rehydrate, so show the value as-is. */}
                {shirt.talla?.trim() || '—'}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Condición</span>
              <span className="field-value">{displayTermValue(shirt.condicion)}</span>
            </div>
            {shirt.liga_display && (
              <div className="field-row">
                <span className="field-label">Liga</span>
                <span className="field-value">{optionalTermValue(shirt.liga_display)}</span>
              </div>
            )}
            <div className="field-row">
              <span className="field-label">Marca</span>
              <span className="field-value">{optionalTermValue(shirt.marca_display)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Medidas</span>
              <span className="field-value">
                {shirt.ancho_cm != null || shirt.largo_cm != null
                  ? `${shirt.ancho_cm ?? '—'} × ${shirt.largo_cm ?? '—'} cm (ancho × largo)`
                  : '—'}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Categoría WC</span>
              <span className="field-value">
                {shirt.categoria_display ?? 'Automática (según liga)'}
              </span>
            </div>

            {/* Player / personalisation */}
            {shirt.jugador_display && (
              <div className="field-row">
                <span className="field-label">Jugador</span>
                <span className="field-value">{optionalTermValue(shirt.jugador_display)}</span>
              </div>
            )}
            {shirt.numero_dorsal && (
              <div className="field-row">
                <span className="field-label">Dorsal</span>
                <span className="field-value">
                  {shirt.numero_dorsal}
                  {shirt.nombre_dorsal ? ` · ${shirt.nombre_dorsal}` : ''}
                </span>
              </div>
            )}

            {(shirt.es_match_worn ||
              shirt.tiene_parches ||
              shirt.tiene_etiquetas) && (
              <div className="field-row">
                <span className="field-label">Características</span>
                <span className="field-value">
                  {[
                    shirt.es_match_worn && 'Match worn',
                    shirt.tiene_parches && 'Con parches',
                    shirt.tiene_etiquetas && 'Con etiquetas',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            )}

            {shirt.condicion_notas && (
              <div className="field-row">
                <span className="field-label">Notas condición</span>
                <span className="field-value">{shirt.condicion_notas}</span>
              </div>
            )}
            {shirt.autenticidad && (
              <div className="field-row">
                <span className="field-label">Notas autenticidad</span>
                <span className="field-value">{shirt.autenticidad}</span>
              </div>
            )}
          </section>
        )}

        {data.notas_compra && (
          <section className="detail-section">
            <h3>Notas de compra</h3>
            <p className="detail-notes">{data.notas_compra}</p>
          </section>
        )}

        {data.notas_internas && (
          <section className="detail-section">
            <h3>Notas internas</h3>
            <p className="detail-notes">{data.notas_internas}</p>
          </section>
        )}

        <ItemImagesPanel
          itemId={data.id}
          images={images}
          webImageSrc={wooLive?.imageSrc ?? null}
          webImages={wooLive?.images ?? []}
        />

        <ManualSeoPanel
          itemId={data.id}
          promptText={manualSeoPromptText}
          approvedSuggestion={approvedSuggestion}
          precioPubWeb={data.precio_publicado_web != null ? Number(data.precio_publicado_web) : null}
          wooDescription={wooLive?.description ?? null}
          wooTitle={wooLive?.name ?? data.referencia ?? null}
        />

        <ProductPreflightPanel result={preflight} editHref={`/inventory/${data.id}/edit`} />

        {/* Draft creation only — once linked, the web lives in «Sincronización web». */}
        {approvedSuggestion && data.wc_product_id == null && (
          <WcDraftPanel
            itemId={data.id}
            wcProductId={null}
            wcStatus={data.wc_status as string}
            wcError={data.wc_error ?? null}
            precioPubWeb={data.precio_publicado_web ? Number(data.precio_publicado_web) : null}
            preflightStatus={preflight.status}
            blockerMessages={preflightBlockers}
            imageCount={images.length}
            attachImagesEnabled={attachImagesEnabled}
          />
        )}

        {aiEnabled && (
          <AiSuggestionsPanel itemId={data.id} suggestions={suggestions} />
        )}

      </div>
    </AppShell>
  )
}
