# STUDIO_FORM_DOMAIN_UX_PATCH_RESULT

Fecha: 2026-06-28
Sesión: 022A.2B
Agente: Claude Code Sonnet
Modo: LOCAL_APP_IMPLEMENTATION / NO_DEPLOY / NO_WC / NO_AI
Resultado: READY_FOR_PABLO_VALIDATION
Veredicto: READY_FOR_PABLO_LOCAL_FORM_OK

---

## Qué se implementó

Corrección completa de los 6 blockers UX/dominio detectados en S022A:

1. **IDs técnicos eliminados de la UI** — ningún campo term ID visible. Liga, equipo, temporada, marca y jugador se muestran como labels humanos. La resolución de term IDs ocurre internamente en la Server Action usando `wc-terms-mvp.ts`.
2. **Preservación de form state** — ItemForm usa inputs controlados (React `useState`). Los valores viven en estado local y no se pierden si la Server Action devuelve errores de validación.
3. **Ruta de edición creada** — `/inventory/[id]/edit` carga `ItemForm` en modo `edit` con `defaultValues` del registro existente.
4. **Opciones canónicas** — selects/datalists para liga, equipo, temporada, marca, talla, condición, tipo, versión, autenticidad, manga.
5. **Título autogenerado en inglés** — `buildTitle()` computa en tiempo real. Override manual preservado hasta pulsar "↺ Regenerar".
6. **Campos de dominio granulares** — `product_type`, `shirt_version`, `authenticity_type`, `sleeve_length`, `sponsor` visibles en UI y guardados en DB.

## Archivos creados

| Archivo | Descripción |
|---|---|
| `studio/lib/wc-terms-mvp.ts` | Opciones canónicas de dominio + `resolveTermId()` |
| `studio/lib/title-builder.ts` | `buildTitle()` — generador de título en inglés |
| `studio/app/inventory/[id]/edit/page.tsx` | Ruta de edición — carga item + detalle → ItemForm edit |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `studio/lib/types.ts` | `FootballShirtDetails` ampliado con 5 campos nuevos |
| `studio/app/inventory/actions.ts` | `createInventoryItem` refactorizado + `updateInventoryItem` añadido |
| `studio/components/ItemForm.tsx` | Reescritura completa — modo create/edit, inputs controlados, título autogenerado |
| `studio/app/inventory/[id]/page.tsx` | Botón "Editar", nuevos campos en ficha, detalle-top-row |
| `studio/styles/globals.css` | Estilos: title-preview, btn-regenerate, manual-badge, detail-top-row |

## Campos de dominio soportados

| Campo | UI | DB | Resolución |
|---|---|---|---|
| `product_type` | select (Shirt/Shorts/Jacket/Tracksuit/Socks/Accessories) | `football_shirt_details.product_type` | directo |
| `shirt_version` | select (Home/Away/Third/GK/Training/Pre-match/Special/None) | `football_shirt_details.shirt_version` | directo |
| `authenticity_type` | select (Replica/Player Issue/Match Issue/Match Worn/Official Reissue/Deadstock) | `football_shirt_details.authenticity_type` | directo |
| `sleeve_length` | select (Short Sleeve/Long Sleeve) | `football_shirt_details.sleeve_length` | directo |
| `sponsor` | text input | `football_shirt_details.sponsor` | directo |
| `liga_display` | select (LaLiga, Premier League, etc.) | `liga_display` + `liga` (termId) | `resolveTermId(ligaOptions, ...)` |
| `equipo_display` | datalist libre (60+ equipos) | `equipo_display` + `equipo` (termId) | `resolveTermId(equipoOptions, ...)` |
| `temporada_display` | datalist (1990-91 a 2025-26) | `temporada_display` + `temporada` (termId) | `resolveTermId(temporadaOptions, ...)` |
| `marca_display` | select (Adidas, Nike, Umbro, etc.) | `marca_display` + `marca` (termId) | `resolveTermId(marcaOptions, ...)` |
| `talla` | select (XS–XXXL, Única) | `football_shirt_details.talla` | directo |
| `condicion` | select (Mint, Excelente, Muy buena, Buena, Aceptable) | `football_shirt_details.condicion` | directo |
| `jugador_display` | text libre | `jugador_display` + `jugador: ''` | sin term list (S022C no bloqueará) |

