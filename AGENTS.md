# AGENTS.md — Catenaccio Vintage

Contrato corto para agentes de implementación (Claude Code / Codex / Antigravity). Equivalente operativo al ORCHESTRATOR.md pero para agentes directos.

**Proyecto:** Catenaccio Vintage  
**Stack:** WordPress 7.0 + WooCommerce 10.8.1 (producción activa). Elementor Pro expira ~2026-07-01, operador no renueva. Sin SSH (Raiola). Stack TARGET pendiente de decisión.

---

## Superficies de implementación soportadas

El orquestador (ChatGPT) elige la superficie según la tarea. El agente ejecuta — no decide la superficie.

| Superficie | Cuándo es la mejor opción | Cuándo evitar |
|------------|--------------------------|---------------|
| **Antigravity (Gemini)** | Discovery visual: capturas WP Admin, Site Health, análisis amplio; propuestas TARGET_OPTIONS; validación visual de UI; browser, integración Google | patches PHP/CSS sin UI |
| **Sonnet (Claude Code)** | WordPress/WooCommerce legacy: PHP, CSS, plugins, templates, debugging funcional, patches frágiles, cierre documental preciso | decisiones arquitectónicas (→ escalar Opus) |
| **Opus (Claude Code)** | TARGET_OPTIONS final, arquitectura core, migración, seguridad crítica, decisiones irreversibles, veredictos APPROVE/STOP | implementación rutinaria o docs (over-spend) |
| **Codex** | Scripts deterministas, validaciones técnicas acotadas, checks de servidor | tareas con contexto amplio o UI |

Reglas:
- Antigravity por defecto cuando el resultado requiere "ver" (browser, capturas, WP Admin, UI, validación visual).
- Sonnet para WP/WC legacy y patches concretos en PHP/CSS/templates.
- Opus solo para decisiones estratégicas o evaluación de bloqueos.
- Codex para scripts y validaciones acotadas sin UI.
- **Stop-loss:** si un agente no converge tras 1–2 iteraciones, parar. Clasificar el fallo: ¿superficie equivocada (→ cambiar agente)? ¿contexto insuficiente (→ reformular prompt)? ¿problema arquitectónico (→ escalar Opus)? No insistir con el mismo agente esperando resultado diferente.

El prompt específico para cada superficie está en `prompts/`. Para Antigravity: `prompts/prompt_antigravity_impl.md`.

---

## Cold-start por capas

Al abrir una sesión de agente, cargar en este orden y no más:

```
PROJECT_BOOTSTRAP.md -> AGENTS.md -> routing activado (superficie elegida en la tabla de arriba) -> documentos de la tarea concreta
```

No leer documentos de otra superficie ni metodología completa de lafabrica "por si acaso". Si la
tarea necesita más contexto del que el prompt trae, parar y pedir al orquestador que lo reformule
(regla ya existente abajo, "Lectura mínima al inicio de sesión").

---

## Lectura mínima al inicio de sesión

Leer en este orden. No leer más de lo necesario:

1. `CONTEXTO.md` — fase actual y experimento activo (primeras 50 líneas)
2. `BACKLOG.md` — ítem específico asignado en este prompt
3. El archivo relevante a la tarea (solo el necesario)
4. `docs/meta/AGENT_EXPERIENCE_LEDGER.md` — si la tarea es de tipo registrado (CSS_THEME_CHILD, SHADOW_RELEASE, WC_API, WC_EMAIL_FLOW, WOOCOMMERCE_HOOK_PATCH)

Si hace falta más contexto del repo para ejecutar la tarea → **parar y pedir al orquestador que reformule el prompt**. El contexto debe estar en el prompt; no es trabajo del agente descubrirlo.

---

## Razonamiento por defecto

- **Reasoning effort:** normal salvo indicación explícita
- **Scope:** el ítem del BACKLOG.md indicado en el prompt, nada más
- **Default para features nuevas:** OFF hasta que haya decisión explícita en DECISIONS.md

---

## Regla Codex ASK → CODE

Si la tarea llega como read-only / ASK, no modificar archivos. Devolver diagnóstico, plan, riesgos, archivos candidatos, validación y veredicto `CODE` / `NO_CODE` / `ESCALAR`. No pasar a implementación en la misma sesión salvo instrucción explícita del orquestador.

