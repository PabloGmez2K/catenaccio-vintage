# STUDIO_WOO_WRITE_SYNC_RESULT — Foundation de writes controlados Studio → Woo

**Sesión:** WOO_WRITE_SYNC_FOUNDATION_WITH_FABLE (implementación, cortada por límite de uso) + WOO_WRITE_SYNC_FOUNDATION_WITH_FABLE_ULTRACODE (recovery + cierre)
**Fecha:** 2026-07-04
**Agente:** Claude Code (Fable 5)
**Modo:** RECOVERY_FIRST / HIGH_AUTONOMY_PRODUCT_BUILD / CONTROLLED_WOO_WRITES / LOCAL_FIRST / NO_DEPLOY / NO_PUSH
**Resultado:** DONE (implementación local) — pendiente `PABLO_WOO_WRITE_SYNC_OK` (prueba manual desde UI)

---

## 1. Qué es

Primera foundation donde Studio **escribe** en WooCommerce de forma operativa y segura. Hasta ahora Studio solo creaba borradores (POST DRAFT_ONLY, S022+) y leía el catálogo (GET, STOCK_MANAGER). Este bloque añade la capa de writes controlados:

- **PUT** `/wc/v3/products/{id}` con whitelist estricta de campos (`regular_price`, `stock_quantity`, `stock_status`, `description`). `status` NO está en la whitelist: estos writes no pueden publicar, despublicar ni archivar.
- **DELETE** `/wc/v3/products/{id}?force=false` — papelera reversible, solo borradores/pending, nunca publicados/privados, con relectura fresca inmediatamente antes y veto duro sobre el producto de referencia (ID 1731, Rivaldo).

Ningún write se ha ejecutado durante la implementación: el agente no ha llamado a PUT/DELETE ni desde terminal ni desde scripts. La prueba real queda para Pablo desde la UI local.

## 2. Barra de producto cubierta

Las 3 operaciones mínimas quedan implementadas end-to-end en UI:

1. **Cambiar precio web** — panel «Sincronización web» en la ficha: diff precio Studio vs precio Woo vivo, botón → confirmación inline con «€X → €Y» → PUT → resultado + log. Re-verificación doble antes de escribir: si el precio Studio o el precio Woo cambiaron desde la vista previa, se aborta con mensaje.
2. **Venta por Vinted → Woo agotado** — flujo en dos pasos: (a) registrar la venta local (panel Venta, ya existía); (b) el panel ofrece «Dejar agotada en la web» con confirmación → PUT `stock_status=outofstock` (+`stock_quantity=0` solo si `manage_stock`). Nunca toca `status`: el producto sigue publicado como «Agotado». Solo se ofrece para items vendida/reservada (re-verificado en server).
3. **Borrador → papelera reversible** — desde la ficha vinculada: confirmación con nombre e ID → DELETE `force=false` → log. La relectura previa rechaza cualquier estado que no sea draft/pending.

Extras dentro de scope:

- **Sync de descripción** (solo si hay contenido aprobado en Studio): confirmación explícita de que la descripción web se sustituye; re-verificación de ambos lados (versión aprobada Studio + contenido web vivo) antes del PUT.
- **Actualizar estado local** (solo Supabase): re-alinea el espejo `wc_status` con el estado real leído, incluida la salida de `error_sync` una vez resuelto el problema.
- **Inventario único:** «Catálogo web» sale de la navegación principal y pasa a ser **«Auditoría web»**, enlazada desde el propio inventario. Su única acción es «Vincular a Studio» (crea ficha local desde un producto web, Supabase-only, con fila `football_shirt_details` vacía que el formulario obliga a completar). La web NUNCA se escribe desde la auditoría.
- **Móvil:** `/inventory` colapsa a lista compacta (miniatura + referencia + badges + precio, tap para expandir) vía nuevo `InventoryRow`; desktop intacto.

## 3. Arquitectura

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Write client | `studio/lib/wc/write-client.ts` | `updateWooProduct` (PUT whitelist, payload reconstruido clave a clave), `trashWooProduct` (DELETE force=false + relectura + guards), errores saneados (user/password/base64 → `[REDACTED]`). Sin bulk, sin `/products/batch`, sin `force=true` en ningún camino. |
| Detail GET | `studio/lib/wc/product-catalog.ts` | `fetchWooProductDetail` (+`description`/`sale_price`), parser único `parseProductDetailRaw` compartido con el write client. |
| Diff puro | `studio/lib/inventory/woo-diff.ts` | `buildWooDiff` sin I/O: precio/stock/estado/descripción Studio vs Woo, qué es sincronizable y qué es solo informativo. `normalizeDescription` tolera markup/entidades de Woo. |
| Server actions ficha | `studio/app/inventory/[id]/woo-sync-actions.ts` | `syncWooPrice`, `syncWooStockOut`, `syncWooDescription`, `trashWooDraftForItem`, `refreshLocalWooMirror`. Contrato común: 1 producto, GET fresco pre-write, re-verificación de la preview, log en `item_lifecycle_events`, error visible, sin retry. |
| Server actions auditoría | `studio/app/inventory/woo/audit-actions.ts` | Solo `linkWooProductToStudio` (Supabase-only; item + details con rollback si falla el segundo insert). |
| UI | `WooSyncPanel.tsx`, `WooAuditRowActions.tsx`, `SalePanel.tsx` (paso 2), `InventoryRow.tsx` | Confirmación inline en dos pasos para todo write (sin `confirm()` nativo), resultado/error persistente, registro de sincronización visible en la ficha (últimos 8 eventos `wc_*`). |

