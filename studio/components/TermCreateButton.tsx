'use client'

import { useState, useTransition } from 'react'
import { createTermAction } from '@/app/inventory/term-actions'

type ControlledTaxonomySlug = 'pa_liga' | 'pa_equipo' | 'pa_ano'

// Explicit, single-purpose action: creates (or detects) one WC term for the
// label currently typed in the field above it. Never fires on its own —
// only on click. Independent of saving the item.
export function TermCreateButton({
  taxonomySlug,
  label,
}: {
  taxonomySlug: ControlledTaxonomySlug
  label: string
}) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<
    | { ok: true; created: boolean; termId: string }
    | { ok: false; error: string }
    | null
  >(null)

  function handleClick() {
    setResult(null)
    startTransition(async () => {
      const res = await createTermAction(taxonomySlug, label)
      setResult(
        res.ok
          ? { ok: true, created: res.created, termId: res.termId }
          : { ok: false, error: res.error }
      )
    })
  }

  return (
    <div className="term-create-action">
      <button
        type="button"
        className="btn-secondary btn-sm"
        onClick={handleClick}
        disabled={isPending || !label.trim()}
      >
        {isPending ? 'Creando…' : 'Crear término en Woo'}
      </button>
      {result && result.ok && (
        <span className="term-create-result">
          {result.created
            ? `Creado en WooCommerce — ID ${result.termId}`
            : `Ya existía en WooCommerce — ID ${result.termId}`}
        </span>
      )}
      {result && !result.ok && <span className="term-create-error">{result.error}</span>}
    </div>
  )
}
