'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createWcDraft } from '@/app/inventory/[id]/wc-actions'
import type { PreflightStatus } from '@/lib/preflight/product-preflight'

export function WcDraftPanel({
  itemId,
  wcProductId,
  wcStatus,
  wcError,
  precioPubWeb,
  preflightStatus,
  blockerMessages,
  imageCount,
  attachImagesEnabled,
}: {
  itemId: string
  wcProductId: number | null
  wcStatus: string
  wcError: string | null
  precioPubWeb: number | null
  preflightStatus: PreflightStatus
  blockerMessages: string[]
  imageCount: number
  attachImagesEnabled: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<
    | { ok: true; wcProductId: number; imagesAttached?: { attached: number; total: number } }
    | { ok: false; error: string }
    | null
  >(null)

  const isBlocked = preflightStatus === 'BLOCKED_MISSING_REQUIRED_FIELDS'
  const isWarning = preflightStatus === 'WARNING_REVIEW_RECOMMENDED'

  function handleCreate() {
    setResult(null)
    startTransition(async () => {
      const res = await createWcDraft(itemId)
      if (res.ok) {
        setResult({ ok: true, wcProductId: res.wcProductId, imagesAttached: res.imagesAttached })
        router.refresh()
      } else {
        setResult({ ok: false, error: res.error })
      }
    })
  }

  return (
    <section className="detail-section wc-draft-section">
      <h3>Borrador WooCommerce</h3>

      {/* ── Already drafted ───────────────────────────────────── */}
      {wcProductId != null && (
        <div className="wc-draft-success">
          <span className="wc-draft-badge wc-draft-badge--ok">Borrador creado en WooCommerce</span>
          <p className="wc-draft-info">
            ID: <strong>{wcProductId}</strong>
          </p>
          <p className="wc-draft-hint">
            Revisa y publica desde{' '}
            <strong>WP Admin → Productos → Borradores</strong>.
            El puente no publica: solo Pablo puede publicar.
          </p>
          {wcStatus === 'error_sync' && wcError && (
            <div className="wc-draft-error">Último error: {wcError}</div>
          )}
        </div>
      )}

      {/* ── Not yet drafted ───────────────────────────────────── */}
      {wcProductId == null && (
        <div className="wc-draft-pending">
          {/* S024 — preflight-gated: blockers disable the button, warnings only caution. */}
          {isBlocked && (
            <div className="wc-draft-warning">
              <strong>No se puede crear el borrador todavía.</strong> Completa estos bloqueos:
              <ul className="wc-draft-blocker-list">
                {blockerMessages.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {isWarning && (
            <div className="wc-draft-warning">
              La preflight tiene avisos. Puedes crear el borrador, pero revisa la sección
              «Preflight de completitud» de arriba antes de continuar.
            </div>
          )}

          {!isBlocked && !precioPubWeb && (
            <div className="wc-draft-warning">
              Falta el precio web (<code>precio_publicado_web</code>). Edita el item para añadirlo antes de crear el borrador.
            </div>
          )}

          {/* S026B — Studio images / attach status, shadow-first */}
          {!result && (
            <p className="wc-draft-hint">
              {imageCount === 0
                ? 'Sin imágenes en Studio todavía.'
                : attachImagesEnabled
                  ? `${imageCount} imagen(es) lista(s) en Studio — se adjuntarán al crear el borrador.`
                  : `${imageCount} imagen(es) lista(s) en Studio — adjuntar imágenes está desactivado (shadow, STUDIO_WC_ATTACH_IMAGES_ENABLED).`}
            </p>
          )}

          {wcStatus === 'error_sync' && wcError && !result && !isPending && (
            <div className="wc-draft-error">Último intento falló: {wcError}</div>
          )}

          {/* S026B_UX — visible progress while the create+attach round trip is in flight,
              so a request that takes a few seconds doesn't read as Studio being stuck. */}
          {isPending && (
            <div className="wc-draft-progress">
              <span className="wc-draft-spinner" aria-hidden="true" />
              <span>
                Creando borrador en Woo…
                <br />
                Adjuntando imágenes, puede tardar unos segundos.
              </span>
            </div>
          )}

          {!isPending && result && !result.ok && (
            <div className="wc-draft-error">{result.error}</div>
          )}

          {!isPending && result && result.ok && (
            <div className="wc-draft-ok">
              Borrador creado ✓ (ID {result.wcProductId})
              {result.imagesAttached && (
                <div>
                  {result.imagesAttached.attached === result.imagesAttached.total
                    ? `Imágenes adjuntadas: ${result.imagesAttached.attached}/${result.imagesAttached.total}`
                    : `Aviso: solo se pudieron mapear ${result.imagesAttached.attached}/${result.imagesAttached.total} imágenes (el borrador se creó igualmente).`}
                </div>
              )}
            </div>
          )}

          <div className="wc-draft-actions">
            <button
              className="btn-primary btn-sm"
              onClick={handleCreate}
              disabled={isPending || isBlocked}
              type="button"
            >
              {isPending ? 'Creando borrador…' : 'Crear borrador en WooCommerce'}
            </button>
          </div>

          <p className="wc-draft-hint">
            Crea un borrador no publicado en WooCommerce.{' '}
            {attachImagesEnabled
              ? 'Las imágenes de Studio se adjuntarán automáticamente.'
              : 'El adjuntado automático de imágenes está desactivado; podrás añadirlas manualmente desde WP Admin.'}{' '}
            Pablo es el único que puede publicar.
          </p>
        </div>
      )}
    </section>
  )
}
