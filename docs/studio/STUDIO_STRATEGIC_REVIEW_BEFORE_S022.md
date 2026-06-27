# STUDIO_STRATEGIC_REVIEW_BEFORE_S022

**Fecha:** 2026-06-27
**Sesión:** 021D
**Agente:** Claude Code Opus
**Modo:** READ_ONLY_STRATEGIC_REVIEW / NO_IMPLEMENTATION / NO_REMOTE_WRITE
**Veredicto:** `ADJUST_BEFORE_S022`

> Subtítulo del veredicto: la **ruta** es correcta (no hay STOP_AND_REPLAN); lo que se ajusta es la **granularidad** de S022. S022 tal como está definida en BACKLOG (formulario + Claude + Woo Draft en una sola sesión) agrupa tres clases de riesgo distintas en un solo bloque. Se divide en S022A → S022B → S022C, empezando ya por S022A.

---

## 1. Resumen ejecutivo

Catenaccio Studio está exactamente donde DEC-13 y DEC-14 dijeron que debía estar: un PIM interno sobre Supabase + Next.js, con login, RLS owner-based, inventario protegido, y un contrato de puente a WooCommerce ya probado contra producción en modo DRAFT_ONLY (producto dummy 1853 creado y borrado). No hay deriva estratégica. No hay deuda arquitectónica que justifique replantear. La capa de menor riesgo (herramienta interna local) está construida y validada visualmente por Pablo.

El único problema es de **tamaño de sesión**, no de rumbo. S022, como está escrita, mete en un mismo bloque tres cosas que introducen tres riesgos diferentes:

1. **Formulario → Supabase insert** — escritura local, riesgo bajo, valor fundacional.
2. **"Sugerir con Claude" (Anthropic API)** — nueva dependencia externa, nuevo secreto server-side, coste por llamada.
3. **"Crear borrador en WC" (WC REST API write)** — **escritura real contra la tienda viva** `catenacciovintage.com`.

Bundlearlas es precisamente la "mega-sesión" que los guardrails de esta misma sesión piden evitar, y concentra dos secretos nuevos (`ANTHROPIC_API_KEY` + `WP_APP_*`) y la única frontera de escritura-a-producción en un solo commit. La recomendación es dividir, no parar: **S022A (formulario) ya como siguiente sesión**, luego S022B (Claude, shadow-only), luego S022C (Woo Draft bridge, DRAFT_ONLY). El **deploy a Vercel se pospone** hasta que el loop E2E funcione en local — el test de escritura WC de S020B ya demostró que la API funciona desde local, así que desplegar no reduce el riesgo del puente; solo añade superficie pública y dispersión de secretos antes de tiempo.

---

## 2. Estado actual validado

**Preflight (021D):**
- Rama: `main`, tracking `origin/main`.
- Working tree: limpio (sin cambios sin commitear).
- Sync: 0 ahead / 0 behind, sin divergencia remota.
- HEAD: `a0c73d6` (`docs(studio): close workspace seed manual gate`) — coincide con el commit esperado.

**Cadena de sesiones Studio (todas COMPLETED, verificadas en docs + agent_events):**

| Sesión | Entregable | Estado |
|--------|-----------|--------|
| S019 | Data model Supabase MVP: 6 tablas, 7 enums, 15+ índices, vista `inventory_margins`, RLS owner-based, capa genérica + extensión `football_shirt_details` | ✅ aplicado manualmente por Pablo, verify PASS |
| S020 | Contrato puente Studio→WC (DEC-14): DRAFT_ONLY, Application Password, mapeo `meta_data` ACF, idempotencia, error handling | ✅ 5 docs, contrato cerrado |
| S020B | `WC_API_WRITE_ACCESS_TEST`: `POST /wc/v3/products` → draft ID 1853, `meta_data` validada por API | ✅ PASS técnico |
| S020C/D | Schema aplicado a Supabase por Pablo, verify script PASS (18 índices) | ✅ OPERATOR_CONFIRMED_PASS |
| S021 | Scaffold Next.js 15.5.19: auth magic link, `/inventory` + `/inventory/[id]`, middleware, empty/error states | ✅ typecheck/build/lint PASS |
| S021B | Visual review local de Pablo (login PASS, inventory PASS) + fix canónico de GRANTs (`authenticated`, no `anon`) | ✅ PASS |
| S021C | Workspace seed manual (`Catenaccio Vintage` / `catenaccio-vintage`) | ✅ PASS |

