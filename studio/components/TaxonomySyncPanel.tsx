'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { runTaxonomySync, type TaxonomySyncActionResult } from '@/app/inventory/woo/sync-actions'

// Operative surface for the Woo taxonomy/category cache sync (previously only a
// POST-only API route — not a screen). Lives in Auditoría web. One button, live
// result, sanitized errors. GET against Woo + local cache writes; never writes
// to WooCommerce.

export interface CachedTaxonomyStatus {
  slug: string
  label: string
  terms: number
  syncedAt: string | null
}

const TAXONOMY_LABELS: Record<string, string> = {
  pa_equipo: 'Equipo',
  pa_liga: 'Liga',
  pa_jugador: 'Jugador',
  pa_ano: 'Temporada',
  pa_talla: 'Talla',
  pa_condicion: 'Condición',
  pa_marca: 'Marca',
}

export function TaxonomySyncPanel({ cacheStatus }: { cacheStatus: CachedTaxonomyStatus[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<TaxonomySyncActionResult | null>(null)

  const emptySlugs = cacheStatus.filter((t) => t.terms === 0).map((t) => t.label)
  const lastSynced = cacheStatus
    .map((t) => t.syncedAt)
    .filter((v): v is string => Boolean(v))
    .sort()
    .pop()

  function handleSync() {
    setResult(null)
    startTransition(async () => {
      // The action itself never throws (Woo/Supabase failures come back sanitized),
      // but the server-action TRANSPORT can reject (server down, browser offline) —
      // exactly the scenario this panel exists for, so it must stay readable.
      try {
        const res = await runTaxonomySync()
        setResult(res)
        if (res.ok) router.refresh()
      } catch {
        setResult({
          ok: false,
          code: 'transport_error',
          message:
            'No se pudo contactar con Studio (red o servidor caído). La caché anterior sigue intacta — reintenta en un momento.',
        })
      }
    })
  }

  return (
    <section className="taxonomy-sync-panel" id="sync-taxonomias">
      <div className="taxonomy-sync-header">
        <div>
          <h3>Taxonomías y categorías Woo</h3>
          <p className="taxonomy-sync-sub">
            Studio resuelve equipo, temporada, liga, jugador, talla, condición y marca contra esta
            caché. Sincronízala tras crear términos en WP Admin o si algún campo aparece
            «pendiente de mapear».
            {lastSynced &&
              ` Última sincronización: ${new Date(lastSynced).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}.`}
          </p>
        </div>
        <button
          type="button"
          className="btn-primary btn-sm"
          onClick={handleSync}
          disabled={isPending}
        >
          {isPending ? 'Sincronizando…' : 'Sincronizar taxonomías Woo'}
        </button>
      </div>

      {emptySlugs.length > 0 && !isPending && (!result || !result.ok) && (
        <p className="taxonomy-sync-warning">
          Cachés vacías: <strong>{emptySlugs.join(', ')}</strong>. Hasta sincronizar, esos campos
          no pueden resolver términos de la web (marca/condición quedarán pendientes).
        </p>
      )}

      <div className="taxonomy-sync-status">
        {cacheStatus.map((t) => (
          <span
            key={t.slug}
            className={`status-badge ${t.terms > 0 ? 'badge-gray' : 'badge-yellow'}`}
            title={t.slug}
          >
            {t.label}: {t.terms}
          </span>
        ))}
      </div>

      {isPending && (
        <div className="wc-draft-progress">
          <span className="wc-draft-spinner" aria-hidden="true" />
          <span>Leyendo taxonomías y categorías de la web… puede tardar unos segundos.</span>
        </div>
      )}

      {!isPending && result && !result.ok && (
        <div className="wc-draft-error">
          No se pudo sincronizar: {result.message}
          <br />
          <span className="taxonomy-sync-error-code">Código: {result.code}</span>. La caché
          anterior sigue intacta — puedes reintentar.
        </div>
      )}

      {!isPending && result && result.ok && (
        <div className="wc-draft-ok taxonomy-sync-result">
          <p>
            Sincronización completada a las{' '}
            {new Date(result.syncedAt).toLocaleTimeString('es-ES')} · {result.categories}{' '}
            categorías.
          </p>
          <ul className="taxonomy-sync-result-list">
            {result.taxonomies.map((t) => (
              <li key={t.slug}>
                {TAXONOMY_LABELS[t.slug] ?? t.slug}: {t.terms} término{t.terms !== 1 ? 's' : ''}
              </li>
            ))}
          </ul>
          {result.missingSlugs.length > 0 && (
            <p className="taxonomy-sync-warning">
              No se pudieron sincronizar: {result.missingSlugs.map((s) => TAXONOMY_LABELS[s] ?? s).join(', ')}.
              El resto de la caché sí quedó actualizada.
            </p>
          )}
        </div>
      )}

      <p className="sale-hint">
        Esta acción solo lee de la web y actualiza la caché local de Studio. No modifica
        WooCommerce.
      </p>
    </section>
  )
}