**Espejo local:** `wc_status` solo pasa a `error_sync` cuando un **write real** contra Woo falló (`flipMirror=true`); un fallo de lectura previa registra el evento pero no marca error de sync. Tras cada write OK, el espejo se re-alinea con el estado devuelto por Woo.

**Logging:** todo write (éxito y fallo) inserta en `item_lifecycle_events` (`wc_price_synced`, `wc_stock_synced`, `wc_description_synced`, `wc_trashed`, `wc_sync_error`, `wc_state_refreshed`, `created_from_woo`). Si el propio log falla, el write no se reporta como error pero el mensaje avisa de que no quedó en el registro. Por esto mismo se eliminó el trash de borradores **sin ficha** que traía el trabajo parcial: sin item no hay log posible (`item_lifecycle_events.item_id NOT NULL`) y violaba la regla «todo Woo write deja log». Flujo actual: vincular primero → papelera desde la ficha (dos confirmaciones, todo registrado).

## 4. Recovery

La sesión de implementación se cortó a mitad. El recovery encontró estado `DIRTY_RECOVERABLE`: 11 modificados + 7 nuevos, todos dentro de scope, `git diff --check` limpio. Se rescató **todo** el trabajo parcial. Cabos sueltos cerrados:

- 7 llamadas a `markSyncError` sin el parámetro `flipMirror` (refactor a medio hacer → typecheck roto). Completadas distinguiendo fallo de lectura (no flip) vs fallo de write (flip).
- `LOG_FAILED_SUFFIX` definido pero sin cablear → cableado en los 4 caminos de éxito.
- Prop `approvedSuggestionId` sin pasar a `WooSyncPanel`.
- `trashUnlinkedWooDraft` eliminado (regla de log, arriba).

## 5. Crítico fresco

Subagente revisor independiente con misión adversarial («demuestra que NO pasa la barra»). Veredicto inicial: **1 blocker + 15 notas; las 9 reglas de casa OK** (checklist completo con evidencia archivo:línea en el informe del reviewer).

**Blocker corregido:** `linkWooProductToStudio` creaba el item sin su fila 1:1 en `football_shirt_details` → el formulario de edición fallaba siempre con escritura parcial («contacta con soporte»), rompiendo la promesa «completa coste y detalles desde la ficha». Fix: insert de details con campos NOT NULL vacíos (el form obliga a completarlos en la primera edición) + rollback del item si el insert de details falla + mensaje amable para el duplicado por carrera.

**Notas corregidas:** ficha clavada en `error_sync` sin salida desde el panel (ahora «Actualizar estado local» cura); badge «Igual» engañoso cuando Studio no tiene precio y la web sí; copy de la nota de stock que sugería venta sin registrar cuando también puede ser restock pendiente; carrera preview→write en descripción (ahora se re-verifica también el lado web); `normalizeDescription` no convergía con entidades HTML numéricas/comunes; `manage_stock` retirado de la whitelist (nadie lo usaba); credenciales base64 añadidas al saneado de errores; `aria-hidden` en el chevrón móvil.

**Notas aceptadas sin cambio (documentadas):** GET bloqueante por vista de ficha vinculada (si Woo va lento, la ficha va lenta; fallo manejado — candidato a timeout futuro); `network_error` en DELETE marca `error_sync` aunque el trash pudiera haberse aplicado (conservador a propósito); ventana TOCTOU de segundos entre relectura y DELETE (inherente al diseño sin transacciones); `coste: 0` placeholder en fichas vinculadas produce margen ficticio hasta que Pablo edite el coste real (avisado en `notas_internas`; corregible tras el fix del blocker); no existe acción de restock (deshacer venta no repone stock web — WP Admin); SalePanel permite intentar «dejar agotada» cuando no se pudo leer el stock (el server relee y aborta si no puede — política distinta al WooSyncPanel, segura y con copy claro); `photo_status='sin_hacer'` de nacimiento aunque el producto web tenga imágenes.

## 6. Validación

- `npm run typecheck` PASS
- `npm run lint` PASS (0 warnings)
- `npm run build` PASS (9 rutas)
- `git diff --check` PASS
- Secret scan sobre diff + archivos nuevos: CLEAN (hits solo `stock_`/`_check_`, falsos positivos)
- Woo writes ejecutados por el agente: **0** (ni terminal, ni curl, ni scripts, ni UI)

## 7. Prueba manual para Pablo (pendiente)

Desde `cd studio && npm run dev`, con un producto **publicado barato/de bajo riesgo** elegido por Pablo:

1. **Precio:** ficha vinculada → «Sincronización web» → comprobar diff precio → «Actualizar precio en la web» → confirmar → verificar en la web/WP Admin → ver entrada en «Registro de sincronización». Rollback: volver a poner el precio anterior (misma acción, o WP Admin).
2. **Venta Vinted → agotado:** ficha → panel Venta → registrar venta canal Vinted → aparece paso 2 «Dejar agotada en la web» → confirmar → verificar en la web que muestra «Agotado» y sigue publicada. Rollback: WP Admin → stock instock (+ deshacer venta en Studio si aplica).
3. **Papelera:** elegir un borrador de prueba vinculado (p.ej. 1854/1856/1861 si siguen) → ficha → «Enviar borrador a papelera» → confirmar → verificar WP Admin → Productos → Papelera. Rollback: Restaurar desde WP Admin.
4. Confirmar con `PABLO_WOO_WRITE_SYNC_OK` (+ capturas del diff, la confirmación y el registro).

## 8. Qué NO toca

Pedidos, clientes, pagos, emails, ajustes Woo, WordPress/PHP/tema/plugins, bridge de creación (`bridge.ts` v2.2 DRAFT_ONLY e idempotencia intactos), `.env.local`, Supabase remoto (cero SQL nuevo necesario), Vercel/deploy, push.
