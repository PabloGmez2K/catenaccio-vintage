'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  uploadItemImages,
  setPrimaryImage,
  moveImage,
  deleteItemImage,
} from '@/app/inventory/image-actions'
import type { MediaAsset } from '@/lib/types'

// S026A — image pipeline panel for the item detail page. Supabase Storage +
// media_assets metadata only. NO WordPress, NO WooCommerce, NO publish.
export function ItemImagesPanel({
  itemId,
  images,
}: {
  itemId: string
  images: MediaAsset[]
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setError(null)

    const formData = new FormData()
    for (const file of Array.from(files)) formData.append('files', file)

    startTransition(async () => {
      const result = await uploadItemImages(itemId, formData)
      if (result.ok) {
        router.refresh()
      } else {
        setError(result.error)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    })
  }

  function handleSetPrimary(imageId: string) {
    setError(null)
    startTransition(async () => {
      const result = await setPrimaryImage(itemId, imageId)
      if (result.ok) router.refresh()
      else setError(result.error)
    })
  }

  function handleMove(imageId: string, direction: 'up' | 'down') {
    setError(null)
    startTransition(async () => {
      const result = await moveImage(itemId, imageId, direction)
      if (result.ok) router.refresh()
      else setError(result.error)
    })
  }

  function handleDelete(imageId: string, filename: string) {
    if (!window.confirm(`¿Eliminar "${filename}"?\n\nSe borra del Storage y de Studio. No afecta a Woo/WordPress.`)) {
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await deleteItemImage(itemId, imageId)
      if (result.ok) router.refresh()
      else setError(result.error)
    })
  }

  return (
    <section className="detail-section images-section">
      <h3>Fotos {images.length > 0 && <span className="images-count">({images.length})</span>}</h3>

      <div className="images-upload-row">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isPending}
          onChange={handleUpload}
          id={`images-upload-${itemId}`}
          className="images-upload-input"
        />
        <label htmlFor={`images-upload-${itemId}`} className="btn-secondary btn-sm">
          {isPending ? 'Subiendo…' : 'Subir fotos'}
        </label>
        <span className="images-upload-hint">JPG, PNG o WEBP · máx. 12 MB por foto</span>
      </div>

      {error && <p className="images-error">{error}</p>}

      {images.length === 0 ? (
        <p className="images-empty">Sin fotos todavía. Sube al menos una para completar la ficha.</p>
      ) : (
        <div className="images-grid">
          {images.map((img, index) => (
            <div key={img.id} className="image-card">
              {img.public_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.public_url} alt={img.filename} className="image-thumb" />
              )}
              {img.is_primary && <span className="image-primary-badge">Principal</span>}
              <div className="image-card-actions">
                <button
                  type="button"
                  className="row-action-btn"
                  disabled={isPending || index === 0}
                  onClick={() => handleMove(img.id, 'up')}
                  title="Mover arriba"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="row-action-btn"
                  disabled={isPending || index === images.length - 1}
                  onClick={() => handleMove(img.id, 'down')}
                  title="Mover abajo"
                >
                  ↓
                </button>
                {!img.is_primary && (
                  <button
                    type="button"
                    className="row-action-btn"
                    disabled={isPending}
                    onClick={() => handleSetPrimary(img.id)}
                  >
                    Marcar principal
                  </button>
                )}
                <button
                  type="button"
                  className="row-action-btn row-action-btn--danger"
                  disabled={isPending}
                  onClick={() => handleDelete(img.id, img.filename)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
