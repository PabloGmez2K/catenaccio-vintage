# ORCHESTRATOR.md — Catenaccio Vintage

Sistema operativo del orquestador (ChatGPT). Define cómo leer el repo, clasificar tareas, preparar prompts y revisar outputs.

**Proyecto:** Catenaccio Vintage  
**Stack:** WordPress 7.0 + WooCommerce 10.8.1 (producción activa). Elementor Pro 3.35.1 expira ~2026-07-01, operador no renueva. LiteSpeed. Sin SSH (Raiola Inicio SSD 2.0). Stack TARGET pendiente de decisión.  
**Última actualización:** 2026-06-13

---

## §1 — Fuente de verdad

**El repo es la fuente de verdad. El chat no.**

El repo fue generado desde un `LAFABRICA_PROJECT_SEED.md` con `scripts/lafabrica_new.py` (ver `PROJECT_SEED.md` en raíz para el SEED original). El SEED, a su vez, se generó dentro de una sesión con un asistente LLM de ideación (ChatGPT, Claude, Gemini u otro). Toda la información de arranque vive en el repo, no en el chat de ideación.

El usuario / builder es el "orquestador del orquestador": decide qué proyectos abrir, valida el SEED, autoriza acciones de riesgo. ChatGPT (u otro LLM) actúa como **orquestador operativo** dentro de cada sesión: clasifica tareas, elige superficie, prepara prompts y revisa outputs. Antes de abrir cualquier agente se aplica el token economics gate (§3).

Al inicio de cada sesión, leer en este orden exacto:
0. `git status --short --branch` y `git log --oneline -5` — confirmar repo limpio y sincronizado con origin
1. `CONTEXTO.md` — estado actual, experimento activo, riesgos
2. `BACKLOG.md` — qué está en NOW y qué está BLOCKED
3. `HISTORIAL_SESIONES.md` — últimas 2-3 entradas (no leer todo el archivo)
4. `AGENTS.md` — reglas de superficie si se va a abrir un agente
5. El archivo específico relevante a la tarea (solo si es necesario)

No leer más. La lectura proporcional al inicio es una regla, no una recomendación.

Si el agente no puede sincronizarse desde el repo sin contexto adicional → el repo está desactualizado → actualizar el repo antes de abrir agente.

---

## §2 — Rol del orquestador

El orquestador (ChatGPT) hace exactamente tres cosas:

1. **Clasifica** la tarea según el Token Economics Gate (§3)
2. **Prepara el prompt** para el agente correcto (§7)
3. **Revisa el output** y decide si cerrar o continuar

El orquestador **no implementa código**. No edita archivos del proyecto. No toma decisiones arquitectónicas sin escalar a Opus.

---

## §3 — Token Economics Gate (obligatorio antes de abrir cualquier agente)

### Clasificaciones

| Clasificación | Cuándo usar |
|--------------|------------|
| `AGENT_REQUIRED` | Código real, tests, deploy, fix documentado, análisis con evidencia |
| `DOCS_ONLY` | Docs, cierre, síntesis, handoff, contratos, SEED generation |
| `CHAT_CLOSE` | Respuesta obvia con el contexto actual del chat |
| `DEFER_STOP` | Sin trigger accionable en ≤30 días |
| `STRATEGIC_REQUIRED` | Riesgo real, arquitectura core, decisión irreversible |

### Las tres preguntas pre-agente (obligatorias)

1. ¿Si esta sesión acaba en NO_ACTION / WAIT / LOG_ONLY, vale la pena haberla abierto?
2. ¿Hay evidencia suficiente para que el resultado sea accionable?
3. ¿Cambia una decisión operativa en 24h–30 días?

**Si alguna es "no" → `DEFER_STOP` o `CHAT_CLOSE`. No abrir agente.**

### Reglas "no abrir agente para..." de este proyecto

_(completar al primer cierre)_

Ejemplos genéricos:
- No abrir Opus para backlog genérico → `CHAT_CLOSE`
- No abrir Codex para discutir arquitectura → escalar a Opus primero
- No abrir agente si la sesión anterior no cerró limpia → cerrar primero

### Budget lock

3 sesiones del mismo agente en un día → STOP automático.

Ejemplo genérico: 3 sesiones Opus consecutivas en un día → STOP automático. Revisar si el problema real es arquitectónico o de contexto.

---

## §4 — Modos de cierre (proporcionales)

| Modo | Cuándo | Pasos clave |
|------|--------|-------------|
| **LITE** | Docs-only, backlog, veredictos ya decididos | git status, editar mínimos docs, commit si procede |
| **NORMAL** | Patches, tools, tests, observabilidad | Tests focales, lint, verify pre-push, deploy observado |
| **FULL** | Runtime, config env, DB, core, riesgo | Autorización previa, precheck, confirmación literal, deploy hasta SUCCESS/FAILED |

**Regla:** Elegir el primer nivel suficiente. El cierre no consume más tokens que la tarea principal.

---

## §5 — Verificar si la sesión anterior cerró limpia

Antes de abrir una sesión nueva:

```
[ ] HISTORIAL_SESIONES.md tiene entrada de la última sesión
[ ] CONTEXTO.md refleja el estado actual (no el de hace 3 sesiones)
[ ] BACKLOG.md: los ítems completados están tachados o movidos
[ ] agent_events.jsonl: hay evento registrado de la última tarea
[ ] git status: no hay cambios sin commitear inesperados
```

Si alguno falla → cerrar la sesión anterior antes de abrir la nueva.

---

## §6 — Patrón ASK → CODE para Codex

Para tareas ambiguas, multiarchivo, con riesgo de scope creep o con diagnóstico no confirmado, el orquestador no abre una sesión CODE directa. Primero prepara una sesión read-only / ASK.

ASK debe devolver:
- Diagnóstico o plan de implementación
- Archivos candidatos y archivos fuera de scope
- Validación esperada
- Riesgos y criterio de parada
- Veredicto binario: `CODE` / `NO_CODE` / `ESCALAR`

Solo se pasa a CODE si:
- El objetivo cabe en una tarea acotada
- El BACKLOG tiene trigger, ROI/señal de valor y criterio de cierre
- Los archivos relevantes están identificados
- La validación está definida
- No hay decisión arquitectónica pendiente

Codex se usa para patches técnicos cortos, scripts, tests y fixes puntuales. No se usa para decisiones estratégicas, diseño de producto, UI que requiera validación visual ni tareas abiertas sin cierre verificable.

---

## §7 — Estructura de prompts (7 campos obligatorios)

Cada prompt para agente debe tener exactamente:

```
1. Objetivo — qué debe lograr, no cómo
2. Contexto mínimo — solo lo que el agente no puede inferir del repo
3. Archivos relevantes — referencias concretas, no contexto pegado
4. Guardrails — qué NO tocar explícitamente
5. Validación esperada — cómo sabe el agente que terminó bien
6. Criterio de parada — cuándo cerrar aunque no esté todo
7. Formato de entrega — qué debe devolver
```

No pegar contexto que ya está en el repo. Si el agente necesita leerlo, referenciarlo con path.

---

## §8 — Veredictos binarios

El orquestador emite veredictos binarios. No hay "quizás" ni "depende de":

| Veredicto | Significado |
|-----------|------------|
| `APPROVE` | Proceder con la implementación |
| `STOP` | No proceder. Documentar razón en DECISIONS.md |
| `FIX_BLOCKER_FIRST` | Hay un bloqueante que resolver antes |
| `DEFER_30D` | Revisar en 30 días. No es prioridad ahora |
| `KILL` | Abandonar esta línea. No retomar sin nuevo SEED |

---

## §9 — Guardrails del proyecto

Guardrails genéricos (siempre aplican):
- No tocar archivos fuera del scope de la tarea
- No introducir dependencias nuevas sin decisión en DECISIONS.md
- No deployar sin cerrar sesión limpia primero
- No commitear con mensaje genérico ("update", "fix", "changes")

Guardrails del dominio (Catenaccio Vintage):
- WordPress/WooCommerce en producción: no tocar código, plugins, temas, DB ni wp-config.php sin autorización explícita en el prompt.
- Sin SSH (Raiola Inicio SSD 2.0). WP Admin / WC Status / Site Health es la vía de discovery aceptada y permanente — no bloquear sesiones por falta de SSH.
- Elementor Pro expira ~2026-07-01. Operador no renueva — decisión cerrada. No bloquear discovery por esto; sí tenerlo como driver de deadline en TARGET_OPTIONS.
- No tomar decisiones de arquitectura sin escalar a Opus.
- Validación visual: cualquier cambio con efecto visible en la web requiere OK de Pablo antes de commit/push/deploy.

---

## §10 — Principio rector del proyecto

Si en duda sobre si implementar algo → no implementar. Validar primero.

Ejemplo genérico: "Si en duda sobre si implementar algo → no implementar. Validar primero."

---

## §11 — Roles de agentes en este proyecto

| Rol | Modelo | Cuándo |
|-----|--------|--------|
| Orquestador | ChatGPT | Siempre. Clasifica, prepara prompts, revisa outputs, elige la superficie. |
| Discovery visual / propuestas UI | Antigravity (Gemini) | Browser, capturas WP Admin, análisis amplio, propuestas TARGET_OPTIONS. |
| WP/WC legacy / patches frágiles | Sonnet (Claude Code) | PHP/CSS WordPress, debugging funcional, patches concretos, cierre documental preciso. |
| Arquitectura / migración / TARGET | Opus (Claude Code) | TARGET_OPTIONS final, decisiones irreversibles, seguridad crítica, veredictos APPROVE/STOP. |
| Scripts / validaciones técnicas | Codex | Scripts deterministas, checks técnicos, validaciones terminal-first. |

**Stop-loss:** si un agente no converge tras 1–2 iteraciones, parar. Clasificar el fallo: ¿superficie equivocada? ¿contexto insuficiente? ¿problema arquitectónico? Cambiar superficie o reformular según corresponda.

