'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import {
  registerUploadedItemImage,
  setPrimaryImage,
  moveImage,
  deleteItemImage,
} from '@/app/inventory/image-actions'
import { IMAGE_STORAGE_BUCKET, IMAGE_MAX_SIZE_BYTES, IMAGE_ALLOWED_MIME } from '@/lib/media/image-upload'
import type { MediaAsset } from '@/lib/types'

// S026A — image pipeline panel for the item detail page. Supabase Storage +
// media_assets metadata only. NO WordPress, NO WooCommerce, NO publish.
//
// S026A_FIX: files upload directly from the browser to Supabase Storage (not
// through a Server Action — those have a 1 MB request body limit and are the
// wrong transport for images). Only small JSON metadata is sent server-side,
// via registerUploadedItemImage, to persist the media_assets row.
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
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  function uploadFiles(files: File[]) {
    if (files.length === 0) return
    setError(null)

    for (const file of files) {
      if (!IMAGE_ALLOWED_MIME[file.type]) {
        setError(`Tipo no permitido: ${file.type || file.name}. Solo JPG/PNG/WEBP.`)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      if (file.size > IMAGE_MAX_SIZE_BYTES) {
        setError(`"${file.name}" supera el tamaño máximo (12 MB).`)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
    }

    startTransition(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('No autenticado.')
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // Sequential on purpose: each registerUploadedItemImage call computes
      // sort_order/is_primary from current DB state, so concurrent calls could race.
      for (const file of files) {
        const ext = IMAGE_ALLOWED_MIME[file.type]
        const path = `${user.id}/${itemId}/${crypto.randomUUID()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from(IMAGE_STORAGE_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false })
        if (uploadError) {
          setError(`Error al subir "${file.name}": ${uploadError.message}`)
          break
        }

        const { data: publicUrlData } = supabase.storage.from(IMAGE_STORAGE_BUCKET).getPublicUrl(path)

        const result = await registerUploadedItemImage(itemId, {
          storagePath: path,
          publicUrl: publicUrlData.publicUrl,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        })
        if (!result.ok) {
          // Best-effort cleanup so a failed metadata write doesn't leave an orphaned Storage object.
          await supabase.storage.from(IMAGE_STORAGE_BUCKET).remove([path])
          setError(result.error)
          break
        }
      }

      router.refresh()
      if (fileInputRef.current) fileInputRef.current.value = ''
    })
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return
    uploadFiles(Array.from(fileList))
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDraggingOver(false)
    if (isPending) return
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    uploadFiles(files)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!isPending) setIsDraggingOver(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDraggingOver(false)
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

      <div
        className={`images-dropzone${isDraggingOver ? ' images-dropzone--active' : ''}${isPending ? ' images-dropzone--disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
        <label htmlFor={`images-upload-${itemId}`} className="images-dropzone-label">
          <span className="btn-secondary btn-sm">{isPending ? 'Subiendo…' : 'Subir fotos'}</span>
          <span className="images-upload-hint">
            Arrastra fotos aquí o haz clic para seleccionar · JPG, PNG o WEBP · máx. 12 MB por foto
          </span>
        </label>
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