**Baseline de seguridad verificado en código (no solo en docs):**
- `studio/lib/supabase/server.ts` y `studio/middleware.ts` usan `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Correcto: la anon key es pública por diseño; la protección real es RLS (`auth.uid() = owner_id`), que está activo.
- `studio/.env.example` solo declara las dos variables `NEXT_PUBLIC_SUPABASE_*`. No hay `service_role` ni `ANTHROPIC_API_KEY` ni `WP_APP_*` en el árbol de la app (grep CLEAN).
- No hay deploy. Los secretos viven solo en `studio/.env.local` (gitignored), local.

**Conclusión:** el estado es sólido, coherente con el contrato, y sin sorpresas. Lo construido es exactamente lo aprobado.

---

## 3. Alineación con DEC-13 / DEC-14

**DEC-13 (RUTA D híbrida — Studio-first + Woo bridge + storefront diferido):** alineación total.
- Supabase = fuente de verdad del inventario ✅ (schema aplicado).
- WooCommerce = destino de publicación, tienda y checkout intactos ✅ (solo se creó/borró 1 draft de prueba; cero cambios de config, pagos, pedidos).
- A0 congelado ✅ (no se ha tocado `catenaccio-a0-child` desde el freeze).
- Storefront público Next.js diferido ✅ (no existe; correcto).
- Vercel "entra YA para la app interna" — **matiz**: la app interna existe pero corre **local**, no en Vercel todavía. Esto **no contradice** DEC-13: DEC-13 dice que Vercel es el destino de la app interna, no que el deploy deba preceder al valor. Desarrollar local primero y desplegar cuando el loop esté probado es la lectura conservadora y correcta.

**DEC-14 (puente DRAFT_ONLY, Application Password server-side, meta_data ACF, idempotencia, sin auto-publicación):** alineación total y ya probada.
- `status=draft` fue el único status usado en S020B ✅.
- Credenciales `WP_APP_*` definidas como server-side, nunca `NEXT_PUBLIC_*` ✅ (y aún no están en la app — entran en S022C).
- `meta_data` ACF con term IDs como strings ✅ (validado por API en 1853).
- Idempotencia (`wc_product_id IS NULL`) contratada ✅ (se implementa en S022C).
- Sin auto-publicación ✅ (regla dura, sin mecanismo que la viole).

**Veredicto de alineación:** el proyecto ejecuta DEC-13/DEC-14 al pie de la letra. Studio sigue resolviendo el problema operativo correcto declarado en Sesión 005b: **el backoffice, no el frontend**. No hay nada que recablear.

---

## 4. Riesgos antes de S022

Ordenados por severidad para el siguiente bloque:

**R1 — Concentración de superficie de riesgo si se hace S022 en bloque (ALTO).**
La S022 grande mete en un commit: un secreto externo (`ANTHROPIC_API_KEY`), un secreto que toca producción (`WP_APP_*`), y la única operación de escritura contra la tienda viva. Un bug o un descuido (un secreto que se cuela en el bundle de cliente, un log sin sanitizar, un loop que crea N drafts) tiene tres vectores a la vez y es más difícil de aislar en review. **Mitigación: dividir.** Un secreto/clase-de-riesgo por sesión.

**R2 — La frontera de escritura-a-producción debe estar aislada (ALTO).**
La línea peligrosa de todo el proyecto es "escribe en `catenacciovintage.com`". Hoy solo S022C la cruza. Si se bundlea con formulario y Claude, esa frontera deja de ser una sesión auditable y pasa a ser un detalle dentro de una sesión grande. Mantenerla sola permite revisión, validación con 1 sola camiseta, y rollback conceptual claro.

**R3 — Anthropic API: dependencia externa nueva con coste y efecto (MEDIO).**
Riesgo de producto bajo (datos propios de Pablo entran, sugerencia sale, Pablo aprueba — human-in-the-loop ya modelado en `ai_suggestions`), pero exige: clave **solo server-side** (Server Action / Route Handler, nunca cliente), control de coste/rate, y **SHADOW_FIRST** estricto (la sugerencia se guarda y se aprueba; **nunca** fluye sola a WC). El data model ya soporta esto (sugerencias versionadas, `triggered_by`, `input_context`).

**R4 — Deploy prematuro dispersa secretos antes de probar valor (MEDIO).**
Desplegar a Vercel antes de que el loop funcione en local mueve `ANTHROPIC_API_KEY` + `WP_APP_*` a un nuevo entorno y expone una URL pública (aunque auth-protegida) sin haber probado el flujo. El test S020B ya demostró acceso WC desde local → el deploy **no de-riesga** el puente. Posponer.

**R5 — Gate de tokens / revisión fría en el borde (MEDIO).**
RULE-01 / DEC-13 fijan: revisión fría a 3 sesiones de implementación sin publicar 1 camiseta E2E; STOP_AND_REPLAN a ~4 sin MVP usable. Contando S021 (scaffold) como impl, la división A→B→C llega a la primera camiseta E2E justo en el borde del gate. **Esto es aceptable solo si el progreso es lineal**: cada sesión cierra con la misma camiseta real avanzando una etapa, sin bucles de rework. El gate de A0 disparó por **bucles de no-convergencia** (7 sesiones preview→resync), no por avance lineal. Si cualquier sub-sesión necesita un 2º pase → STOP_AND_REPLAN. (Mitigación adicional: se permite **fusionar S022A+S022B** si el alcance resulta pequeño, ya que ambas son locales y ninguna toca producción — ver §6.)

**R6 — Validación de precondiciones del formulario (BAJO).**
El contrato (S020 §8.1) define qué campos NOT NULL necesita un item antes de ir a WC (`referencia`, `precio`, `equipo`, `talla`, `ai_suggestion` aprobada). El formulario de S022A debería exigir esos campos para que S022C no falle por datos incompletos.

**R7 — postcss CVE transitiva (BAJO, diferido).**
Aceptada para MVP local. Solo relevante en la frontera pública → tratarla en la sesión de deploy, no ahora.

**No hay ningún riesgo de seguridad/arquitectura que justifique STOP_AND_REPLAN.** Todos son gestionables con división + los guardrails ya contratados.

---

## 5. Evaluación de opciones

| Opción | Qué es | Veredicto |
|--------|--------|-----------|
| **A** | S022 grande: formulario + Claude + WC Draft en una sesión | ❌ **Rechazada.** Concentra 2 secretos + la frontera de escritura-a-producción + dependencia externa en un commit (R1, R2). Es la mega-sesión que los guardrails piden evitar. |
| **B** | S022A: formulario + Supabase insert + detalle; sin Claude ni WC | ✅ **Aceptada como siguiente sesión.** Valor fundacional (hoy el inventario solo se puebla con SQL a mano), riesgo mínimo (escritura local), desbloquea todo lo demás. |
| **C** | S022B: Claude suggestions shadow-only | ✅ **Aceptada como 2ª sesión.** Introduce `ANTHROPIC_API_KEY` aislado, SHADOW_FIRST, sin tocar producción. |
| **D** | S022C: Woo Draft bridge DRAFT_ONLY | ✅ **Aceptada como 3ª sesión.** Aísla la única escritura a producción; cierra el loop E2E; dispara GATE_STUDIO_MVP. |
| **E** | Deploy antes de Woo | ❌ **Rechazada en esa posición.** El deploy no de-riesga el puente (S020B ya probó acceso WC desde local). Mover secretos a Vercel antes de probar el loop añade superficie sin reducir riesgo. Se difiere a **después** del E2E (S022D / S023). |

**Las opciones B, C y D no son excluyentes: son la secuencia.** A es la versión bundleada de B+C+D y se rechaza por agregación de riesgo. E se rechaza solo en su *posición* (antes de Woo); el deploy se hace, pero después.

---

## 6. Recomendación única

**ADJUST_BEFORE_S022 → dividir S022 en tres sub-sesiones lineales, empezando ya por S022A. Deploy diferido a después del E2E.**

```
S022A  Formulario → Supabase        (B)  ← SIGUIENTE SESIÓN
   ↓