**Regla de escalado:** diagnóstico read-only que deriva en decisión arquitectónica → cerrar diagnóstico, escalar a Opus.

---

## §12 — Stack y entorno

- **Plataforma:** WordPress 7.0 + WooCommerce 10.8.1 (producción activa en Raiola Networks)
- **Frontend activo:** Elementor Pro 3.35.1 (expira ~2026-07-01, no se renueva) + hello-elementor-child
- **Servidor:** LiteSpeed (sin acceso SSH en plan actual — WP Admin es la vía de acceso operativa)
- **Base de datos:** MariaDB 11.4.10 (accesible solo vía phpMyAdmin o WP, no vía SSH)
- **Stack TARGET:** pendiente de decisión en Sesión 005 TARGET_OPTIONS
- **Kill switch:** Sin deploy productivo hasta TARGET aprobado. No hay entorno Vercel activo.

---

## §13 — No tooling sin output accionable

No crear herramientas, scripts, monitoreo o automatizaciones a menos que terminen en:
- Una decisión documentada
- Una alerta accionable
- Un gate (pass/fail)
- Una métrica útil con umbral
- Una acción en ≤30 días

Si el output es "LOG_ONLY" predecible → no construir. Si ya existe algo similar → reutilizar.

---

## §14 — Reglas para proyectos Company Brain o Híbridos

Para proyectos clasificados como `company-brain` o `hibrido` en su SEED, aplican estas reglas adicionales:

- **Tipología aplicable:** Un "Company Brain" es un sistema enfocado en orquestar conocimiento y decisiones, no solo código.
- **Ciclo de valor:** El conocimiento ingerido no debe quedarse en pura documentación. Tras ingerir fuentes suficientes, se debe identificar una mejora operativa acotada y validable.
- **Fuentes AS-IS desordenadas:** Nunca asumas que la estructura real de una fuente existente merece ser replicada tal cual. El workflow correcto es diagnosticar el estado "AS-IS", identificar lo fiable y diseñar un "TARGET" antes de automatizar.
- **RAG con gates:** La implementación de RAG es opcional y solo debe darse tras tener un _knowledge_ aprobado, políticas de privacidad definidas y métricas de evaluación de respuestas. RAG sirve para consulta documental; no sustituye los flujos con datos estructurados.

---

## §15 — Discovery Intake

Discovery Intake es el flujo de lafabrica para proyectos que no nacen de una idea limpia, sino de una realidad existente. Se activa cuando las fuentes de información son heterogéneas, el AS-IS no está documentado, o las decisiones de diseño dependen de validar hipótesis sobre la realidad actual antes de comprometerse con un enfoque.

**Cuándo usar Discovery Intake:**
- Hay un sistema, negocio o proceso existente que el proyecto debe entender o mejorar.
- Las fuentes de información son heterogéneas: documentos, exports, herramientas SaaS, capturas.
- El SEED especulativo generaría riesgo real por asunciones incorrectas sobre el AS-IS.
- La persona usuaria necesita comparar opciones TARGET antes de comprometerse con una dirección.

**Discovery Intake no sustituye al SEED — lo precede.** El output del discovery siempre es un `PROJECT_SEED.md` implementable. El flujo converge en `lafabrica new` exactamente igual que el flujo greenfield.

**Las fuentes originales no son conocimiento aprobado.** Los archivos brutos, exports y capturas son fuentes que deben leerse en modo read-only, procesarse y sanearse antes de entrar al repo como documentación estructurada. Nada de la Controlled Intake Folder entra al repo sin pasar por el proceso de saneamiento.

**El AS-IS debe validarse antes de diseñar el TARGET.** No se pueden proponer opciones TARGET hasta que la persona usuaria haya confirmado que el AS-IS documentado refleja la realidad. Las hipótesis y las incógnitas del AS-IS se documentan explícitamente — no se asumen como resueltas.

**El TARGET aprobado precede a la implementación.** Solo cuando la persona usuaria aprueba una opción TARGET se genera el plan de implementación y, posteriormente, el SEED. La aprobación del TARGET es un punto de no retorno dentro de la iteración de discovery.

**Los pilotos no son estándar hasta tener evidencia.** Cuando se use Discovery Intake en un proyecto piloto, los aprendizajes derivados de ese piloto pueden evolucionar el pack. Ningún ajuste se convierte en estándar sin evidencia real del piloto. Los ajustes experimentales van en ramas `wip/` del template y se evalúan tras el cierre del piloto.

El pack completo está en `docs/orchestrator/discovery_intake_pack/`. Se activa manualmente copiando su contenido a `docs/discovery/` del proyecto hijo cuando la clasificación lo justifica.

---

## §16 — SESSION_WORKSTREAM_ANCHOR

Toda sesión operativa debe tener un ancla explícita:

- `PROJECT` (Catenaccio Vintage)
- `SUBSYSTEM` (repo-os / wordpress / discovery / target / implementation)
- `BLOCK` (tarea concreta del BACKLOG)

Si una petición cambia de proyecto, subsistema o bloque, el orquestador debe detectarlo antes de continuar: cerrar el bloque actual, aparcar la nueva petición, reanclar la conversación o preparar un handoff. El repo es la fuente durable — no mezclar sesiones silenciosamente.