---

## Guardrails genéricos (siempre aplican)

- No modificar archivos fuera del scope de la tarea
- No introducir dependencias nuevas sin decisión documentada en DECISIONS.md
- No hacer refactor mientras resolvés un bug (scope creep)
- No commitear cambios sin descripción clara del qué y el por qué
- No implementar "mientras tanto" sin marcar como temporal en el código
- Primero evidencia, luego código: si el problema no está confirmado → no parchear
- Si el diagnóstico read-only deriva en decisión arquitectónica → cerrar y escalar a Opus

---

## Guardrails del dominio

**UI DESIGN GATE — leer `DESIGN.md` antes de tocar UI:**
- Antes de cualquier tarea que toque UI, layout, estilos, componentes visuales, navegación, copy de interfaz, fichas de producto, filtros, búsqueda, cards, tablas, estados visuales o feedback: leer `DESIGN.md` primero. Es el contrato visual local de Catenaccio.
- No inferir identidad de marca desde el CSS actual del repo. Los placeholders navy/rojo (`studio/styles/globals.css`, `catenaccio-a0-child/assets/css/cv-a0.css`) son deuda visual, no identidad — la marca es el verde `#1E5929` (`#155c2c` = legacy en migración).
- Si la petición contradice `DESIGN.md` → parar y pedir decisión al orquestador. No proceder por iniciativa propia.
- Cambios UI por delta sobre lo aprobado, nunca rediseño desde cero.
- Studio (`studio/`, backoffice PIM, activo) y storefront (`catenaccio-a0-child/`, público, **congelado/diferido salvo instrucción explícita**) son superficies distintas con densidad y estética propias (DESIGN.md §4-6). No aplicar estética de tienda a Studio ni densidad de dashboard al storefront.
- No cambiar tokens globales (paleta, tipografía, espaciado base) como efecto lateral de una tarea acotada.

**Catenaccio Vintage — WordPress/WooCommerce activo:**
- No tocar código WordPress, plugins, temas, DB ni wp-config.php sin autorización explícita en el prompt.
- Sin SSH (Raiola Inicio SSD 2.0). WP Admin / WC Status / Site Health es la vía de acceso aceptada y permanente. No bloquear sesiones por falta de SSH.
- Elementor Pro expira ~2026-07-01. Operador no renueva. No bloquear discovery por esto.
- Validación visual: cualquier cambio con efecto visible en la web requiere OK de Pablo antes de commit/push/deploy. Lint y type-check no sustituyen validación visual.
- Microparches WordPress (cuando lleguen): diagnóstico → contrato visual explícito → evidencia controlada (WP Admin / capturas) → cambio mínimo → OK visual Pablo → commit.
- No tomar decisiones de arquitectura sin escalar a Opus.

**Email transaccional WooCommerce — PRODUCTION_ONLY_VALIDATION:**
- Cualquier tarea que involucre emails de WooCommerce (confirmación de pedido, activación de cuenta, recuperación de contraseña, notificaciones de estado) debe declararse `PRODUCTION_ONLY_VALIDATION` antes de abrirse.
- Staging sin SMTP real no puede validar recepción. Declarar la limitación antes de la primera sesión, no después de 3 intentos fallidos. (RULE-03 / DEC-PABLO-03 del Operating Brain; PATTERN-08 de lafabrica)
- TEST B obligatorio: pedido o cuenta nueva real → verificar recepción en bandeja real. El bloque no se cierra como PASS sin TEST B. (DEC-PABLO-02)
- Antes de cualquier tarea de email: verificar si WP Mail SMTP está instalado y configurado.

**WooCommerce hooks — usar estado del objeto, nunca contexto de ejecución:**
- Para discriminar dentro de un hook WC, usar siempre estado persistente del objeto (Order/Customer), no request params, controller class ni URL path. (PATTERN-09 / ORCHESTRATOR.md §19)
- Ejemplo estable: `$order->get_customer_id() > 0 && !$order->get_meta('_guest_checkout')`.
- Ejemplo frágil (evitar): `is_checkout()`, `$_SERVER['REQUEST_URI']`.
- Si el approach de detección de contexto falla 3 veces con el mismo síntoma → STOP_AND_REPLAN (RULE-01 / PATTERN-07).

