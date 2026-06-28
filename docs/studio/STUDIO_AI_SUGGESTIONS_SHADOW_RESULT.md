# STUDIO_AI_SUGGESTIONS_SHADOW_RESULT

Fecha: 2026-06-28
Sesión: 022B
Agente: Claude Code Sonnet
Modo: LOCAL_APP_IMPLEMENTATION / SHADOW_FIRST / DOMAIN_PRODUCT_MODELING_GATE / NO_WC / NO_DEPLOY
Resultado: READY_FOR_PABLO_AI_SHADOW_TEST
Veredicto: READY_FOR_PABLO_AI_SHADOW_TEST

---

## DOMAIN_PRODUCT_MODELING_GATE

Aplicado antes de CODE según `STUDIO_PRODUCT_FORM_MODELING_PLAYBOOK.md`.

### A. DOMAIN_FIELD_SPEC

| Campo | Label UI | Valor interno / DB | Valor catálogo/SEO | Valor externo/Woo | Admite edición | Ayuda visible | Ejemplo | Caso borde | Bloquea publicación |
|---|---|---|---|---|---|---|---|---|---|
| titulo_seo | "Título sugerido" | TEXT ai_suggestions | Potencial nombre Woo | Nombre producto | Sí (editAndApprove) | "Título en inglés optimizado para SEO" | "2007-09 PSV Away Shirt (XXL)" | Equipo no mapeado → title sin externalId | S022C necesita título aprobado |
| descripcion_larga | "Descripción sugerida" | TEXT | Copy lista para Woo | product description | Sí | "Descripción en español lista para publicar" | "Camiseta visitante de PSV..." | Sin jugador → omitir sección | Falta aprobación |
| precio_sugerido | "Precio sugerido" | NUMERIC(10,2) o null | Solo referencia interna | No va a Woo directamente | Sí | "Orientación de mercado de Claude. No modifica el precio objetivo." | 85.00 | null si Claude no tiene suficiente contexto | No bloquea; precio_objetivo es el que va a Woo |
| notas_tasacion | "Notas internas de tasación" | TEXT | Solo interno | No se publica | Sí | "Razonamiento de tasación — solo visible para ti, no es copy público" | "Versión away escasa en XXL..." | Puede ser vacío | No aplica |
| model_confidence | "Confianza" | TEXT (alta/media/baja) | No aplica | No se publica | No | "Señal de calidad de la sugerencia, no garantía" | "alta" | "baja" si falta contexto | No bloquea |
| status | "Estado" (label humano) | generando/generado/aprobado/rechazado/editado_aprobado | No aplica | No se publica | No (transiciones controladas) | — | "Generada · pendiente de revisión" | generando no se muestra largo | Necesita aprobado/editado_aprobado para S022C |
| review_notes | "Notas de revisión" | TEXT | Solo interno | No | Sí | "Tus notas al aprobar o rechazar esta sugerencia" | "Precio ajustado a 95€" | Puede ser vacío | No aplica |
| model_used | Metadato discreto | TEXT | No aplica | No | No | — | "claude-sonnet-4-6" | — | — |
| prompt_version | Metadato discreto | TEXT | No aplica | No | No | — | "studio_s022b_v1" | — | — |
| input_context | NO mostrar en UI | JSONB | No aplica | No | No | No mostrar | — | — | — |

### B. VOCABULARY_AMBIGUITY_CHECK

| Término | Definición operativa | Label UI | Qué NO significa |
|---|---|---|---|
| Sugerencia IA | Propuesta de Claude para revisión de Pablo | "Sugerencia con Claude" | No es texto final hasta que Pablo la aprueba |
| Aprobar sugerencia | Pablo valida la sugerencia tal como está | "Aprobar" | NO significa publicar en WooCommerce |
| Editar y aprobar | Pablo modifica el contenido y lo aprueba | "Editar y aprobar" | No edita el producto en Woo |
| Rechazar | Pablo descarta esta versión | "Rechazar" | Se puede generar una nueva versión |
| Precio sugerido | Orientación de mercado de Claude | "Precio sugerido" | NO modifica precio_objetivo ni precio en Woo |
| Notas de tasación | Razonamiento interno de Claude | "Notas internas de tasación" | No es copy público |
| Confianza | Señal interna de calidad (alta/media/baja) | "Confianza" | No garantía comercial |
| Título SEO | Título sugerido en inglés para catálogo | "Título sugerido" | No publicado hasta S022C con aprobación Pablo |
| Descripción larga | Texto sugerido en español | "Descripción sugerida" | Requiere revisión antes de publicar |
| Shadow mode | Solo sugerencias, nunca actúa | (no visible en UI) | — |
| Publicar en Woo | (NO mostrar en UI de S022B) | — | — |

