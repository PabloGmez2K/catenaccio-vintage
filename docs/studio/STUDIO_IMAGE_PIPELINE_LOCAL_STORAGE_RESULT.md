# STUDIO_IMAGE_PIPELINE_LOCAL_STORAGE_RESULT — S026A

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-07-01
**Sesión:** S026A — IMAGE_PIPELINE_LOCAL_TO_STORAGE (Claude Code Sonnet 5)
**Modo:** ASK→CODE / LOCAL_CODE / SUPABASE_STORAGE / NO_WP_WRITE / NO_WOO_WRITE / NO_PRODUCT_WRITE / NO_PUBLISH / NO_DEPLOY
**Veredicto:** `APPROVE_READY_FOR_S026B` (validación manual de Pablo — `PABLO_IMAGE_STORAGE_FINAL_OK`)
**Hermanos:** `STUDIO_MVP_BACKLOG_REVIEW.md`, `STUDIO_DATA_MODEL.md`, `STUDIO_COMPLETENESS_PREFLIGHT_RESULT.md`

---

## 1. Hallazgo clave del ASK

La tabla de imágenes **ya existía**: `media_assets` (diseñada en `STUDIO_DATA_MODEL.md` / S019,
aplicada en Supabase en S020D junto con las otras 5 tablas MVP), con RLS owner-based
(`pol_media_assets_owner`) ya activa. Nunca se usó desde código (0 referencias en `studio/`). Se
reutiliza en vez de crear `inventory_item_images` desde cero — evita una tabla duplicada.

Ya existía también el cliente Supabase de browser (`studio/lib/supabase/browser.ts`). En la entrega
inicial no se usó (las subidas iban por Server Action); tras el fix de §3b **sí se usa** — es el
transporte real de los archivos.

## 2. SQL requerido

`docs/studio/STUDIO_IMAGE_PIPELINE_SCHEMA.sql` (aditivo, no aplicado por el agente):
- `ADD COLUMN IF NOT EXISTS mime_type TEXT`
- `ADD COLUMN IF NOT EXISTS size_bytes BIGINT`
- `ALTER COLUMN storage_bucket SET DEFAULT 'studio-product-images'`
- `CREATE UNIQUE INDEX IF NOT EXISTS idx_media_assets_storage_path ...`

Sin `DROP`, sin `DELETE`, sin tocar otras tablas, sin policies nuevas (la RLS existente ya cubre
`FOR ALL USING (auth.uid() = owner_id)`).

## 3. Cambios de código

- `studio/lib/types.ts`: nuevo `MediaAsset` + `MediaUploadStatus`.
- `studio/app/inventory/image-actions.ts` (nuevo): Server Actions `registerUploadedItemImage`
  (metadata-only, ver §3b), `setPrimaryImage`, `moveImage`, `deleteItemImage` + helper de lectura
  `listItemImages`. Path `<auth_user_id>/<inventory_item_id>/<uuid>.<ext>`; `original_filename` se
  guarda en `filename`. Al eliminar la foto principal, promueve automáticamente la siguiente por
  `sort_order`. **`setPrimaryImage`/`moveImage` fueron sustituidas por `reorderItemImages` en §3c.**