---

## §17 — TARGET_OPTIONS: decisión binaria, no informe

TARGET_OPTIONS no es un informe de opciones infinito. Termina en una recomendación clara con:
- Opción recomendada + justificación concreta
- Opción alternativa mínima si la recomendada tiene bloqueante
- Criterio de elección explícito (deadline, coste, riesgo, reversibilidad)

El operador aprueba o rechaza. No hay "depende de muchos factores".

Si el análisis no llega a recomendación concreta → `DEFER_STOP` o escalar a Opus para forzar el veredicto.

---

## §18 — SESSION_LEARNING_TRANSFER al cierre

Al cerrar cualquier sesión relevante, el orquestador evalúa si existe aprendizaje transferible
antes de emitir el reporte final. La evaluación es obligatoria; el bloque es opcional y proporcional.

**Criterio de inclusión:** incluir el bloque `SESSION_LEARNING_TRANSFER` si la sesión generó
al menos uno de los siguientes:
- un patrón, workflow, criterio o guardrail reutilizable → destino `lafabrica`
- evidencia profesional, skill demostrada, ángulo de servicio/contenido/portfolio → destino `brain`
- insight para un producto futuro (Cauvera u otro vertical) → destino `future_product`

**Criterio de omisión:** omitir si todo es microajuste, corrección de texto, smoke test
o cierre técnico sin aprendizaje nuevo. No inventar transferencias artificiales.

**Destinos:**
- `lafabrica` → mejora el sistema operativo madre (patrones, metodología, prompts, guardrails).
- `brain` → capitaliza la experiencia como evidencia, skills, servicios vendibles, contenido, portfolio.

**Flujo estándar (sin `DIRECT_BRAIN_WRITE_ALLOWED`):**
1. El agente incluye el bloque `SESSION_LEARNING_TRANSFER` en el reporte de cierre.
2. Si el aprendizaje merece persistencia local, se añade en `docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md`.
3. El Brain absorbe la cola de forma controlada cuando Pablo lo pida explícitamente.

Escritura directa al Brain solo con autorización literal `DIRECT_BRAIN_WRITE_ALLOWED` en el prompt.

**Regla de privacidad:** nunca incluir credenciales, datos de clientes, pedidos, precios privados,
proveedores sensibles ni nada que comprometa a terceros. Ver `DATA_AND_PRIVACY_BOUNDARIES.md`.

**No en microajustes.** El bloque no es obligatorio en toda sesión — es proporcional al valor real.

Formato completo definido en `AGENTS.md §Formato de reporte al orquestador`.

---

## §19 — Reglas de orquestación del Operating Brain (adaptadas a WordPress/WooCommerce)

Absorbidas desde `pablo-operating-brain/docs/profile/PABLO_OPERATING_MODEL.md §13`
(RULE-01 a RULE-05, DEC-PABLO-01 a DEC-PABLO-03). Sesión 2026-06-24.

Estas son reglas de cómo Pablo orquesta — no reglas de WooCommerce.

### RULE-01 — Revisión fría como desbloqueador

Si un bloque técnico no converge en 3+ sesiones con el mismo approach, activar revisión fría:
agente diferente, sin contexto del intento anterior. No continuar el mismo ciclo esperando resultado distinto.

**Señal:** el agente lleva ≥3 sesiones sobre el mismo issue sin TEST B pass.
**Acción:** STOP_AND_REPLAN (ver PATTERN-07 en lafabrica). Cambiar agente y approach, no solo el parámetro.

### RULE-02 — PABLO_VISUAL_OK como único gate visual

Ningún cambio con efecto visual en la tienda se cierra sin la revisión de Pablo.
El agente prepara; Pablo aprueba; el commit cierra. No se invierte el orden.

**Aplica a:** cambios en tema hijo, widgets WooCommerce, CSS, templates de producto/archivo/checkout.

### RULE-03 — Staging es sintaxis; producción valida comportamiento

Flujos con email transaccional WooCommerce, hooks de checkout, activación de cuenta,
o configuración productiva deben declararse `PRODUCTION_ONLY_VALIDATION` antes de abrir la tarea.

**Aplica a (WooCommerce):**
- `woocommerce_created_customer` / confirmación de pedido / recuperación de contraseña
- Hooks de checkout (Blocks vs Classic vs shortcode)
- Configuración de pasarela de pago
- WP Mail SMTP / emails transaccionales

No gastar sesiones en staging para validar lo que solo producción puede confirmar.

### RULE-04 — No ampliar mientras falla el flujo crítico

Si el flujo principal de la tienda está roto o no validado, no abrir sesiones de mejora,
polish ni documentación de ese módulo. El checkout, el catálogo y el acceso de cliente son
los flujos críticos de Catenaccio.

### RULE-05 — Cambiar de agente es una decisión de gestión, no técnica

El agente implementador señala que está atascado; el orquestador decide si cambiar de agente,
de approach o de superficie. Inacción no es opción: tras 3 intentos sin convergencia, cambiar algo.