**Catenaccio Studio — formularios/product UI:**
- Los agentes CODE no deben introducir labels técnicos, nombres de sesiones, roadmap interno, IDs visibles ni valores internos en UI salvo pantalla explícitamente técnica.
- Si hay ambigüedad de dominio en campos, labels, title builder, taxonomías, autenticidad, condición, versión o mapping Woo, activar `DOMAIN_PRODUCT_MODELING_GATE` antes de CODE. Ver `docs/studio/STUDIO_PRODUCT_FORM_MODELING_PLAYBOOK.md`.
- Si Pablo detecta 2+ microfixes de UI/dominio en la misma línea, parar microparches y pedir modelado breve antes del siguiente patch.

---

## Modos de operación del proyecto

_(completar si el proyecto tiene modos diferenciados)_

Ejemplo: si el proyecto tiene un modo "observación" y uno "acción", documentar aquí cuándo aplica cada uno y qué puede tocar el agente en cada modo.

---

## Reglas de cierre para agentes

Al finalizar una sesión, el agente debe:

```
[ ] Commitear todos los cambios con mensaje descriptivo
[ ] Actualizar CONTEXTO.md (append — nunca replace_all)
    → Una línea: Sesión N (fecha, Agente): MODO / tipo. [Qué se hizo]. [Qué se validó]. [Qué NO se tocó].
[ ] Agregar entrada en HISTORIAL_SESIONES.md (append-only)
[ ] Registrar evento en agent_events.jsonl
[ ] Actualizar BACKLOG.md: mover ítems completados
[ ] Reportar al orquestador: resultado + siguiente paso recomendado
```

**Regla crítica:** CONTEXTO.md e HISTORIAL_SESIONES.md son append-only. Nunca replace_all, nunca editar entradas pasadas.

---

## Formato de reporte al orquestador

Al cerrar sesión, devolver exactamente:

```
SESIÓN: [N] — [título de la tarea]
MODO: [LITE / NORMAL / FULL]
RESULTADO: [COMPLETED / PARTIAL / BLOCKED]
QUÉ SE HIZO: [una línea]
QUÉ SE VALIDÓ: [una línea o "sin validación en esta sesión"]
QUÉ NO SE TOCÓ: [explícito — no "nada fuera del scope"]
SIGUIENTE PASO: [una acción concreta o DEFER_STOP]
```

**SESSION_LEARNING_TRANSFER (opcional — incluir solo si hay aprendizaje genuinamente transferible):**

```
SESSION_LEARNING_TRANSFER:
  project_value:
    [qué valor deja para este proyecto — o "No aplica"]

  lafabrica:
    [qué patrón, workflow, criterio, prompt, guardrail o metodología mejora el sistema operativo — o "No aplica"]

  brain:
    evidence:
      [qué evidencia profesional deja — o "No aplica"]
    skills:
      [qué capacidad demuestra — o "No aplica"]
    service_angle:
      [qué servicio podría alimentar — o "No aplica"]
    content_angle:
      [qué post, reflexión o narrativa pública podría salir — o "No aplica"]
    portfolio_asset:
      [qué caso, prueba o activo de portfolio puede crear — o "No aplica"]

  future_product:
    [insight para producto futuro — o "No aplica"]

  no_copy:
    [qué NO debe transferirse ni publicarse — obligatorio si hay riesgo; poner la categoría, nunca el dato privado]

  privacy_level:
    [PUBLIC_SAFE / INTERNAL_ONLY / PRIVATE_DO_NOT_EXPORT]
```

Omitir el bloque si no hay aprendizaje real. No usar en microajustes rutinarios, correcciones de texto o cierres técnicos sin aprendizaje nuevo.
Si hay algo para `lafabrica`, añadirlo también a `docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md` del proyecto.

> **Alias legacy:** `BRAIN_TRANSFER` era el nombre anterior de este bloque en el Brain.
> `DOBLE_ROI` era el nombre de este bloque en lafabrica. Ambos alias son válidos en repos que aún no migraron.
> El estándar actual es `SESSION_LEARNING_TRANSFER`.

---

## Patrón de Workflow "Antigravity 2.0"

