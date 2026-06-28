# STUDIO_MANUAL_SEO_PROMPT_WORKFLOW_RESULT.md

**Sesión:** S022B.1  
**Fecha:** 2026-06-28  
**Agente:** Claude Code Sonnet 4.6  
**Modo:** LOCAL_APP_IMPLEMENTATION / NO_API / NO_WC / NO_DEPLOY  
**Veredicto:** READY_FOR_PABLO_MANUAL_SEO_TEST

---

## Objetivo

Implementar un flujo manual NO-API para preparar contenido SEO desde Studio.  
Sustitución temporal de la integración Anthropic (S022B dormante/cost_deferred).  
Prerequisito para desbloquear S022C vía `PABLO_MANUAL_CONTENT_OK`.

---

## Qué se implementó

### Nuevos archivos

| Archivo | Propósito |
|---|---|
| `studio/lib/seo/manual-seo-prompt.ts` | Helper que construye el prompt SEO a partir del `SuggestionContext` sanitizado |
| `studio/app/inventory/[id]/manual-seo-actions.ts` | Server Action `saveManualSeoContent` — guarda en `ai_suggestions` |
| `studio/components/ManualSeoPanel.tsx` | Client Component — botón copiar, textarea fallback, formulario de pegado |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `studio/app/inventory/[id]/page.tsx` | Siempre carga suggestions, detecta approved, construye prompt, renderiza `ManualSeoPanel` |
| `studio/styles/globals.css` | CSS para `manual-seo-*` classes + `btn-ghost` |

---

## Flujo completo

1. Pablo abre la ficha de una camiseta en `/inventory/[id]`.
2. Ve la sección **"Contenido SEO manual"** (siempre visible, sin `STUDIO_AI_ENABLED`).
3. Pulsa **"Copiar prompt SEO"** → clipboard.  
   Si la Clipboard API falla → pulsa "Ver prompt" → textarea readonly → selecciona y copia.
4. Pega el prompt en ChatGPT o Claude.ai.
5. Copia el resultado generado.
6. Pulsa **"Pegar resultado"** en Studio → aparece el formulario.
7. Pega título, descripción, precio (opcional), notas (opcional).
8. Pulsa **"Guardar contenido SEO"** → `saveManualSeoContent` inserta en `ai_suggestions`:
   - `status = 'editado_aprobado'`
   - `model_used = 'manual_external_agent'`
   - `prompt_version = 'studio_manual_seo_v1'`
   - `input_context = snapshot sanitizado de SuggestionContext`
   - `model_confidence = null`
   - `reviewed_by = user.id`
   - `reviewed_at = now()`
   - `review_notes = 'Manual SEO content saved from copied prompt workflow'`
9. Se crea `item_lifecycle_events` con `event_type = 'manual_seo_content_saved'`.
10. La página se refresca (`router.refresh()`).
11. La ficha muestra el bloque **"Contenido SEO listo para borrador"** con título, descripción, precio y notas.

---

## Qué NO se tocó

- WooCommerce / WordPress / WP Admin
- Supabase remoto (solo escribe en local via cliente anon + RLS)
- `inventory_items` (no se modifica)
- `football_shirt_details` (no se modifica)
- Anthropic API (no se llama)
- `.env.local` (no se lee)
- `STUDIO_AI_ENABLED` (no se necesita para este flujo)
- Deploy / Vercel
- Schema (no hay ALTER TABLE — `ai_suggestions` ya tenía todos los campos)

---

## Guardrails UI aplicados

- Los botones dicen: "Copiar prompt SEO" / "Guardar contenido SEO" / "Contenido SEO listo para borrador"
- NO se muestra: `model_used`, `prompt_version`, `prompt_version`, roadmap técnico, IDs internos
- "Guardar contenido SEO" **NO publica** ni crea borrador Woo
- El contenido queda como `editado_aprobado` en `ai_suggestions`, listo para que S022C lo lea

---

## Contenido excluido del prompt

El prompt se construye desde `SuggestionContext` (ya sanitizado en `suggestion-context.ts`).  
Excluidos explícitamente: `coste`, `proveedor`, `notas_compra`, `ubicacion_fisica`,  
`notas_internas`, `owner_id`, `workspace_id`, `auth uid`, `emails`, secretos.

---

## Validaciones

| Check | Resultado |
|---|---|
| `npm run typecheck` | ✅ PASS |
| `npm run build` (8 rutas) | ✅ PASS |
| `npm run lint` | ✅ PASS (0 errores) |
| `git diff --check` | ✅ PASS |
| Secret scan en diff + nuevos archivos | ✅ CLEAN |
| Scope check (solo archivos Studio) | ✅ CLEAN |

---

## Gate S022C

S022C (`STUDIO_WC_DRAFT_BRIDGE`) se desbloquea cuando:

> `PABLO_MANUAL_CONTENT_OK` = Pablo guarda al menos **una** camiseta con `status = 'editado_aprobado'`  
> y contenido suficiente (título + descripción) en `ai_suggestions`.

S022C leerá la última suggestion `aprobado` o `editado_aprobado` como fuente de contenido para el borrador WC.

---

## Siguiente paso para Pablo

1. Abre Studio local (`npm run dev` desde `studio/`).
2. Entra en la ficha de cualquier camiseta ya creada.
3. Ve la sección "Contenido SEO manual".
4. Pulsa "Copiar prompt SEO".
5. Pega en ChatGPT o Claude.ai y genera el contenido.
6. Pega el resultado en el formulario de Studio.
7. Pulsa "Guardar contenido SEO".
8. Verifica que aparece "Contenido SEO listo para borrador" en la ficha.
9. Confirma con `PABLO_MANUAL_CONTENT_OK` → S022C desbloqueada.