### C. EXAMPLE_DRIVEN_ACCEPTANCE (mental trace)

- PSV Away 2007-09 XXL: título "2007-09 PSV Away Shirt (XXL)", descripción en español, precio estimado. OK.
- Sin jugador: Claude omite sección jugador gracefully. OK.
- Con jugador y dorsal (Henry #14): "2005-06 Arsenal Home Shirt - HENRY #14 - (L)". OK.
- France Away 2014-15 (selección nacional): equipo_display="France", título "2014-15 France Away Shirt (XXL)". OK.
- Equipo nuevo no mapeado: se pasa como string en equipo_display, Claude lo usa. OK.
- Marca no listada: marca_display como string, Claude lo usa. OK.
- Autenticidad Original (stored 'Replica'): suggestion-context.ts humaniza → "Original retail / Fan version". Claude no recibe "Replica". OK.
- Precio sugerido null: JSON `"precio_sugerido": null`. System inserts null. UI muestra "—". OK.
- JSON no parseable de Claude: catch block en claude-suggestions.ts → error controlado, no inserta en DB. OK.
- Sin ANTHROPIC_API_KEY: check explícito, devuelve error "ANTHROPIC_API_KEY no configurada en servidor". OK.

### D. STOP_MICROFIX_SPIRAL

Armed. Si aparecen 2+ microfixes de UI/dominio durante validación de Pablo → STOP_AND_MODEL_DOMAIN antes de parchear.

### E. PRODUCT_OWNER_VALIDATION_LOOP

S022B = READY_FOR_PABLO_AI_SHADOW_TEST hasta que Pablo confirme PABLO_AI_SHADOW_OK.

---

## Qué se implementó

### Dependencia Anthropic
- `@anthropic-ai/sdk ^0.106.0` añadida a `studio/package.json`.
- Solo server-side. Nunca `NEXT_PUBLIC_*`.
- Lee `process.env.ANTHROPIC_API_KEY` y `process.env.ANTHROPIC_MODEL`.
- Fallback: `claude-sonnet-4-6` si `ANTHROPIC_MODEL` no definida.
- `.env.example` actualizado con `ANTHROPIC_API_KEY=` y `ANTHROPIC_MODEL=`.

### Tipos
- `AiSuggestionStatus`, `AiConfidence`, `AiSuggestion` añadidos a `studio/lib/types.ts`.

### Contexto sanitizado
- `studio/lib/ai/suggestion-context.ts`: `buildSuggestionContext(item)` → JSON serializable sin datos sensibles.
- Incluye: referencia, product_type, shirt_version, equipo/liga/temporada_display, talla, marca_display, condicion, authenticity_type humanizado, sleeve_length, sponsor, jugador_display, numero_dorsal, nombre_dorsal, tiene_parches, parches_descripcion, tiene_etiquetas, largo/ancho_cm, condicion_notas, autenticidad, precio_objetivo.
- Excluye explícitamente: coste, proveedor, notas_compra, ubicacion_fisica, carpeta_local, notas_internas, owner_id, workspace_id, auth uid, emails, secretos.

### Prompt de Claude
- `studio/lib/ai/claude-suggestions.ts`
- `PROMPT_VERSION = 'studio_s022b_v1'`
- Fallback model: `claude-sonnet-4-6`
- Instrucciones: título EN catálogo vintage, descripción ES lista para Woo, precio de mercado o null, notas internas de tasación, confianza alta/media/baja.
- Restricciones: no inventar procedencia, no afirmar match worn / player issue sin evidencia.
- Parsing robusto: strip de code fences, catch de JSON inválido, validación de campos mínimos.

### Server Actions
- `studio/app/inventory/[id]/ai-actions.ts`
- `generateAiSuggestion(itemId)`: fetch item con RLS, construye contexto sanitizado, llama Claude, calcula siguiente versión, inserta en `ai_suggestions`, lifecycle event `ai_request`.
- `approveAiSuggestion(suggestionId)`: update `status=aprobado`, lifecycle event `ai_approved`.
- `rejectAiSuggestion(suggestionId)`: update `status=rechazado`, lifecycle event `ai_rejected`.
- `editAndApproveAiSuggestion(suggestionId, fields)`: update campos editados + `status=editado_aprobado`, lifecycle event `ai_edited_approved`.
- Todas verifican user autenticado + owner_id match vía RLS.

### UI en ficha detalle
- `studio/components/AiSuggestionsPanel.tsx`: panel client-side con useTransition.
- Muestra: versión, badge de estado (label humano), título sugerido, descripción sugerida, precio sugerido, confianza, notas internas de tasación, notas de revisión, metadatos discretos (modelo/prompt version/fecha).
- Acciones por status: generado → Aprobar / Editar y aprobar / Rechazar; aprobado/editado_aprobado/rechazado → solo badge.
- `EditForm` inline con campos editables y botón "Guardar edición y aprobar".
- `studio/app/inventory/[id]/page.tsx` actualizado para cargar `ai_suggestions` y renderizar `AiSuggestionsPanel`.
- NO muestra: input_context, owner_id, workspace_id, auth uid, nombres de sesión, roadmap técnico, botón Woo.

---

## Flujo SHADOW_FIRST

1. Pablo pulsa "Generar sugerencia con Claude" en la ficha.
2. `generateAiSuggestion` verifica auth, lee item + detalles (RLS).
3. `buildSuggestionContext` construye contexto sanitizado (sin campos sensibles).
4. `generateClaudeSuggestion` llama a Claude con prompt `studio_s022b_v1`.
5. Claude devuelve JSON estructurado; se parsea robustamente.
6. Sugerencia se inserta en `ai_suggestions` con `status=generado`.
7. Lifecycle event `ai_request` registrado en `item_lifecycle_events`.
8. Página recargada (revalidatePath) — Pablo ve la sugerencia.
9. Pablo puede: Aprobar / Rechazar / Editar y aprobar.
10. Ninguna acción modifica `inventory_items`, `football_shirt_details` ni WooCommerce.
11. S022C (Woo Draft) seguirá bloqueado hasta PABLO_AI_SHADOW_OK.

---

## Contexto enviado a Claude

Solo campos de producto no sensibles. Ver `buildSuggestionContext` en `studio/lib/ai/suggestion-context.ts`.

## Datos excluidos

coste, proveedor, notas_compra, ubicacion_fisica, carpeta_local, notas_internas, owner_id, workspace_id, auth uid, emails, secretos, credenciales.

## Prompt version

`studio_s022b_v1` — guardado en `ai_suggestions.prompt_version` para trazabilidad.

---

## Sugerencias y revisión

- Generadas: versión auto-incremental por `item_id`.
- Revisión: Pablo aprueba, edita+aprueba, o rechaza.
- Trazabilidad: `item_lifecycle_events` con `triggered_by = 'pablo' | 'agente'`.
- S022C: requiere al menos una sugerencia `aprobado` o `editado_aprobado` + PABLO_AI_SHADOW_OK.

---

## Qué NO se tocó

- WooCommerce: NO
- WordPress / WP Admin: NO
- Anthropic key impresa o commiteada: NO
- Vercel: NO
- cPanel: NO
- Supabase SQL remoto: NO
- Schema: NO
- .env.local leído o modificado: NO
- service_role: NO
- Producción: NO
- inventory_items modificado por IA: NO
- football_shirt_details modificado por IA: NO

---

## Validaciones técnicas

- npm install: OK (`@anthropic-ai/sdk ^0.106.0` instalado)
- npm run typecheck: PASS (0 errores)
- npm run build: PASS (8 rutas, 5.9s)
- npm run lint: PASS (0 warnings/errors)
- git diff --check: PASS (solo LF/CRLF warnings de Windows, no errores)
- agent_events.jsonl: VALID
- Secret scan: CLEAN (no ANTHROPIC_API_KEY real, no WP_APP_PASSWORD, no service_role_key, no auth.uid real, no .env.local leído)
- Scope check: CLEAN (solo archivos permitidos)

---

## Validación manual de Pablo

Estado: **PENDIENTE**

Pasos para Pablo:
1. Asegurarse de tener `ANTHROPIC_API_KEY` añadida manualmente en `.env.local` local (no commiteada).
2. Opcionalmente añadir `ANTHROPIC_MODEL=claude-sonnet-4-6` (o dejar en blanco para usar el fallback).
3. Reiniciar `npm run dev` desde `studio/`.
4. Abrir una camiseta ya validada en `/inventory/[id]`.
5. Pulsar "Generar sugerencia con Claude".
6. Verificar que aparece una sugerencia en la ficha con título, descripción, precio y notas.
7. Comprobar que `inventory_items` no se modificó (el item sigue igual).
8. Aprobar una sugerencia.
9. Opcional: editar y aprobar otra sugerencia (o generar una segunda versión y aprobarla).
10. Confirmar que Woo no se tocó (sin borrador nuevo en WP Admin).
11. Responder: `PABLO_AI_SHADOW_OK`

---

## Siguiente paso

- **Si Pablo confirma PABLO_AI_SHADOW_OK** en esta sesión: `APPROVE_READY_FOR_S022C`.
- **Si Pablo valida después**: `READY_FOR_PABLO_AI_SHADOW_TEST` → siguiente sesión es S022C — STUDIO_WC_DRAFT_BRIDGE.
- S022C sigue BLOQUEADO hasta PABLO_AI_SHADOW_OK.