Al usar la superficie Antigravity para integraciones web o manipulación de UI, sigue este patrón configurable:
- **Project + Local:** Usa el mismo Project de origen y tu entorno local para trabajo secuencial.
- **Bloque cerrado:** Inicia una nueva conversación solo por cada bloque operativo cerrado.
- **Iteración:** Usa la misma conversación para corrección, validación y cierre de ese bloque. No abras sesiones nuevas para microcorrecciones.
- **Worktree por outcome:** un worktree pertenece al outcome que persigue, no a la superficie de agente que lo abrió. Usalo para cualquier outcome coherente que necesite su propio árbol de trabajo — no solo para "trabajo paralelo o ramas experimentales". Agentes secuenciales (Antigravity, Sonnet, Codex) pueden compartir el mismo worktree mientras trabajen sobre el mismo outcome, con el mismo riesgo y el mismo nivel de autonomía (ver ORCHESTRATOR.md §33). Si alguno de los tres cambia, abrí un worktree nuevo en vez de reusar el actual.
- **Implementación y validación:** Utiliza el IDE para la implementación local, el terminal para scripts, y la UI del navegador para validaciones visuales obligatorias.

---

## STOP_AND_REPLAN — cuándo activar en Catenaccio

Activar STOP_AND_REPLAN (PATTERN-07 lafabrica) cuando:
- 3 o más microparches sobre el mismo approach fallan con el mismo síntoma.
- TEST B (validación funcional real) falla consistentemente aunque el código parezca correcto.
- El código se vuelve más complejo con cada intento, no más simple.
- El agente lleva ≥3 sesiones sobre el mismo issue sin convergencia.

**Protocolo:**
1. STOP — declarar explícitamente que el approach está agotado.
2. COLD_REVIEW — agente diferente, sin contexto del intento anterior.
3. SIMPLIFY — buscar el discriminador más estable y directo disponible.
4. REPLAN — documentar el nuevo approach antes de implementarlo; registrar callejones en `docs/meta/AGENT_EXPERIENCE_LEDGER.md`.
5. TEST_PLAN — identificar si la validación requiere producción real; declararlo antes de gastar sesiones en staging.

---

## Guardrails de calidad derivados de proyectos reales

Los siguientes guardrails se derivan de aprendizajes observados en proyectos reales gestionados con lafabrica. Aplican como comportamiento por defecto salvo instrucción explícita en contrario.

**Validación visual como prerequisito de commit cuando hay UI.**
Si la tarea tiene componentes de interfaz de usuario, no commitear hasta haber visto el resultado real en el navegador o la herramienta de destino. Los tests y el type-checking verifican corrección del código, no corrección de la experiencia de usuario.

**Stop-loss tras 1–2 iteraciones fallidas en el mismo punto.**
Si el agente falla dos veces seguidas en el mismo problema sin avance verificable, parar y reportar al orquestador con diagnóstico claro. Clasificar el fallo: ¿superficie equivocada (→ cambiar agente)? ¿contexto insuficiente (→ reformular prompt)? ¿problema arquitectónico (→ escalar Opus)? No continuar escalando el scope de los intentos ni insistir con el mismo agente.

**No crecer mientras el flujo crítico falla.**
Si hay un bloqueo en el flujo principal del proyecto (la funcionalidad central no funciona), no implementar features secundarias ni mejoras de calidad hasta que el flujo crítico esté resuelto. El backlog refleja este orden de prioridades.

**No convertir infraestructura o documentación en el proyecto principal.**
El objetivo de lafabrica es producir proyectos que resuelvan problemas reales. Si la sesión deriva en construir más tooling o documentación en lugar de avanzar el proyecto hijo, reportar al orquestador y reevaluar prioridades.

**No copiar fuentes desordenadas al repo sin saneamiento.**
Los archivos brutos de la Controlled Intake Folder no se copian directamente al repositorio. Solo el conocimiento estructurado, saneado y validado entra como documentación del proyecto. Ver `docs/orchestrator/discovery_intake_pack/DATA_AND_PRIVACY_BOUNDARIES.md`.

**Ramas `wip/*-rejected` para experimentos fallidos si procede.**
Si se inicia una línea de implementación que no funciona y no vale la pena continuar, crear una rama `wip/<descripción>-rejected` con el trabajo experimental antes de descartarla. Esto evita perder el contexto del intento fallido si se quiere revisar más tarde.