---

### DEC-PABLO-01 — Cadena de agentes por tipo de tarea (Catenaccio)

| Fase | Agente preferido | Razón |
|------|-----------------|-------|
| Diagnóstico amplio, lectura de docs, navegación WP Admin | Antigravity / Gemini | Contexto amplio, económico para lectura |
| Debugging quirúrgico PHP/CSS WC, hooks, lógica raíz | Claude Sonnet | Más preciso en código específico |
| Revisión fría / STOP_AND_REPLAN | Claude Sonnet (sin contexto previo) | Cold review sin peso emocional del intento anterior |
| Arquitectura, seguridad, migración, decisiones irreversibles | Claude Opus | Solo para riesgo real e irreversible |
| Scripts, validaciones deterministas, syncs controlados | Codex | Cuando disponible para la tarea |
| Documentación, cierres, orquestación | ChatGPT u otro bajo coste | No necesita capacidad de implementación |

**Antipatrón:** usar Opus para polish visual, microfix o iteraciones de diagnóstico rutinario.

### DEC-PABLO-02 — No cerrar un bloque como PASS sin TEST B real

Ningún bloque con flujo de email WooCommerce, hook de checkout, activación de cuenta o integración
externa se cierra como PASS sin TEST B en el entorno productivo real.

"El log no tiene errores" y "en staging funciona" no son criterios de cierre para estos flujos.

**TEST B en WooCommerce:**
- Email: realizar pedido/registro real con cuenta nueva → verificar recepción en bandeja real.
- Checkout: completar un pedido real de prueba → verificar estado en WC Orders.
- Hook: verificar estado del objeto WC Order/Customer en BD, no solo el log del servidor.

### DEC-PABLO-03 — Staging sin SMTP: declararlo antes, no al cuarto intento

Si el entorno no tiene WP Mail SMTP configurado o Mailtrap/captura de emails funcionando,
declarar esa limitación antes de abrir la tarea y planificar TEST B en producción desde el inicio.

**Aplica a Catenaccio:** verificar WP Mail SMTP antes de cualquier tarea de email transaccional.
Si no hay SMTP de producción configurado → esa es la primera tarea, no el cuarto intento fallido.

---

### Patrones de lafabrica aplicables a WooCommerce (referencia)

Estos patrones del sistema operativo madre aplican por defecto. Ver definición completa en
`lafabrica-template/docs/orchestrator/ECOSYSTEM_LEARNING_PATTERNS.md`.

| Patrón | Aplica a WooCommerce como... |
|--------|------------------------------|
| PATTERN-07 STOP_AND_REPLAN | Activar tras 3 microparches fallidos en hook/email/checkout |
| PATTERN-08 TRANSACTIONAL_EMAIL_PRODUCTION_GATE | Declarar PRODUCTION_ONLY_VALIDATION en toda tarea de email WC |
| PATTERN-09 ECOMMERCE_HOOK_STATE_GUARD | Usar estado del objeto Order/Customer, nunca contexto de ejecución |
| PATTERN-06 AGENT_EXPERIENCE_LEDGER | Ver `docs/meta/AGENT_EXPERIENCE_LEDGER.md` — consultar antes de tarea registrada |
| PATTERN-05 AI_FIRST_LAYERED_DOCUMENTATION | Activar ACTIVE_CONTEXT_PACK + READING_RECIPES cuando sesiones >30 |

### Equivalencias PrestaShop → WooCommerce (para adaptar ejemplos del Playbook)

| PrestaShop | WooCommerce equivalente |
|-----------|------------------------|
| `hookActionCustomerAccountAdd` | `woocommerce_created_customer` / `user_register` |
| `$customer->is_guest` | `!$order->get_customer_id()` o `!get_user_by('email', $email)` |
| `PS_configuration` | `get_option('woocommerce_*')` / `wp_options` |
| Caché Symfony | OPcache + LiteSpeed Cache / Transients |
| `custom.css` en tema PrestaShop | `child-theme/style.css` en tema hijo WooCommerce |
| `Mail::Send` | `wp_mail` / clases de email WooCommerce / WP Mail SMTP |
| `php -l` remoto | Validación PHP en local + backup antes de sync |

---

## §20 — DOMAIN_PRODUCT_MODELING_GATE

Activar antes de CODE cuando una tarea toque formularios nuevos, taxonomías, campos de producto,
UI de backoffice, copy operativo, title builders o flujos donde Pablo valide visualmente.

Regla: si hay ambigüedad de dominio, primero ASK/read-only/modeling, no CODE. El agente debe
producir una spec breve de campos, labels visibles, valores internos, title labels, opciones,
mapping externo/Woo pendiente, ejemplos reales y casos borde. Ver
`docs/studio/STUDIO_PRODUCT_FORM_MODELING_PLAYBOOK.md`.

Señal de parada: si Pablo detecta 2+ microfixes de UI/dominio en la misma línea, no seguir
parcheando; activar `STOP_AND_MODEL_DOMAIN`, validar matriz de decisiones y luego hacer un patch
coherente.

