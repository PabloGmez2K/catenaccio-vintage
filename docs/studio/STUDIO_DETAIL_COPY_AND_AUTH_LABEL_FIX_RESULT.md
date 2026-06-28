# STUDIO_DETAIL_COPY_AND_AUTH_LABEL_FIX_RESULT

Fecha: 2026-06-28
Sesión: 022A.2D
Agente: Claude Code Sonnet
Modo: LOCAL_APP_PATCH / NO_DEPLOY / NO_WC / NO_AI
Resultado: READY_FOR_PABLO_VALIDATION
Veredicto: READY_FOR_PABLO_LOCAL_FORM_OK

---

## Qué se ajustó

### Autenticidad visible

- `wc-terms-mvp.ts`: label de la opción principal cambiado de `"Original retail / Fan version"` a `"Original"`. El `value: 'Replica'` se mantiene para backward compatibility con registros existentes en DB.
- `studio/components/ItemForm.tsx`: helper text actualizado de "Original retail / Fan version" a "Original".
- `studio/app/inventory/[id]/page.tsx`: añadida función local `formatAuthenticityLabel(value)` que mapea:
  - `'Replica'` → `'Original'`
  - `'Original retail / Fan version'` → `'Original'`
  - `'Original'` → `'Original'`
  - Todos los demás valores → pasan tal cual (`'Match Worn'`, `'Player Issue / Authentic'`, `'Deadstock / BNWT'`, `'No determinado'`, `'Official Reissue'`, `'Match Issue'`)
  - `null` → `'—'`
- La fila de Autenticidad en el detalle usa `formatAuthenticityLabel(shirt.authenticity_type)` en lugar del valor raw.

### Texto técnico eliminado

- Eliminado el `<p className="read-only-notice">` con el texto `"S022B añadirá sugerencias Claude · S022C añadirá publicación Woo"` de la página de detalle (`/inventory/[id]/page.tsx`).
- No se sustituye por otro texto técnico. No se añaden botones Claude/Woo.

### Borrado/archivado diferido

- No implementado.
- `STUDIO_ARCHIVE_OR_DELETE_ITEM_ACTION` añadido a BACKLOG LATER con recomendación MVP: soft archive via status `archivada`, no hard delete, con confirmación UI y owner_id/RLS.

---

## Qué NO se tocó

- Schema SQL: sin cambios.
- WooCommerce API: no tocada.
- WordPress / WP Admin: no tocado.
- Anthropic API: no tocada.
- Vercel / cPanel: no tocados.
- Supabase SQL / CLI / psql: no usados.
- `.env.local`: no leído ni modificado.
- `service_role`: no usado.
- Secretos: no expuestos.
- S022B: continúa BLOQUEADO.
- Borrado duro: no implementado.

---

## Archivos modificados

- `studio/lib/wc-terms-mvp.ts` — label "Original retail / Fan version" → "Original"
- `studio/components/ItemForm.tsx` — helper text de autenticidad actualizado
- `studio/app/inventory/[id]/page.tsx` — `formatAuthenticityLabel()` añadida, roadmap notice eliminado

---

## Validaciones

- `npm run typecheck`: PASS (0 errores)
- `npm run build`: PASS (8 páginas generadas)
- `npm run lint`: PASS (0 warnings/errors)
- `git diff --check`: exit 0
- JSONL: línea válida appended
- Secret scan: limpio
- Scope check: sin schema, sin Woo, sin WP, sin Anthropic, sin `.env.local`

---

## Validación manual de Pablo

Pendiente. Pablo debe:
1. Abrir cualquier camiseta existente en `/inventory/[id]`
2. Verificar que muestra `Autenticidad: Original` (no "Replica" ni "Original retail / Fan version")
3. Verificar que ya no aparece el texto "S022B añadirá sugerencias Claude · S022C añadirá publicación Woo"
4. Abrir el formulario `/inventory/new` y verificar que la opción de autenticidad dice "Original" (no "Original retail / Fan version")
5. Confirmar que crear/editar sigue funcionando

---

## Siguiente paso

Pablo responde `PABLO_LOCAL_FORM_OK` si todo está correcto.
Si OK → S022B se desbloquea.
