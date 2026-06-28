# STUDIO_SEO_CONTENT_RULES_AND_PROMPT_STANDARDIZATION_RESULT.md

**Sesión:** S022B.2  
**Fecha:** 2026-06-28  
**Agente:** Claude Code Sonnet 4.6  
**Modo:** LOCAL_DOCS_AND_MINIMAL_PATCH / NO_API / NO_WC / NO_DEPLOY  
**Veredicto:** READY_FOR_PABLO_MANUAL_SEO_TEST

---

## Objetivo

Estandarizar el flujo manual de contenido SEO para camisetas en Catenaccio Studio:

1. Crear una guía canónica de reglas SEO/editoriales: `STUDIO_SEO_CONTENT_RULES.md`.
2. Ajustar el prompt generado por Studio (`manual-seo-prompt.ts`) para que:
   - Indique que se usa el Project ChatGPT "Catenaccio Vintage".
   - Pida revisar las reglas del repo antes de redactar.
   - Incluya reglas fallback embebidas si no hay acceso a GitHub.
   - Especifique que el output se pegará en Studio (formato exacto).

---

## Qué se creó / modificó

### Nuevos archivos

| Archivo | Propósito |
|---------|-----------|
| `docs/studio/STUDIO_SEO_CONTENT_RULES.md` | Guía canónica de reglas SEO/editoriales para camisetas |
| `docs/studio/STUDIO_SEO_CONTENT_RULES_AND_PROMPT_STANDARDIZATION_RESULT.md` | Este documento de cierre |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `studio/lib/seo/manual-seo-prompt.ts` | Añadida sección de contexto (Project ChatGPT + referencias al repo + fallback rules). `MANUAL_PROMPT_VERSION` bumpeado a `studio_manual_seo_v2` |

---

## Contenido de STUDIO_SEO_CONTENT_RULES.md

El documento define 9 secciones:

1. **Objetivo del contenido** — SEO + conversión + prudencia para borradores WC.
2. **Título WooCommerce / SEO** — inglés, formato canónico `YYYY-YY Club Version Shirt (Size)`, máx. 70 chars, variantes (manga larga, portero, selección, jugador/dorsal).
3. **Descripción larga** — español, mín. 100 palabras, texto plano, estructura en 6 bloques, qué excluir.
4. **Descripción corta** — diferida / opcional, criterio definido si aparece.
5. **Precio recomendado** — 4 niveles de confianza, prohibición de usar coste.
6. **Notas internas** — solo para Pablo, no son copy público.
7. **Reglas de claims sensibles** — tabla de cuándo usar Match Worn / Player Issue / Authentic / Original; prohibición de certificados y procedencia no verificada.
8. **Formato de salida estándar** — 4 delimitadores exactos: `---TÍTULO WOO---`, `---DESCRIPCIÓN LARGA---`, `---PRECIO RECOMENDADO---`, `---NOTAS INTERNAS---`.
9. **Checklist final** — 12 puntos de verificación antes de responder.

---

## Estructura del prompt ajustado (manual-seo-prompt.ts)

El prompt generado ahora tiene la siguiente estructura:

```
=== CONTEXTO DE ESTE PROMPT ===
[Indica que viene de Catenaccio Studio]
[Si en Project ChatGPT: revisar repo antes de redactar]
[Documentos prioritarios: STUDIO_SEO_CONTENT_RULES.md + otros]
[Si fuera del Project: usar reglas fallback]
[El resultado se pegará en Studio]
=== FIN CONTEXTO ===

ROL: [redactor experto vintage / SEO]

=== REGLAS FALLBACK (usar si no puedes leer el repo) ===
[Título: formato canónico, variantes, claims prohibidos]
[Descripción: estructura, tono, qué omitir]
[Precio: no usar coste]
[Claims sensibles: tabla completa]
[Campos excluidos: lista explícita]
=== FIN REGLAS FALLBACK ===

RESTRICCIONES ESTRICTAS: [igual que v1]

DATOS DE LA CAMISETA: [campos reales, sanitizados]

FORMATO DE SALIDA: [4 delimitadores exactos]

CHECKLIST ANTES DE RESPONDER: [5 puntos]
```

---

## Qué NO se tocó

- WooCommerce / WordPress / WP Admin
- Supabase remoto
- `inventory_items` / `football_shirt_details`
- Anthropic API
- `.env.local`
- `STUDIO_AI_ENABLED`
- Deploy / Vercel
- Schema (no hay ALTER TABLE)
- `ai-actions` / `manual-seo-actions`
- Componentes UI (ManualSeoPanel, etc.)

---

## Validaciones

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | ✅ PASS (0 errores) |
| `npm run build` (8 rutas) | ✅ PASS |
| `npm run lint` | ✅ PASS (0 warnings/errores) |
| `git diff --check` | ✅ PASS |
| Secret scan (real credentials) | ✅ CLEAN |
| Scope check (solo studio/ + docs/) | ✅ CLEAN |
| Datos sensibles en prompt | ✅ EXCLUIDOS (coste, proveedor, notas_compra, ubicación, notas_internas, owner_id, workspace_id, emails, secretos) |
| API calls en diff | ✅ NINGUNA |
| WC/WP/Supabase remoto tocado | ✅ NO |

---

## Gate S022C (sin cambios)

S022C (`STUDIO_WC_DRAFT_BRIDGE`) sigue bloqueada por:

> `PABLO_MANUAL_CONTENT_OK` = Pablo guarda al menos **una** camiseta con `status = 'editado_aprobado'`  
> y contenido suficiente (título + descripción) en `ai_suggestions`.

S022B.2 no cambia el prerequisito. Solo mejora el prompt que Pablo copia.

---

## Siguiente paso para Pablo

1. Abre Studio local (`npm run dev` desde `studio/`).
2. Entra en la ficha de cualquier camiseta ya creada.
3. Ve la sección "Contenido SEO manual".
4. Pulsa "Copiar prompt SEO" — el prompt ahora incluye referencia al Project ChatGPT y reglas fallback.
5. Pega en **ChatGPT Project "Catenaccio Vintage"** (preferido) — el Project puede leer el repo y aplicar `STUDIO_SEO_CONTENT_RULES.md`.
   - Alternativa: Claude.ai o ChatGPT sin Project — usará las reglas fallback embebidas en el propio prompt.
6. Copia el resultado (en formato `---TÍTULO WOO--- / ---DESCRIPCIÓN LARGA--- / ---PRECIO RECOMENDADO--- / ---NOTAS INTERNAS---`).
7. Pega en el formulario de Studio y guarda.
8. Verifica "Contenido SEO listo para borrador" en la ficha.
9. Confirma con `PABLO_MANUAL_CONTENT_OK` → S022C desbloqueada.