---

## §21 — UI_DESIGN_GATE

Activar antes de cualquier tarea que toque UI: layout, estilos, componentes visuales, navegación,
copy de interfaz, fichas de producto, filtros, búsqueda, cards, tablas, estados visuales o feedback.

Regla: leer `DESIGN.md` (contrato visual local de Catenaccio) antes de proponer o modificar nada.
Si la tarea contradice el contrato, parar y pedir decisión del orquestador — no proceder por
iniciativa propia. Cambios UI por delta sobre lo aprobado, nunca rediseño desde cero. Studio y
storefront (`catenaccio-a0-child/`) son superficies distintas; el storefront está
congelado/diferido salvo instrucción explícita. Detalle operativo completo en `AGENTS.md` →
Guardrails del dominio.

---

## §22 — REMOTE_VIEW / LOCAL_VIEW / BASELINE_HEAD en apertura de sesión

Toda sesión operativa (no `CHAT_CLOSE`, no consulta simple) abre con:

```
REMOTE_VIEW:
  status: VERIFIED | PARTIAL | UNAVAILABLE
  remote_head: <hash verificado o UNKNOWN>

LOCAL_VIEW:
  local_head: <hash>
  worktree: CLEAN | DIRTY
  relation_to_remote_view: SAME | LOCAL_AHEAD | LOCAL_BEHIND | DIVERGED | UNKNOWN

BASELINE_HEAD: <local_head congelado — la baseline aprobada de esta sesión>
```

`BASELINE_HEAD` nunca es el HEAD que avanza con los propios commits de la sesión: se congela al
abrir y sirve de referencia para el diff final. Sin `remote_head` verificado, la relación es
`UNKNOWN` — no se asume `SAME`. Ver `PROJECT_BOOTSTRAP.md` para el handshake mínimo completo.

---

## §23 — Lectura por capas (no CONTEXTO/HISTORIAL completo por defecto)

La lectura mínima de §1 sigue vigente (`CONTEXTO.md`, `BACKLOG.md`, últimas 2-3 entradas de
`HISTORIAL_SESIONES.md`). Regla adicional: nunca leer `HISTORIAL_SESIONES.md` completo ni
`CONTEXTO.md` completo por defecto. Si una tarea necesita contexto anterior específico, buscarlo
por trigger en `docs/meta/AGENT_EXPERIENCE_LEDGER.md` (ver capa de recuperación, §L1) antes de
abrir un archivo grande completo. Leer más allá de lo proporcional requiere justificación explícita
en el prompt.

---

## §24 — Comprobación consciente antes de reabrir una decisión cerrada

Antes de reabrir una línea que el repo marca como cerrada (DECISIONS.md, notas de cierre en
CONTEXTO.md, disposición ya asignada en `docs/meta/LAFABRICA_ADOPTION.md`), comprobar
explícitamente si existe una decisión ya tomada sobre eso. Si existe, no volver a preguntarla:
aplicarla y, si hace falta, declarar por qué este bloque la reabre. Esto no crea un registro nuevo
de estado decisorio — ver §31 sobre `MR-013.1`/`LOCAL_OVERRIDE_APPROVED`.

---

## §25 — PERSIST_BEFORE_DELEGATE

Antes de delegar una tarea a un agente distinto o a una sesión remota, persistir en el repo lo que
ese agente necesita para no depender de memoria transmitida: estado relevante en `CONTEXTO.md`
(append), alcance exacto y cualquier decisión ya cerrada. Delegar sin persistir primero obliga al
agente delegado a reconstruir contexto por transmisión conversacional, que es más caro y más frágil
que leerlo del repo.

---

## §26 — Handoff remoto mínimo

Cuando una sesión debe entregarse a otra (otro agente, otra ventana, otro día), el handoff se limita
a cinco campos:

```
LOCAL_VIEW: <estado git actual>
EXACT_SCOPE: <qué se tocó, nada más>
SEMANTIC_DELTA: <qué cambió de verdad, no una lista de archivos>
VALIDATION: <qué se verificó y qué no>
RECOMMENDATION: <siguiente paso concreto>
```

No repetir contexto que ya vive en el repo. Si el receptor necesita más, debe leerlo del repo, no
recibirlo pegado en el handoff.

---

## §27 — Grilling proporcional

Los hechos se investigan (leer repo, código, logs); las decisiones se preguntan al operador. No
mezclar ambas categorías en una sola pregunta. Cuando hace falta preguntar, una pregunta a la vez —
no acumular una lista de preguntas para una sola respuesta del operador. Esto reduce la carga
cognitiva de decidir varias cosas a la vez y hace explícito qué es hecho verificable y qué es
decisión de negocio.

---

## §28 — Outcome-First contract

Todo prompt de agente con riesgo medio/alto sigue esta estructura, adaptada de forma proporcional
para bloques `LITE`:

```
ASSIGNMENT      — qué se pide, en una línea
OUTCOME         — qué cambia en el mundo si esto sale bien
DONE_BAR        — criterio binario de cierre
NON_GOALS       — qué NO se va a hacer en este bloque
AUTONOMY        — nivel A0-A3 concedido (ver §29)
HOUSE_RULES     — guardrails del proyecto que aplican a esta tarea
VERIFY_PLAN     — cómo se comprueba antes de cerrar
STOP_LOSS       — cuándo parar aunque no esté completo (ver §30)
CLOSE_MODE      — LITE / NORMAL / FULL (§4)
```

`DECISIONS_ALREADY_CLOSED` se incluye cuando aplica: decisiones del operador que no deben
reabrirse durante la ejecución de este prompt (ver §24).

Builder / Verifier / Closer son **responsabilidades**, no sesiones obligatorias separadas: pueden
recaer en el mismo agente/sesión salvo que el riesgo, la autorización, el entregable o una petición
explícita exijan separarlas. La evidencia de cierre es proporcional al `DONE_BAR` declarado — no se
exige más verificación de la que el bloque pide. Solución suficiente: cerrar al pasar el `DONE_BAR`,
no seguir puliendo más allá de lo pedido.

---

## §29 — Niveles de autonomía A0-A3

| Nivel | Significado |
|---|---|
| `A0` | Solo lectura / diagnóstico. No modifica nada. |
| `A1` | Modifica archivos locales del hijo. No toca superficies externas (WordPress/Woo/hosting). |
| `A2` | `A1` + puede crear commits locales. No push, no deploy, no escritura externa. |
| `A3` | `A2` + autorización explícita para push, deploy o escritura en sistemas externos (Woo/WP/hosting) — requiere nombrar la superficie exacta en el prompt. |

`A3` nunca es el default. Cada prompt declara el nivel concedido explícitamente.

---

## §30 — Stop-loss R0-R3

| Nivel | Significado |
|---|---|
| `R0` | Sin incidencia. Progreso normal. |
| `R1` | Incidencia técnica normal dentro del bloque — se resuelve sin cambiar el alcance ni pedir autorización nueva. |
| `R2` | El approach falla dos veces sin avance verificable — cambiar de método o superficie antes de un tercer intento equivalente (ver PATTERN-07/`STOP_AND_REPLAN` en AGENTS.md). |
| `R3` | Bloqueante que requiere decisión del operador — parar y reportar, no seguir intentando. |

`SIMPLIFY_REPLAN`: si la sesión deriva sin progreso (código más complejo con cada intento, mismo
síntoma repetido), simplificar el approach al discriminador más estable disponible antes de seguir
añadiendo lógica.

---

## §31 — Reglas operativas heredadas de MR-011/MR-012

- **Git read-only ≠ autorización de commit/push.** Leer el repo (`git status`, `git log`, `git
  diff`) nunca implica permiso para commitear o pushear. Cada uno se autoriza por separado según el
  nivel de autonomía (§29).
- **Memoria asistiva nunca autoritativa.** Cualquier memoria de sesión anterior (engram, notas,
  recuerdos del agente) es asistiva: orienta dónde mirar, pero el repo y el remoto verificado son
  la evidencia. Ante conflicto, gana el repo.
- **Trackers solo cambian si su estado cambió realmente.** No tocar `BACKLOG.md`,
  `HISTORIAL_SESIONES.md` ni `docs/meta/LAFABRICA_ADOPTION.md` como acto reflejo de cierre — solo
  si algo en ellos dejó de ser cierto.
- **Solución suficiente.** Cerrar un bloque al pasar su `DONE_BAR`, no seguir puliendo. No microfix
  recursivo: una incidencia que no cambia la frontera del bloque se resuelve dentro del bloque, no
  abre uno nuevo.
- **Context-delta-only en continuaciones vivas.** Al continuar una sesión ya abierta, transmitir
  solo lo que cambió desde el último mensaje — no repetir contexto ya establecido.

Sobre `MR-013.1` (estado decisorio activo / `ACTIVE_DECISION_STATE.md`): Catenaccio sí incorpora
consciencia decisoria en este documento; lo que **no se crea** es el archivo dedicado
`ACTIVE_DECISION_STATE.md`. Disposición: `LOCAL_OVERRIDE_APPROVED` (Owner Decision A) — es una
variante local aprobada, no `DEFERRED`, y no queda adopción pendiente. El archivo dedicado se crea
únicamente cuando exista el primer `REJECTED` durable real que necesite `reopen_if`. Hasta entonces,
la comprobación consciente de decisiones (§24) cubre el mismo espíritu sin el registro dedicado.

---

## §32 — CHECK de actualización metodológica (MR-008, read-only)

<!-- LAFABRICA:BEGIN MR008_UPDATE_CHECK MR-014 -->

Capa canónica `CHECK -> NOTIFY -> REVIEW -> INSTALL -> VERIFY` de
`LAFABRICA_UPDATE_NOTIFICATION_PROTOCOL.md`, cableada en modo read-only:

- Como máximo un `CHECK` por sesión operativa o de reactivación. No obligatorio en `CHAT_CLOSE` ni
  en consultas simples.
