'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  linkWooProductToStudio,
  type WooAuditResult,
} from '@/app/inventory/woo/audit-actions'

// Per-row controlled action for the web audit screen: link a web product to a
// new Studio ficha (Supabase-only write, one product per action, inline
// confirmation, visible result). The web is NEVER written from this screen —
// every Woo write must land in an item's audit trail, so trash lives on the
// ficha. For an unlinked draft: link it here first, then trash from the ficha.

export function WooAuditRowActions({
  productId,
  productName,
  productStatus,
  productStock,
  productPrice,
  hasWebImage,
  importHints,
  linkedItemId,
}: {
  productId: number
  productName: string
  productStatus: string
  productStock: string
  productPrice: number | null
  hasWebImage: boolean
  importHints: string[]
  linkedItemId: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [armed, setArmed] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string; itemId?: string } | null>(null)

  function run(fn: () => Promise<WooAuditResult>) {
    setArmed(false)
    setResult(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        setResult({ ok: true, text: res.message, itemId: res.itemId })
        router.refresh()
      } else {
        setResult({ ok: false, text: res.error })
      }
    })
  }

  const isDraft = productStatus === 'draft' || productStatus === 'pending'
  const isTrash = productStatus === 'trash'

  return (
    <div className="woo-audit-actions">
      {linkedItemId == null && !isTrash && !armed && !isPending && (
        <button type="button" className="row-action-btn" onClick={() => setArmed(true)}>
          Vincular a Studio
        </button>
      )}

      {armed && (
        <div className="woo-confirm">
          <p className="woo-confirm-text">
            Se crea una ficha en el inventario de Studio vinculada a «{productName}» (producto
            #{productId}). La web <strong>no se modifica</strong>. Coste y detalles quedan
            pendientes de completar.
            <br />
            Importa: titulo, precio web, estado, stock, enlace Woo y{' '}
            {hasWebImage ? 'referencia a imagen web' : 'sin imagen web'}. Vista previa:{' '}
            {productStatus} Â· {productStock} Â·{' '}
            {productPrice != null ? `EUR ${productPrice.toFixed(2)}` : 'precio no disponible'}
            {importHints.length > 0 && <> Â· {importHints.join(' Â· ')}</>}
            {isDraft && (
              <>
                {' '}
                Una vez vinculado, podrás enviar este borrador a la papelera desde su ficha, con
                registro.
              </>
            )}
          </p>
          <div className="woo-confirm-actions">
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => run(() => linkWooProductToStudio(productId))}
              disabled={isPending}
            >
              Confirmar vincular
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setArmed(false)}
              disabled={isPending}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isPending && <span className="woo-audit-pending">Trabajando…</span>}

      {!isPending && result && (
        <span className={result.ok ? 'woo-audit-ok' : 'woo-audit-error'}>
          {result.text}{' '}
          {result.ok && result.itemId && (
            <Link href={`/inventory/${result.itemId}`} className="row-action-link">
              Abrir ficha
            </Link>
          )}
        </span>
      )}
    </div>
  )
}