---

## Preflight fundamentado en repo — PATTERN-16 REPOSITORY_GROUNDED_PREFLIGHT

Antes de escribir, el agente deriva su estado de partida del propio repositorio — no de lo que
recuerda de sesiones anteriores. Tres sujetos exactos:

**IMPACT** — qué superficies reales toca esta tarea (archivos, sistemas externos, runtime).
Determinado leyendo el repo, no asumido desde el prompt.

**BASELINE / BASELINE_HEAD** — el estado aprobado desde el que se parte. `BASELINE_HEAD` es el
`local_head` congelado al abrir sesión (ver ORCHESTRATOR.md §22). Restaurar algo "a un estado que
se recuerda bueno" sin comprobar `BASELINE_HEAD` puede borrar en silencio capacidades aprobadas
después de ese estado.

**NORMATIVE_STATE** — cómo se relaciona esta tarea con la norma vigente del repo:

- `EXTENDS` — añade sin contradecir ninguna regla existente.
- `SUPERSEDES` — reemplaza una regla anterior explícitamente (debe declararse cuál).
- `CONFLICTS` — contradice una regla vigente sin resolverla → **`STOP_FOR_OWNER_DECISION`**. No se
  resuelve por iniciativa del agente.

No se mantienen registros manuales aparte de owners, capacidades aprobadas o normas — el repo es la
única fuente; un registro paralelo llevado a mano queda prohibido por este mismo patrón.

---

## ASSIGNMENT + DECISIONS_ALREADY_CLOSED

Todo prompt de tarea trae como mínimo un `ASSIGNMENT` (qué se pide, en una línea) y, cuando
aplica, un bloque `DECISIONS_ALREADY_CLOSED` con las decisiones del operador que no se deben
reabrir durante la ejecución (ver ORCHESTRATOR.md §24, §28). El agente no vuelve a preguntar algo
que ya está en `DECISIONS_ALREADY_CLOSED`.

---

## Niveles de autonomía y de riesgo

Ver ORCHESTRATOR.md §29 (`A0`-`A3`) y §30 (`R0`-`R3`). Resumen operativo para el agente:

- Nunca asumir un nivel de autonomía mayor al declarado explícitamente en el prompt.
- `git status`/`git log`/`git diff` (lectura) no requieren ningún nivel — son siempre permitidos.
  Commitear ya requiere `A2`; pushear o escribir en un sistema externo requiere `A3` con la
  superficie nombrada explícitamente.
- Ante `R2` (mismo síntoma, dos intentos sin avance), cambiar de método o superficie antes de un
  tercer intento — no seguir insistiendo con el mismo approach.

---

## Frontera de escrituras externas — PATTERN-14 + MR-012.6

Catenaccio tiene superficies reales de escritura externa activa en Studio (integración WooCommerce
— ver `SHADOW_FIRST_WOO_ATTACH_PATTERN` y `WOO_WRITE_SYNC_FOUNDATION_WITH_FABLE_ULTRACODE` en
`docs/meta/AGENT_EXPERIENCE_LEDGER.md`). **`risk_live: YES`.** Esto no autoriza ninguna escritura
nueva ni cambia el runtime — es una declaración de que el riesgo ya existe y debe respetarse:

- Cualquier escritura hacia Woo, Vercel o Supabase necesita autoridad explícita en el prompt (nivel
  `A3` + superficie nombrada), sin excepción, incluso si la tarea "solo" toca código adyacente.
- Toda capa de escritura externa sigue la disciplina ya operativa en Studio: módulo único de
  escritura con whitelist reconstruida campo a campo (nunca passthrough del payload), relectura
  fresca antes de escribir, distinción entre fallo de lectura previa y fallo de escritura real, y
  log de evento por cada acción.
- Ante `STOP_LOSS` (ORCHESTRATOR.md §30) durante una tarea que ya inició una escritura externa,
  retorno inmediato — no seguir intentando variantes de la misma escritura sin nueva autorización.
- Validar cualquier propuesta de patch sobre la frontera causal real (qué estado externo cambia),
  no sobre la intención declarada del patch.

No confundir esto con permiso de lectura: `AUDIT`/discovery read-only sobre Woo (WP Admin, WC
Status, WC REST API en modo lectura) sigue sin requerir `A3`.