- `studio/components/ItemImagesPanel.tsx` (nuevo): panel client — subida múltiple, grid de
  miniaturas, badge "Principal", mover arriba/abajo, marcar principal, eliminar, contador, estado
  vacío, mensajes de error. **Rediseñado en §3c** (autosave, drag-reorder, sin botón "Marcar
  principal").
- `studio/app/inventory/[id]/page.tsx`: carga `listItemImages`, renderiza `ItemImagesPanel`, pasa
  `imageCount` al preflight.
- `studio/lib/preflight/product-preflight.ts`: nuevo grupo `imagenes` — **WARNING** (no blocker) si
  0 fotos, **pass** si ≥1. Decisión explícita de Pablo: no bloquear la creación del borrador Woo
  todavía, porque S026B (adjuntar a Woo) no existe aún.
- `studio/styles/globals.css`: estilos `.images-*` / `.image-card*` (grid de miniaturas, badge,
  acciones), reutilizando `.row-action-btn`/`.btn-secondary` ya existentes.

`bridge.ts`, `actions.ts` (creación/edición de item), `ItemForm.tsx` y `createWcDraftForItem` **no
se tocaron**.

## 3b. FIX post-entrega — "Body exceeded 1 MB limit" (Server Actions)

**Síntoma:** al subir 2+ imágenes desde `/inventory/[id]`, Next.js devolvía `Body exceeded 1 MB
limit` (límite por defecto de payload de Server Actions).

**Causa:** la entrega inicial transportaba los `File` completos dentro de un `FormData` hacia la
Server Action `uploadItemImages`, que subía a Storage server-side. Server Actions no están pensadas
para transportar archivos binarios grandes — tienen un límite de payload (1 MB por defecto,
configurable vía `serverActions.bodySizeLimit`, pero subir el límite no ataca la causa raíz y sigue
sin escalar bien).

**Fix:** el archivo ahora sube **directamente desde el navegador a Supabase Storage**, usando el
cliente de browser ya existente (`studio/lib/supabase/browser.ts`) — sin pasar por ninguna Server
Action. Solo se envía al servidor un JSON pequeño con la metadata (path, URL pública, filename,
mime, tamaño) a la nueva Server Action `registerUploadedItemImage`, que:
1. autentica al usuario y reverifica `owner_id` del item (igual que antes);
2. valida en profundidad que el `storage_path` recibido empieza por `<user.id>/<itemId>/` (defensa
   extra — el cliente ya no es la única capa que decide el path);
3. revalida MIME/tamaño server-side (el cliente ya valida antes de subir, pero no se confía
   ciegamente en el input);
4. calcula `sort_order`/`is_primary` e inserta la fila en `media_assets`.

Las subidas se procesan **secuencialmente** en el cliente (no en paralelo) porque cada llamada a
`registerUploadedItemImage` calcula `sort_order`/`is_primary` a partir del estado actual de la
tabla — llamadas concurrentes podrían generar condiciones de carrera.

Nuevo módulo compartido `studio/lib/media/image-upload.ts` (bucket, tamaño máximo, MIME permitidos)
para que cliente y Server Action no diverjan.

`setPrimaryImage`/`moveImage`/`deleteItemImage` no se tocaron — nunca transportaron archivos, solo
operan sobre filas ya existentes en `media_assets`.

No se subió `serverActions.bodySizeLimit` en `next.config.ts` — la solución correcta es no enviar
el archivo por la Server Action, no ensanchar el límite.

## 3c. UX + optimización post-retest (autosave, principal=primera, drag-reorder, WebP)

Tras el fix de §3b, Pablo probó S026A y detectó 4 problemas de UX/producto antes de poder validarla:

1. **Autosave no comunicado.** No hay botón "Guardar" porque cada acción (subir/ordenar/eliminar)
   ya escribe en Supabase al instante, pero la UI no lo decía ni mostraba progreso.
   **Fix:** texto fijo "Las fotos se guardan automáticamente al subir, ordenar o eliminar" +
   línea de estado dinámica (`Optimizando…` → `Subiendo…` → `Guardando…` → `Guardado ✓` / error),
   compartida entre subida, reordenar y eliminar vía un runner común (`runMutation`).
2. **"Marcar principal" no gustaba — principal debe ser la primera imagen del orden.**
   **Fix:** eliminado el botón y el badge ahora se muestra solo en `index === 0` (posicional, no
   depende de un campo independiente que pudiera desincronizarse). Servidor: `setPrimaryImage` y
   `moveImage` (basado en swap de `sort_order`) se sustituyeron por una única acción
   `reorderItemImages(itemId, orderedImageIds)` que es la única responsable de la invariante
   "principal = primera": recorre el array recibido y escribe `sort_order=index`,
   `is_primary=(index===0)` para cada imagen, tras verificar que el conjunto de IDs recibido
   coincide exactamente con las imágenes reales del item/owner (nunca confía en el orden del
   cliente sin comprobar pertenencia). Los botones ↑/↓ se mantienen como *fallback* (accesibilidad
   / sin drag), pero ahora construyen el nuevo orden y llaman a la misma `reorderItemImages` — ya
   no hay una ruta de código distinta para "mover" vs. "arrastrar".
3. **Orden por arrastre de tarjetas.** Añadido drag-and-drop nativo (HTML5 DnD, sin librería) sobre
   las tarjetas de `images-grid`: `draggable` + `onDragStart/onDragOver/onDrop/onDragEnd`, estado
   local `dragCardIndex`/`dragOverIndex` solo para feedback visual (opacidad de la tarjeta arrastrada,
   borde de la tarjeta destino). Al soltar, se recalcula el array de IDs y se llama a
   `reorderItemImages` — ninguna reordenación se aplica de forma optimista sin persistir.
4. **Optimización WebP antes de subir (ya no como deuda).** `studio/lib/media/image-upload.ts`
   gana `optimizeImageFile(file)`: decodifica con `createImageBitmap`, redimensiona a un lado
   máximo de 2200 px (**nunca amplía** imágenes pequeñas — `scale = min(1, max/lado)`), dibuja en
   `<canvas>` y codifica a WebP calidad 0.86 vía `canvas.toBlob`. Si el navegador no soporta
   codificar WebP (el blob resultante no es `image/webp`), si el canvas falla, o si el archivo
   "optimizado" saliera más pesado que el original, se usa el original tal cual — **nunca rompe el
   flujo de subida**. `filename` (metadata visible) conserva el nombre original; `storage_path`
   sigue usando `uuid + extensión` derivada del MIME final; `mime_type`/`size_bytes` guardan el
   MIME/tamaño **finales** realmente subidos. Cuando hay optimización real, la UI muestra
   `Optimizada: 4.2 MB → 720 KB`. Añadidos `validateImageFile`, `getImageExtensionFromMime` y
   `formatBytes` como helpers compartidos entre panel y (indirectamente) la Server Action.

No se usó ninguna librería externa de compresión/drag-and-drop — solo Canvas API y HTML5 Drag and
Drop API nativos del navegador, para no añadir dependencias sin justificar.

## 4. Seguridad

- Sin service_role en cliente ni en servidor — la subida usa el cliente de browser con **anon key**
  (mismo nivel de privilegio que cualquier usuario autenticado, sujeto a RLS/Storage policies); el
  resto de acciones (`registerUploadedItemImage`, `reorderItemImages`, `deleteItemImage`)
  usan `createClient()` server-side (anon key + cookies de sesión), igual que el resto del código.
- `reorderItemImages` verifica que el conjunto de IDs recibido coincide exactamente con las
  imágenes reales del item/owner antes de escribir — un orden manipulado con IDs ajenos se rechaza
  con error, nunca se aplica parcialmente.
- Path de Storage siempre incluye `auth.uid()` como primer segmento (coincide con la policy
  "own folder" que Pablo configuró manualmente en el bucket).
- Solo se aceptan `image/jpeg`, `image/png`, `image/webp`; tamaño máximo 12 MB, verificado
  server-side antes de subir (coincide con la config del bucket).
- Cada acción re-verifica `owner_id = user.id` sobre `inventory_items` antes de tocar `media_assets`
  o Storage — nunca se confía en el `itemId` del cliente sin comprobar propiedad.
- Eliminar una imagen borra el objeto de Storage (best-effort) y la fila de `media_assets` en el
  mismo flujo — no quedan huérfanos salvo fallo de red en el borrado del objeto (se loguea, no
  bloquea el borrado de la fila).

## 5. Validaciones

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS (8/8 rutas) |
| `npm run lint` | PASS (0 issues) |
| `git diff --check` | PASS |
| Secret scan (diff + archivos nuevos) | CLEAN |
| `.env.local` modificado | NO |
| `service_role` en cliente | NO |

## 6. Confirmaciones explícitas

`wp_media_created_by_agent=false` · `wc_api_called_by_agent=false` · `wc_post_called_by_agent=false`
· `wc_put_called_by_agent=false` · `wc_delete_called_by_agent=false` ·
`products_modified_by_agent=false` · `published=false` · `supabase_remote_modified_by_agent=false` ·
`sql_applied_by_agent=false` · `env_local_modified=false` · `service_role_exposed=false`

## 7. Instrucciones para Pablo

1. Aplica `docs/studio/STUDIO_IMAGE_PIPELINE_SCHEMA.sql` en el SQL Editor de Supabase (si no lo
   habías hecho ya — no hay SQL nuevo en esta vuelta).
2. `cd studio && npm run dev`.
3. Abre una camiseta existente (`/inventory/[id]`).
4. Sube 2-4 fotos grandes (JPG/WEBP) — clic o arrastrando a la zona.
5. Observa el estado: `Optimizando…` → `Subiendo…` → `Guardando…` → `Fotos guardadas ✓` (sin error
   de 1 MB).
6. Confirma que las miniaturas se ven y que la primera tiene el badge "Principal".
7. Arrastra una tarjeta para reordenar; confirma que la nueva primera pasa a tener el badge
   "Principal" tras el refresco.
8. (Opcional) Usa ↑/↓ como alternativa sin arrastrar.
9. Elimina una imagen y confirma el mensaje "Foto eliminada ✓".
10. En Supabase Storage, confirma que los objetos aparecen bajo `<user_id>/<inventory_item_id>/` y
    que son `.webp` (o el original si tu navegador no soporta codificar WebP).
11. Confirma que el preflight muestra el bloque "Imágenes" (pass o warning según haya fotos).
12. Confirma que no se ha tocado Woo/WP ni publicado nada.

## 8. Siguiente paso

Si PASS: cierre documental de S026A y abrir **S026B — Upload WP Media + attach en create**
(DRAFT_ONLY intacto, SHADOW_FIRST) en una sesión nueva.

## 9. Validación manual de Pablo — `PABLO_IMAGE_STORAGE_FINAL_OK`

Pablo confirmó en local, sobre el HEAD `8d00860`: upload de imágenes funcionando sin el error de
1 MB (subida directa browser → Supabase Storage + metadata ligera en `media_assets` validada);
drag & drop de subida y de reordenación validados; autosave con feedback visual (optimizando/
subiendo/guardando/guardado) validado; principal = primera imagen validado tras reordenar; eliminar
imagen validado; optimización WebP validada; preflight "Imágenes" validado (sin fotos = warning,
con fotos = pass). Sin tocar Woo/WordPress, sin publicar nada. S026B no se abre en esta sesión.

**S026A queda `APPROVE_READY_FOR_S026B` — CERRADA.**

---

*Sesión S026A — 2026-07-01 — Claude Code (Sonnet 5). ASK→CODE / LOCAL_CODE / QUALITY_PASS_REQUIRED.*
*Cierre S026A_IMAGE_STORAGE_CLOSE_LITE — 2026-07-01 — Codex. DOCS_ONLY / LITE_CLOSE.*