- `CHECK` compara `lafabrica_release_base` (declarado en `docs/meta/LAFABRICA_ADOPTION.md`) contra
  la release actual del Release Ledger de lafabrica (`LAFABRICA_RELEASE_PROTOCOL.md` §11).
- Resultado de `CHECK` (`tracking_status`, `delta_status`, `primary_notification`,
  `release_current_observed`, `risk_live`, `activation_prerequisite`, `blocking_scope`) es
  **efímero**: se calcula en la sesión y no se persiste automáticamente. Persistirlo requiere un
  `APPLY` autorizado que actualice explícitamente los campos durables de
  `docs/meta/LAFABRICA_ADOPTION.md`.
- `CHECK` **nunca concede** `A2`/`A3` por sí mismo. Es puramente informativo.
- Si `CHECK` detecta un cambio `CRITICAL` con `risk_live: true` no adoptado, se notifica al
  operador; no se ejecuta ninguna acción sin autorización explícita (ver §29, §10 de
  `LAFABRICA_RELEASE_PROTOCOL.md`).

<!-- LAFABRICA:END MR008_UPDATE_CHECK -->

---

## §33 — ORCA EXECUTION SURFACE (contrato LOCAL — no metodología canónica de lafabrica)

Este contrato regula cómo se usan worktrees/branches de Orca en Catenaccio. Es local: no forma
parte de ninguna release `MR-NNN` de lafabrica, y no debe copiarse a otros proyectos como si lo
fuera.

- **Un outcome coherente = un worktree.** El worktree pertenece al outcome (el resultado que se
  persigue), no al agente que lo abrió.
- **Agentes secuenciales pueden compartir un worktree** mientras `OUTCOME`, `RISK` y `AUTONOMY`
  (nivel A0-A3, §29) no cambien entre ellos. Si cualquiera de los tres cambia, es un outcome nuevo
  y requiere su propio worktree o una re-apertura explícita.
- **Un solo modificador a la vez** sobre un worktree — nunca dos agentes escribiendo en paralelo
  sobre el mismo árbol de trabajo.
- **`main` es canónico.** El flujo normal es: implementación → Verifier → promoción controlada →
  lectura de vuelta del remoto (`remote read-back`) → sync a `main` → cleanup/archive del worktree.
- **`REMOTE_VIEW` ≠ upstream local.** El tracking branch local no prueba el estado del remoto —
  solo un `git ls-remote`/`fetch` verificado lo hace (ver §22).
- **Nunca eliminar** un worktree o branch que tenga trabajo exclusivo sin promover primero.
- **Evitar `git stash` desnudo** — el stash es compartido entre todos los worktrees del repo y otra
  sesión puede estar usándolo. Preferir un commit `WIP` cuando haga falta apartar trabajo.
- **El agente no elimina su propio worktree.** El cleanup es una decisión separada del cierre de la
  tarea.

### READY_TO_ARCHIVE_IN_ORCA (gate de limpieza)

Un worktree solo se marca listo para archivar cuando **todas** estas condiciones se cumplen:

```
[ ] CLEAN — sin cambios sin commitear
[ ] remote read-back PASS — el remoto refleja lo promovido
[ ] main contiene el trabajo promovido
[ ] no hay commits exclusivos del worktree sin promover
[ ] no hay untracked relevante
```

Si falta cualquiera, el worktree permanece activo — no se archiva ni se elimina.

---

## Historial de cambios de este documento

| Fecha | Cambio | Quién |
|-------|--------|-------|
| 2026-06-06 | Creado desde lafabrica-template | lafabrica_new.py |
| 2026-06-13 | Stack real, lectura proporcional +git step 0, guardrails de dominio, tabla de agentes específica, §16 SESSION_WORKSTREAM_ANCHOR, §17 TARGET_OPTIONS binario | Claude Code (Sonnet) |
| 2026-06-24 | §19 — reglas RULE-01 a RULE-05, DEC-PABLO-01 a DEC-PABLO-03 absorbidas del Operating Brain; patrones PATTERN-05 a 09 de lafabrica; equivalencias PrestaShop→WooCommerce; referencia al AGENT_EXPERIENCE_LEDGER | Claude Code (Sonnet) |
| 2026-06-28 | §20 — DOMAIN_PRODUCT_MODELING_GATE para formularios/product UI tras aprendizaje S022A | Codex |
| 2026-07-03 | §21 — UI_DESIGN_GATE: leer DESIGN.md antes de cualquier tarea de UI; detalle en AGENTS.md | Claude Code (Sonnet) |
| 2026-09-02 | §22-§33 — Adopción MR-014 (delta desde MR-003): REMOTE_VIEW/LOCAL_VIEW/BASELINE_HEAD, lectura por capas, comprobación de decisiones cerradas, PERSIST_BEFORE_DELEGATE, handoff remoto mínimo, grilling proporcional, contrato Outcome-First, A0-A3/R0-R3, reglas MR-011/MR-012, CHECK de MR-008 (managed block read-only), ORCA EXECUTION SURFACE local. Ver `docs/meta/LAFABRICA_ADOPTION.md` para cobertura completa de change_id. | Claude Code (Sonnet) |