S022B  "Sugerir con Claude" shadow  (C)
   ↓
S022C  "Crear borrador en WC" draft (D)  ← cierra loop E2E, abre GATE_STUDIO_MVP
   ↓
S022D / S023  Deploy mínimo Vercel  (E diferida)
```

**Frontera dura de seguridad:** solo **S022C** escribe en `catenacciovintage.com`. S022A y S022B nunca tocan producción.

**Compresión permitida (no obligatoria):** si en S022A el alcance del formulario resulta pequeño, se permite **fusionar S022A + S022B** en una sola sesión local (ambas son locales y ninguna escribe en producción), para respetar mejor el gate de tokens (R5). Lo que **no** se permite es fusionar la escritura a producción (S022C) con nada: esa va sola, siempre.

**Superficie/modo recomendados:** Sonnet o Codex para implementación (guardrail: *no usar Opus para polish*). Local, sin deploy, hasta S022C incluido.

---

## 7. Secuencia propuesta de próximas sesiones

### S022A — STUDIO_CREATE_ITEM_FORM
- **Superficie:** Claude Code (Sonnet) — implementación de app local.
- **Modo:** `LOCAL_APP_IMPLEMENTATION / NO_DEPLOY / NO_WC / NO_AI`.
- **Objetivo:** formulario de alta de camiseta que escribe `inventory_items` + `football_shirt_details` (1:1) vía Server Action; lectura de vuelta en `/inventory` y en el detalle. Exigir los campos NOT NULL que el contrato WC requiere (R6).
- **Criterio de parada:** Pablo crea ≥1 camiseta real desde el formulario en local y la ve en `/inventory` + detalle.
- **Veredicto esperado:** `APPROVE_READY_FOR_S022B`.

### S022B — STUDIO_AI_SUGGESTIONS_SHADOW
- **Superficie:** Claude Code (Sonnet) — local.
- **Modo:** `LOCAL_APP_IMPLEMENTATION / AI_SHADOW_ONLY / NO_WC / NO_DEPLOY`.
- **Objetivo:** acción "Sugerir con Claude" → Server Action → Anthropic API (modelo Claude más reciente apropiado, p. ej. `claude-sonnet-4-6` para coste/latencia) → guardar `ai_suggestions` versionada (precio, título SEO, descripción) → Pablo aprueba/edita. `ANTHROPIC_API_KEY` **solo** server-side. SHADOW_FIRST: la sugerencia nunca fluye sola a ningún sitio.
- **Criterio de parada:** Pablo genera y aprueba una sugerencia para la camiseta real de S022A.
- **Veredicto esperado:** `APPROVE_READY_FOR_S022C`.

### S022C — STUDIO_WC_DRAFT_BRIDGE
- **Superficie:** Claude Code (Sonnet) para implementación + escritura a producción controlada (estilo S020B) para el primer draft real.
- **Modo:** `LOCAL_APP_IMPLEMENTATION / WC_DRAFT_ONLY / NO_DEPLOY`.
- **Objetivo:** implementar el bridge service contratado (DEC-14): precondiciones (§8.1), `status=draft` hardcoded + validación server-side, idempotencia (`wc_product_id IS NULL`), error handling sanitizado, registro en `wc_*` + `item_lifecycle_events`. Botón "Crear borrador en WC" sobre la camiseta aprobada → 1 draft real.
- **Criterio de parada:** 1 camiseta real pasa formulario → Claude-aprobada → draft en WC; Pablo lo verifica en WP Admin → **GATE_STUDIO_MVP** abierto (Pablo publica manualmente).
- **Veredicto esperado:** `APPROVE_E2E_LOOP_PROVEN` (y dispara la revisión fría de tokens, RULE-01).

### S022D / S023 — STUDIO_VERCEL_DEPLOY_MINIMAL (E diferida)
- **Superficie:** despliegue/infra controlado, Vercel.
- **Modo:** `DEPLOY_MINIMAL / SECRETS_TO_VERCEL`.
- **Objetivo:** desplegar la app ya probada; migrar env vars a Vercel server-side; configurar redirect URL de Supabase Auth; tratar la postcss CVE en la frontera pública.
- **Criterio de parada:** Pablo entra a la URL desplegada y el loop E2E funciona en prod.
- **Veredicto esperado:** `APPROVE_STUDIO_LIVE_INTERNAL`. **Solo después** de que el loop esté probado en local.

---

## 8. Qué NO construir todavía

- **Deploy a Vercel** — hasta que el loop E2E funcione en local (R4).
- **Upload de imágenes / Supabase Storage** — Pablo añade fotos manualmente en WP Admin en MVP (contrato §3).
- **Vinted tracking / recordatorios** — post-MVP.
- **UI completa del pipeline de 11 estados, filtros, columnas masivas** — la captura es la base; la vista rica viene después.
- **Import masivo de Excel (`STOCK.xlsx`)** — solo tras validar el flujo con altas individuales.
- **WC `PUT` (update de draft) / `DELETE`** — diferido a S023+ por contrato; cleanup solo manual por Pablo.
- **Creación de términos WC automática** — prohibido (rompe taxonomía / Filtro Camisetas Pro).
- **Cualquier cosa de marketplace / sharing / multi-tenant más allá de `owner_id`** — PEND-2 NORTH_STAR.
- **Storefront público headless** — diferido hasta tracción.
- **Auto-publicación de cualquier tipo** — regla dura permanente.
- **Polish de UI más allá del MVP** — y nunca con Opus.

---

## 9. Guardrails para la siguiente implementación

1. **DRAFT_ONLY duro:** `status="draft"` hardcoded + validación server-side antes de cualquier `POST` a WC. Sin botón, flag ni ruta de publicación.
2. **SHADOW_FIRST para Claude:** la sugerencia se guarda y la aprueba Pablo; nunca se aplica sola a WC.
3. **Una sola frontera de escritura-a-producción:** solo S022C toca `catenacciovintage.com`. S022A y S022B jamás.
4. **Secretos solo server-side:** `ANTHROPIC_API_KEY`, `WP_APP_USER`, `WP_APP_PASSWORD` solo en Server Actions / Route Handlers. **Nunca** `NEXT_PUBLIC_*`. Nunca en logs. `wc_error` y `wc_payload_snapshot` sanitizados (sin auth).
5. **Idempotencia:** `wc_product_id IS NULL` antes de `POST`; si no, STOP `draft_already_exists`.
6. **Sin tocar config WC ni emails (PATTERN-08):** si una tarea lo requiere → STOP y resolver el email gate primero.
7. **Validar con 1 camiseta real antes de cualquier lote.**
8. **Progreso lineal:** misma camiseta avanza una etapa por sesión. Cualquier bucle de rework → STOP_AND_REPLAN (RULE-01).
9. **No deploy hasta E2E probado en local.**
10. **Implementación con Sonnet/Codex, no Opus.**

---

## 10. Criterio de parada del próximo bloque

**Cierre del bloque (objetivo del conjunto S022A→S022C):** 1 camiseta real recorre `formulario → sugerencia Claude aprobada → borrador en WC → Pablo publica manualmente desde WP Admin`. Eso abre GATE_STUDIO_MVP (luego 5–10 camisetas, medir tiempo/camiseta vs. los ~45 min actuales).

**Cierre por sub-sesión:**
- S022A cierra cuando Pablo crea ≥1 camiseta real por formulario y la ve en inventario + detalle.
- S022B cierra cuando Pablo aprueba una sugerencia Claude para esa camiseta.
- S022C cierra cuando esa camiseta se convierte en draft WC verificado por Pablo.

**STOP_AND_REPLAN si:**
- Cualquier sub-sesión necesita un 2º pase de rework sin converger.
- Un secreto tendría que tocar el browser para que algo funcione.
- El bridge no puede crear un draft de forma idempotente.
- Pasan ~4 sesiones de implementación sin 1 camiseta E2E (RULE-01 / DEC-13).

---

*Sesión 021D — 2026-06-27 — Claude Code Opus. Modo READ_ONLY_STRATEGIC_REVIEW / NO_IMPLEMENTATION / NO_REMOTE_WRITE. Veredicto: `ADJUST_BEFORE_S022`.*
