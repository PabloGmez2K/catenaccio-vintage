import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { ErrorState } from '@/components/ErrorState'
import { StatusBadge } from '@/components/StatusBadge'
import { AiSuggestionsPanel } from '@/components/AiSuggestionsPanel'
import { ManualSeoPanel } from '@/components/ManualSeoPanel'
import { buildSuggestionContext } from '@/lib/ai/suggestion-context'
import { buildManualSeoPrompt } from '@/lib/seo/manual-seo-prompt'
import { notFound } from 'next/navigation'
import type { ItemStatus, PhotoStatus, WcSyncStatus, AiSuggestion, InventoryItemWithDetails } from '@/lib/types'

// Maps raw DB authenticity_type values to the UI label Pablo sees.
// 'Replica' is the stored value for "Original" (legacy + current internal value).
function formatAuthenticityLabel(value: string | null): string {
  if (!value) return '—'
  if (value === 'Replica' || value === 'Original retail / Fan version' || value === 'Original') {
    return 'Original'
  }
  return value
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
              <span className="field-value">
                {shirt.equipo_display ?? shirt.equipo}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Temporada</span>
              <span className="field-value">
                {shirt.temporada_display ?? shirt.temporada}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Talla</span>
              <span className="field-value">{shirt.talla}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Condición</span>
              <span className="field-value">{shirt.condicion}</span>
            </div>
            {shirt.liga_display && (
              <div className="field-row">
                <span className="field-label">Liga</span>
                <span className="field-value">{shirt.liga_display}</span>
              </div>
            )}
            {shirt.marca_display && (
              <div className="field-row">
                <span className="field-label">Marca</span>
                <span className="field-value">{shirt.marca_display}</span>
              </div>
            )}

            {/* Player / personalisation */}
            {shirt.jugador_display && (
              <div className="field-row">
                <span className="field-label">Jugador</span>
                <span className="field-value">{shirt.jugador_display}</span>
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

        <ManualSeoPanel
          itemId={data.id}
          promptText={manualSeoPromptText}
          approvedSuggestion={approvedSuggestion}
        />

        {aiEnabled && (
          <AiSuggestionsPanel itemId={data.id} suggestions={suggestions} />
        )}

      </div>
    </AppShell>
  )
}
