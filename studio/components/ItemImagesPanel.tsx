'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { registerUploadedItemImage, reorderItemImages, deleteItemImage, type ImageActionResult } from '@/app/inventory/image-actions'
import {
  IMAGE_STORAGE_BUCKET,
  IMAGE_MAX_SIZE_BYTES,
  validateImageFile,
  optimizeImageFile,
  getImageExtensionFromMime,
  formatBytes,
} from '@/lib/media/image-upload'
import type { MediaAsset } from '@/lib/types'

// S026A — image pipeline panel for the item detail page. Supabase Storage +
// media_assets metadata only. NO WordPress, NO WooCommerce, NO publish.
//
// S026A_FIX: files upload directly from the browser to Supabase Storage (not
// through a Server Action — those have a 1 MB request body limit and are the
// wrong transport for images). Only small JSON metadata is sent server-side,
// via registerUploadedItemImage, to persist the media_assets row.
//
// S026A_UX: every mutation (upload, reorder, delete) autosaves immediately —
// there is no separate "save" button — so this panel always shows what phase
// it's in (optimizing/uploading/saving/saved/error). The primary photo is not
// a separate toggle: it is always whichever image sits first in the order,
// so "mark as primary" was removed in favor of drag-to-reorder (+ ↑/↓ fallback).
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
  const [statusDetail, setStatusDetail] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isDraggingFilesOver, setIsDraggingFilesOver] = useState(false)
  const [dragCardIndex, setDragCardIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function clearStatusSoon() {
    window.setTimeout(() => setStatusDetail(null), 2500)
  }

  // Shared runner for reorder/delete: identical autosave feedback for both.
  function runMutation(action: () => Promise<ImageActionResult>, savingMessage: string, savedMessage: string) {
    setError(null)
    setStatusDetail(savingMessage)
    startTransition(async () => {
      const result = await action()
      if (result.ok) {
        setStatusDetail(savedMessage)
        router.refresh()
        clearStatusSoon()
      } else {
        setError(result.error)
        setStatusDetail(null)
      }
    })
  }

  function uploadFiles(files: File[]) {
    if (files.length === 0) return
    setError(null)

    for (const file of files) {
      const check = validateImageFile(file)
      if (!check.ok) {
        setError(check.error)
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
        setStatusDetail(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      let encounteredError = false

      // Sequential on purpose: each registerUploadedItemImage call computes
      // sort_order/is_primary from current DB state, so concurrent calls could race.
      for (let i = 0; i < files.length; i++) {
        const original = files[i]
        const label = files.length > 1 ? ` (${i + 1}/${files.length})` : ''

        setStatusDetail(`Optimizando foto${label}…`)
        const optimized = await optimizeImageFile(original)

        if (optimized.optimizedSize > IMAGE_MAX_SIZE_BYTES) {
          setError(`"${original.name}" sigue superando el máximo (12 MB) incluso tras optimizar.`)
          encounteredError = true
          break
        }

        const ext = getImageExtensionFromMime(optimized.finalMime)
        const path = `${user.id}/${itemId}/${crypto.randomUUID()}.${ext}`

        setStatusDetail(`Subiendo foto${label}…`)
        const { error: uploadError } = await supabase.storage
          .from(IMAGE_STORAGE_BUCKET)
          .upload(path, optimized.file, { contentType: optimized.finalMime, upsert: false })
        if (uploadError) {
          setError(`Error al subir "${original.name}": ${uploadError.message}`)
          encounteredError = true
          break
        }

        const { data: publicUrlData } = supabase.storage.from(IMAGE_STORAGE_BUCKET).getPublicUrl(path)

        setStatusDetail(`Guardando foto${label}…`)
        const result = await registerUploadedItemImage(itemId, {
          storagePath: path,
          publicUrl: publicUrlData.publicUrl,
          filename: original.name,
          mimeType: optimized.finalMime,
          sizeBytes: optimized.optimizedSize,
        })
        if (!result.ok) {
          // Best-effort cleanup so a failed metadata write doesn't leave an orphaned Storage object.
          await supabase.storage.from(IMAGE_STORAGE_BUCKET).remove([path])
          setError(result.error)
          encounteredError = true
          break
        }

        if (optimized.wasOptimized) {
          setStatusDetail(`Optimizada: ${formatBytes(optimized.originalSize)} → ${formatBytes(optimized.optimizedSize)}`)
        }
      }

      if (!encounteredError) {
        setStatusDetail(files.length > 1 ? 'Fotos guardadas ✓' : 'Foto guardada ✓')
        clearStatusSoon()
      } else {
        setStatusDetail(null)
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

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDraggingFilesOver(false)
    if (isPending) return
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    uploadFiles(files)
  }

  function handleFileDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!isPending) setIsDraggingFilesOver(true)
  }

  function handleFileDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDraggingFilesOver(false)
  }

  function handleReorder(newOrder: string[]) {
    runMutation(() => reorderItemImages(itemId, newOrder), 'Guardando orden…', 'Orden guardado ✓')
  }

  function handleMove(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= images.length) return
    const ids = images.map((img) => img.id)
    ;[ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]]
    handleReorder(ids)
  }

  function handleCardDragStart(e: React.DragEvent<HTMLDivElement>, index: number) {
    if (isPending) return
    setDragCardIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Firefox requires setData for the drag to actually start.
    e.dataTransfer.setData('text/plain', images[index].id)
  }

  function handleCardDragOver(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault()
    if (dragCardIndex === null || isPending) return
    if (dragOverIndex !== index) setDragOverIndex(index)
  }

  function handleCardDrop(e: React.DragEvent<HTMLDivElement>, targetIndex: number) {
    e.preventDefault()
    const sourceIndex = dragCardIndex
    setDragCardIndex(null)
    setDragOverIndex(null)
    if (sourceIndex === null || sourceIndex === targetIndex || isPending) return

    const ids = images.map((img) => img.id)
    const [movedId] = ids.splice(sourceIndex, 1)
    ids.splice(targetIndex, 0, movedId)
    handleReorder(ids)
  }

  function handleCardDragEnd() {
    setDragCardIndex(null)
    setDragOverIndex(null)
  }

  function handleDelete(imageId: string, filename: string) {
    if (!window.confirm(`¿Eliminar "${filename}"?\n\nSe borra del Storage y de Studio. No afecta a Woo/WordPress.`)) {
      return
    }
    runMutation(() => deleteItemImage(itemId, imageId), 'Eliminando foto…', 'Foto eliminada ✓')
  }

  return (
    <section className="detail-section images-section">
      <h3>Fotos {images.length > 0 && <span className="images-count">({images.length})</span>}</h3>

      <p className="images-autosave-hint">
        Las fotos se guardan automáticamente al subir, ordenar o eliminar. Arrastra las tarjetas para
        ordenar — la primera foto es siempre la principal.
      </p>

      <div
        className={`images-dropzone${isDraggingFilesOver ? ' images-dropzone--active' : ''}${isPending ? ' images-dropzone--disabled' : ''}`}
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
        onDrop={handleFileDrop}
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
          <span className="btn-secondary btn-sm">{isPending ? 'Procesando…' : 'Subir fotos'}</span>
          <span className="images-upload-hint">
            Arrastra fotos aquí o haz clic para seleccionar · JPG, PNG o WEBP · se optimizan a WebP automáticamente
          </span>
        </label>
      </div>

      {(statusDetail || error) && (
        <p className={`images-status ${error ? 'images-status--error' : 'images-status--progress'}`}>
          {error ?? statusDetail}
        </p>
      )}

      {images.length === 0 ? (
        <p className="images-empty">Sin fotos todavía. Sube al menos una para completar la ficha.</p>
      ) : (
        <div className="images-grid">
          {images.map((img, index) => (
            <div
              key={img.id}
              className={`image-card${dragCardIndex === index ? ' image-card--dragging' : ''}${dragOverIndex === index && dragCardIndex !== index ? ' image-card--drop-target' : ''}`}
              draggable={!isPending}
              onDragStart={(e) => handleCardDragStart(e, index)}
              onDragOver={(e) => handleCardDragOver(e, index)}
              onDrop={(e) => handleCardDrop(e, index)}
              onDragEnd={handleCardDragEnd}
            >
              {img.public_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.public_url} alt={img.filename} className="image-thumb" />
              )}
              {index === 0 && <span className="image-primary-badge">Principal</span>}
              <div className="image-card-actions">
                <button
                  type="button"
                  className="row-action-btn"
                  disabled={isPending || index === 0}
                  onClick={() => handleMove(index, 'up')}
                  title="Mover arriba"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="row-action-btn"
                  disabled={isPending || index === images.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  title="Mover abajo"
                >
                  ↓
                </button>
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
