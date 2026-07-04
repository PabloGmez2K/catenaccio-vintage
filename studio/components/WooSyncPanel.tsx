'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  refreshLocalWooMirror,
  syncWooDescription,
  syncWooPrice,
  syncWooStockOut,
  trashWooDraftForItem,
  type WooSyncResult,
} from '@/app/inventory/[id]/woo-sync-actions'
import type { WooProductDetail } from '@/lib/wc/product-catalog'
import type { WooDiffResult } from '@/lib/inventory/woo-diff'

// WOO_WRITE_SYNC foundation — the item's web sync panel. Shows the LIVE Woo
// state next to Studio's, the field-by-field diff, and the controlled actions.
// Every web write is two-step: the button arms an inline confirmation box that
// states exactly what will change; only "Confirmar" executes. No native
// confirm() dialogs for web writes. Results and errors stay visible, and the
// persistent log (item_lifecycle_events) renders below.

type WooAction = 'price' | 'stock' | 'description' | 'trash'

export interface WooLogEntry {
  id: string
  created_at: string
  event_type: string
  notes: string | null
}

const LOG_LABELS: Record<string, string> = {
  wc_sync_ok: 'Borrador creado en la web',
  wc_price_synced: 'Precio actualizado en la web',
  wc_stock_synced: 'Web dejada agotada',
  wc_description_synced: 'Descripción actualizada en la web',
  wc_trashed: 'Borrador enviado a papelera',
  wc_sync_error: 'Error de sincronización',
  wc_state_refreshed: 'Estado local actualizado',
  created_from_woo: 'Ficha creada desde la web',
}

const WOO_STATUS_LABELS: Record<string, string> = {
  publish: 'Publicado',
  draft: 'Borrador',
  pending: 'Pendiente',
  private: 'Privado',
  trash: 'Papelera',
}

const WOO_STATUS_TONES: Record<string, string> = {
  publish: 'badge-green',
  draft: 'badge-blue',
  pending: 'badge-yellow',
  private: 'badge-purple',
  trash: 'badge-red',
}