---

## Recuperación del AGENT_EXPERIENCE_LEDGER antes de búsqueda amplia — MR-014.1 RETRIEVABLE_EXPERIENCE

Antes de abrir una búsqueda amplia sobre un bug, incidente o tarea recurrente, consultar primero
`docs/meta/AGENT_EXPERIENCE_LEDGER.md` por el disparador en lenguaje natural que mejor describe la
tarea (ver la capa de recuperación al final de ese archivo). Si hay una entrada aplicable:

1. Recuperar el camino conocido documentado.
2. Reusarlo como primer intento.
3. Si funciona, marcar la entrada como `CONFIRMED_BY_REUSE` al cerrar (no basta con "parece que
   aplicó" — el criterio es recuperar → reusar → completar con éxito).

Un aprendizaje escrito en el Ledger pero nunca recuperado en una tarea real no cuenta como adopción
válida del patrón — la cosecha es proporcional al cierre real, no automática.

---

## Solución suficiente — no microfix recursivo

Cerrar una tarea al pasar su `DONE_BAR`, no seguir puliendo más allá de lo pedido. Si aparece una
incidencia menor que no cambia la frontera del bloque (mismo archivo, mismo alcance, sin nueva
superficie tocada), resolverla dentro del bloque actual. Si cambia la frontera (nuevo archivo fuera
de scope, nueva superficie externa, nueva decisión de producto), no resolverla por iniciativa
propia — reportar y pedir alcance nuevo.

---

## Context delta only

Al continuar una sesión ya abierta con el mismo agente, transmitir solo lo que cambió desde el
último mensaje — no repetir el estado completo del repo, del prompt original ni de decisiones ya
confirmadas.

---

## Reglas Orca outcome-owned

Ver ORCHESTRATOR.md §33 (ORCA EXECUTION SURFACE) para el contrato completo. Resumen para el agente
implementador:

- El worktree en el que trabajás pertenece al outcome de la tarea, no a vos como agente. Si el
  outcome, el riesgo o el nivel de autonomía cambian, es una tarea nueva — no sigas escribiendo en
  el mismo worktree sin confirmar que sigue aplicando.
- No sos el único posible modificador de ese worktree — no asumas que nadie más lo va a tocar en
  paralelo.
- No elimines tu propio worktree ni tu propia branch al cerrar, aunque el trabajo esté promovido.
  El cleanup es una decisión separada (ver `READY_TO_ARCHIVE_IN_ORCA` en ORCHESTRATOR.md §33).
- Si necesitás apartar trabajo temporalmente, preferí un commit `WIP` a un `git stash` desnudo — el
  stash es compartido entre worktrees y otra sesión puede estar usándolo.

---

## Guardrails preservados sin cambio (verificación explícita, MR-014)

Este delta no modifica ni debilita: `PABLO_VISUAL_OK` (RULE-02, ORCHESTRATOR.md §19), `TEST B`
(DEC-PABLO-02), `UI_DESIGN_GATE` (ver "Guardrails del dominio" arriba), el guardia de estado
WooCommerce por objeto (PATTERN-09, "WooCommerce hooks — usar estado del objeto"),
`STOP_AND_MODEL_DOMAIN` / `DOMAIN_PRODUCT_MODELING_GATE` ("Catenaccio Studio — formularios/product
UI"), ni el freeze del storefront (`catenaccio-a0-child/` congelado/diferido salvo instrucción
explícita, "UI DESIGN GATE").

---

## Kill switch

Sin deploy productivo en el arranque. Kill switch lógico: variable de entorno `PROJECT_DISABLED=1` en `.env` local que cualquier entrypoint debe respetar antes de tocar datos reales. Confirmar antes de cualquier sesión FULL.

Si el kill switch está activo → no deployar, no modificar runtime, reportar al orquestador y cerrar sesión.

## Guardrails del perfil internal-suite

- No tocar producción sin autorización explícita en el prompt de la sesión.
- No commitear datos reales: trabajar con fixtures en `data/` (que está ignorado por defecto).
- No commitear credenciales bajo ninguna circunstancia. Vivir en `.env` local.
- No conectar contra DB real desde sesiones de implementación: usar export estático o mock.
- No instalar dependencias nuevas sin decisión registrada en DECISIONS.md.
