'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createWcDraft } from '@/app/inventory/[id]/wc-actions'

export function WcDraftPanel({
  itemId,
  wcProductId,
  wcStatus,
  wcError,
  precioPubWeb,
}: {
  itemId: string
  wcProductId: number | null
  wcStatus: string
  wcError: string | null
  precioPubWeb: number | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<
    { ok: true; wcProductId: number } | { ok: false; error: string } | null
  >(null)

  function handleCreate() {
    setResult(null)
    startTransition(async () => {
      const res = await createWcDraft(itemId)
      if (res.ok) {
        setResult({ ok: true, wcProductId: res.wcProductId })
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
          {!precioPubWeb && (
            <div className="wc-draft-warning">
              Falta el precio web (<code>precio_publicado_web</code>). Edita el item para añadirlo antes de crear el borrador.
            </div>
          )}

          {wcStatus === 'error_sync' && wcError && !result && (
            <div className="wc-draft-error">Último intento falló: {wcError}</div>
          )}

          {result && !result.ok && (
            <div className="wc-draft-error">{result.error}</div>
          )}

          {result && result.ok && (
            <div className="wc-draft-ok">
              Borrador creado en WooCommerce: ID {result.wcProductId}
            </div>
          )}

          <div className="wc-draft-actions">
            <button
              className="btn-primary btn-sm"
              onClick={handleCreate}
              disabled={isPending}
              type="button"
            >
              {isPending ? 'Creando borrador…' : 'Crear borrador en WooCommerce'}
            </button>
          </div>

          <p className="wc-draft-hint">
            Crea un borrador (no publicado) en WooCommerce.
            Las imágenes se añaden manualmente desde WP Admin.
            Pablo es el único que puede publicar.
          </p>
        </div>
      )}
    </section>
  )
}