## Título autogenerado

Regla: `[Season] [Team] [Authenticity if not Replica] [Version] [L/S] [Shirt/GK Shirt/ProductType] – [Player] #[Number] – ([Size])`

Ejemplos:
- `2001-02 Real Madrid Home Shirt (L)`
- `2001-02 Real Madrid Home Shirt – Raúl #7 – (L)`
- `2005-06 Arsenal Match Worn Home L/S Shirt – Henry #14 – (L)`
- `2010-11 Chelsea GK Shirt (M)`
- `1997-98 Arsenal Home L/S Shirt (XL)`
- `2014-15 France Away Shirt (XXL)`
- `2001-02 Real Madrid Home Shorts (L)`
- `2001-02 Real Madrid Tracksuit (L)`

**Override manual:** Pablo puede editar el título directamente; se muestra badge "· Manual". Botón "↺ Regenerar" resetea al título computado.

## Edición

- Ruta: `/inventory/[id]/edit`
- El detalle muestra botón "Editar" (→ `/inventory/[id]/edit`)
- La Server Action `updateInventoryItem` verifica `owner_id = user.id` explícitamente + RLS
- Si football_shirt_details no existe para el item (inconsistencia), devuelve error con mensaje claro en lugar de crear silenciosamente

## Form state preservation

ItemForm usa `useState` para todos los campos. Los valores persisten en estado React local al devolver la Server Action errores de validación. Pablo no pierde lo que había escrito.

## Qué NO se tocó

- WooCommerce API: no
- WordPress / WP Admin: no
- Anthropic API: no
- Vercel / deploy: no
- cPanel: no
- Supabase SQL ejecutado por agente: no
- .env.local: no
- service_role: no
- Secretos expuestos: no
- `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`: no (sin desalineación detectada)

## Validaciones técnicas

| Check | Resultado |
|---|---|
| `npm run typecheck` | ✓ PASS — 0 errores |
| `npm run build` | ✓ PASS — 8 rutas compiladas correctamente |
| `npm run lint` | ✓ PASS — 0 ESLint warnings/errors |
| `git diff --check` | ✓ PASS (exit 0) |
| `agent_events.jsonl` parseable | ✓ |
| secret scan diff | ✓ CLEAN — 0 matches |
| scope check | ✓ CLEAN — solo studio/ + docs/studio/ + BACKLOG/CONTEXTO/HISTORIAL/agent_events |
| IDs visibles en UI | ✗ — confirmado: 0 |

## Validación manual de Pablo

**Pendiente.** Pablo debe:

1. `cd C:\Projects\catenaccio-vintage\studio && npm run dev`
2. Abrir `/inventory`
3. Click "+ Nueva camiseta"
4. Verificar que **no hay ningún campo term ID** visible
5. Crear camiseta real (liga, equipo, temporada, marca, talla, condición, tipo, versión, autenticidad, manga, coste, precio objetivo, fecha compra)
6. Verificar título autogenerado en inglés
7. Modificar título manualmente → badge "· Manual" aparece → respeta override
8. Provocar error dejando vacío un campo obligatorio → confirmar que NO pierde el formulario
9. Guardar correctamente
10. Entrar en `/inventory/[id]`
11. Click "Editar"
12. Ver formulario pre-relleno
13. Cambiar condición o precio → guardar cambios
14. Confirmar detalle actualizado

Al completar: responder **`PABLO_LOCAL_FORM_OK`**

## Siguiente paso

- Si Pablo valida → PABLO_LOCAL_FORM_OK → S022B — STUDIO_AI_SUGGESTIONS_SHADOW desbloqueado
- Si Pablo detecta nuevos blockers → reportar con detalle → nueva sesión FIX_BLOCKER_FIRST