export function WooSyncPanel({
  itemId,
  wcProductId,
  live,
  liveError,
  fetchedAt,
  diff,
  studioPrice,
  approvedSuggestionId,
  wpAdminUrl,
  log,
}: {
  itemId: string
  wcProductId: number
  live: WooProductDetail | null
  liveError: string | null
  fetchedAt: string | null
  diff: WooDiffResult | null
  studioPrice: number | null
  approvedSuggestionId: string | null
  wpAdminUrl: string | null
  log: WooLogEntry[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [armed, setArmed] = useState<WooAction | null>(null)
  const [runningAction, setRunningAction] = useState<WooAction | 'mirror' | null>(null)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  function run(action: WooAction | 'mirror', fn: () => Promise<WooSyncResult>) {
    setResult(null)
    setRunningAction(action)
    setArmed(null)
    startTransition(async () => {
      const res = await fn()
      setRunningAction(null)
      if (res.ok) {
        setResult({ ok: true, text: res.message })
        router.refresh()
      } else {
        setResult({ ok: false, text: res.error })
      }
    })
  }

  const busy = isPending

  return (
    <section className="detail-section woo-sync-section" id="sync-web">
      <h3>Sincronización web</h3>

      <div className="woo-sync-status">
        <span className="woo-sync-linked">
          Vinculada al producto web <strong>#{wcProductId}</strong>
        </span>
        {live && (
          <>
            <span className={`status-badge ${WOO_STATUS_TONES[live.status] ?? 'badge-gray'}`}>
              {WOO_STATUS_LABELS[live.status] ?? live.status}
            </span>
            <span
              className={`status-badge ${live.stockStatus === 'instock' ? 'badge-green' : live.stockStatus === 'outofstock' ? 'badge-red' : 'badge-yellow'}`}
            >
              {live.stockStatus === 'instock'
                ? live.manageStock && live.stockQuantity != null
                  ? `En stock (${live.stockQuantity})`
                  : 'En stock'
                : live.stockStatus === 'outofstock'
                  ? 'Agotado'
                  : live.stockStatus}
            </span>
          </>
        )}
        <span className="woo-sync-links">
          {live?.permalink && live.status === 'publish' && (
            <a href={live.permalink} target="_blank" rel="noopener noreferrer" className="row-action-link">
              Web ↗
            </a>
          )}
          {wpAdminUrl && (
            <a href={wpAdminUrl} target="_blank" rel="noopener noreferrer" className="row-action-link">
              WP ↗
            </a>
          )}
        </span>
      </div>

      {fetchedAt && live && (
        <p className="woo-sync-fetched">
          Estado real leído a las {new Date(fetchedAt).toLocaleTimeString('es-ES')} ·{' '}
          <button
            type="button"
            className="woo-sync-refresh"
            onClick={() => router.refresh()}
            disabled={busy}
          >
            Releer
          </button>
        </p>
      )}

      {liveError && (
        <div className="wc-draft-error">
          No se pudo leer el estado real de la web: {liveError}
          <br />
          Las acciones de sincronización quedan desactivadas hasta poder leer el producto.{' '}
          <button
            type="button"
            className="woo-sync-refresh"
            onClick={() => router.refresh()}
            disabled={busy}
          >
            Reintentar lectura
          </button>
        </div>
      )}

      {/* ── Diff Studio ↔ Web ─────────────────────────────────────── */}
      {diff && (
        <div className="woo-diff">
          <table className="woo-diff-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Studio</th>
                <th>Web</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {diff.rows.map((row) => (
                <tr key={row.key}>
                  <td className="woo-diff-field">{row.label}</td>
                  <td>{row.studioValue}</td>
                  <td>{row.wooValue}</td>
                  <td>
                    {row.differs ? (
                      <span className="status-badge badge-orange">Distinto</span>
                    ) : (
                      <span className="status-badge badge-gray">Igual</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {diff.rows
            .filter((r) => r.note)
            .map((r) => (
              <p key={r.key} className="woo-diff-note">
                {r.note}
              </p>
            ))}
          {diff.reviewMessages.length > 0 && (
            <div className="woo-diff-review">
              <span className="woo-diff-review-title">Decision pendiente</span>
              <ul>
                {diff.reviewMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Acciones controladas ──────────────────────────────────── */}
      {live && diff && (
        <div className="woo-sync-actions">
          {diff.mirrorOutOfDate && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => run('mirror', () => refreshLocalWooMirror(itemId))}
              disabled={busy}
            >
              {runningAction === 'mirror' ? 'Actualizando…' : 'Actualizar estado local'}
            </button>
          )}

          {diff.canSyncPrice && studioPrice != null && (
            <div className="woo-action">
              {armed !== 'price' ? (
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={() => setArmed('price')}
                  disabled={busy}
                >
                  Actualizar precio en la web
                </button>
              ) : (
                <div className="woo-confirm">
                  <p className="woo-confirm-text">
                    Cambiar el precio en la web:{' '}
                    <strong>
                      {live.regularPrice != null ? `€${live.regularPrice.toFixed(2)}` : 'vacío'} →{' '}
                      €{studioPrice.toFixed(2)}
                    </strong>
                    {live.salePrice != null && (
                      <>
                        <br />
                        Ojo: hay un precio rebajado activo (€{live.salePrice.toFixed(2)}); solo se
                        cambia el precio normal.
                      </>
                    )}
                  </p>
                  <div className="woo-confirm-actions">
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() =>
                        run('price', () => syncWooPrice(itemId, live.regularPrice, studioPrice))
                      }
                      disabled={busy}
                    >
                      Confirmar cambio de precio
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setArmed(null)}
                      disabled={busy}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {diff.canSyncStockOut && (
            <div className="woo-action">
              {armed !== 'stock' ? (
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={() => setArmed('stock')}
                  disabled={busy}
                >
                  Dejar agotada en la web
                </button>
              ) : (
                <div className="woo-confirm">
                  <p className="woo-confirm-text">
                    El producto quedará <strong>agotado</strong> en la web
                    {live.manageStock ? ' (stock 0)' : ''}.{' '}
                    {live.status === 'publish'
                      ? 'Sigue publicado y visible como «Agotado» — no se despublica.'
                      : 'No se cambia su estado de publicación.'}
                  </p>
                  <div className="woo-confirm-actions">
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => run('stock', () => syncWooStockOut(itemId))}
                      disabled={busy}
                    >
                      Confirmar agotado
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setArmed(null)}
                      disabled={busy}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {diff.canSyncDescription && (
            <div className="woo-action">
              {armed !== 'description' ? (
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setArmed('description')}
                  disabled={busy}
                >
                  Actualizar descripción en la web
                </button>
              ) : (
                <div className="woo-confirm">
                  <p className="woo-confirm-text">
                    La descripción de la web se <strong>sustituye</strong> por el contenido aprobado
                    de Studio. La descripción actual de la web se pierde.
                  </p>
                  <div className="woo-confirm-actions">
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() =>
                        run('description', () =>
                          approvedSuggestionId
                            ? syncWooDescription(itemId, approvedSuggestionId, live.description)
                            : Promise.resolve({
                                ok: false as const,
                                error: 'No hay contenido aprobado en Studio.',
                              })
                        )
                      }
                      disabled={busy || !approvedSuggestionId}
                    >
                      Confirmar descripción
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setArmed(null)}
                      disabled={busy}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {diff.canTrashDraft && (
            <div className="woo-action">
              {armed !== 'trash' ? (
                <button
                  type="button"
                  className="row-action-btn row-action-btn--danger"
                  onClick={() => setArmed('trash')}
                  disabled={busy}
                >
                  Enviar borrador a papelera
                </button>
              ) : (
                <div className="woo-confirm woo-confirm--danger">
                  <p className="woo-confirm-text">
                    El borrador <strong>#{wcProductId}</strong> («{live.name}») se envía a la{' '}
                    <strong>papelera de la web</strong>. Es reversible desde WP Admin → Productos →
                    Papelera. Solo aplica a borradores: los productos publicados no se pueden enviar
                    a papelera desde Studio.
                  </p>
                  <div className="woo-confirm-actions">
                    <button
                      type="button"
                      className="row-action-btn row-action-btn--danger"
                      onClick={() => run('trash', () => trashWooDraftForItem(itemId))}
                      disabled={busy}
                    >
                      Confirmar papelera
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setArmed(null)}
                      disabled={busy}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!diff.canSyncPrice &&
            !diff.canSyncStockOut &&
            !diff.canSyncDescription &&
            !diff.canTrashDraft &&
            !diff.mirrorOutOfDate &&
            !diff.hasDifferences && (
              <p className="woo-sync-clean">Studio y la web están alineados. Nada que sincronizar.</p>
            )}
          {!diff.canSyncPrice &&
            !diff.canSyncStockOut &&
            !diff.canSyncDescription &&
            !diff.canTrashDraft &&
            diff.hasDifferences && (
              <p className="woo-sync-review">
                Hay diferencias sin accion automatica segura. Revisa la decision arriba antes de dar
                la ficha por alineada.
              </p>
            )}
        </div>
      )}

      {busy && (
        <div className="wc-draft-progress">
          <span className="wc-draft-spinner" aria-hidden="true" />
          <span>Sincronizando con la web…</span>
        </div>
      )}

      {!busy && result && (
        <div className={result.ok ? 'wc-draft-ok' : 'wc-draft-error'}>{result.text}</div>
      )}

      {/* ── Registro ──────────────────────────────────────────────── */}
      {log.length > 0 && (
        <div className="woo-sync-log">
          <span className="woo-sync-log-title">Registro de sincronización</span>
          <ul className="woo-sync-log-list">
            {log.map((entry) => (
              <li key={entry.id} className="woo-sync-log-item">
                <span className="woo-sync-log-date">
                  {new Date(entry.created_at).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span
                  className={`woo-sync-log-label${entry.event_type === 'wc_sync_error' ? ' woo-sync-log-label--error' : ''}`}
                >
                  {LOG_LABELS[entry.event_type] ?? entry.event_type}
                </span>
                {entry.notes && <span className="woo-sync-log-notes">{entry.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="sale-hint woo-sync-footer">
        Cada acción toca un solo producto, pide confirmación y queda registrada. Studio nunca
        publica, despublica ni borra definitivamente.
      </p>
    </section>
  )
}
