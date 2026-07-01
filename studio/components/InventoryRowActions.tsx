'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { archiveItem, restoreItem } from '@/app/inventory/lifecycle-actions'

// Per-row actions for the inventory work queue. Links are always visible; external
// Woo links appear only when the item has a wc_product_id and the site base is known.
// Archive/restore are local Supabase writes (no Woo, reversible).
export function InventoryRowActions({
  itemId,
  referencia,
  wcProductId,
  wpSiteBase,
  archived,
}: {
  itemId: string
  referencia: string
  wcProductId: number | null
  wpSiteBase: string | null
  archived: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const canLinkWoo = wcProductId != null && !!wpSiteBase
  // WordPress resolves /?p=<id> to the product permalink; avoids storing the slug in Studio.
  const frontendUrl = canLinkWoo ? `${wpSiteBase}/?p=${wcProductId}` : null
  const adminUrl = canLinkWoo
    ? `${wpSiteBase}/wp-admin/post.php?post=${wcProductId}&action=edit`
    : null

  function handleArchive() {
    if (
      !window.confirm(
        `¿Archivar «${referencia}»?\n\nEs un archivo local: no borra ni modifica nada en Woo y se puede restaurar.`
      )
    ) {
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await archiveItem(itemId)
      if (res.ok) router.refresh()
      else setError(res.error)
    })
  }

  function handleRestore() {
    setError(null)
    startTransition(async () => {
      const res = await restoreItem(itemId)
      if (res.ok) router.refresh()
      else setError(res.error)
    })
  }

  return (
    <div className="row-actions">
      <Link href={`/inventory/${itemId}`} className="row-action-link" title="Ver ficha en Studio">
        Ficha
      </Link>
      <Link
        href={`/inventory/${itemId}/edit`}
        className="row-action-link"
        title="Editar en Studio"
      >
        Editar
      </Link>
      {frontendUrl && (
        <a
          href={frontendUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="row-action-link"
          title="Ver producto en la web"
        >
          Web ↗
        </a>
      )}
      {adminUrl && (
        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="row-action-link"
          title="Abrir producto en WP Admin"
        >
          WP ↗
        </a>
      )}
      {archived ? (
        <button
          type="button"
          className="row-action-btn"
          onClick={handleRestore}
          disabled={isPending}
        >
          {isPending ? '…' : 'Restaurar'}
        </button>
      ) : (
        <button
          type="button"
          className="row-action-btn row-action-btn--danger"
          onClick={handleArchive}
          disabled={isPending}
        >
          {isPending ? '…' : 'Archivar'}
        </button>
      )}
      {error && <span className="row-action-error">{error}</span>}
    </div>
  )
}
