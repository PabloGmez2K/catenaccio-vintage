# DECISIONS.md — Catenaccio Vintage

Registro de decisiones arquitectónicas y estratégicas. Evita re-debatir lo ya decidido.

**Regla:** Cuando Opus emite `APPROVE` o se toma una decisión irreversible → entra aquí.
**Quién mantiene:** Opus para decisiones estratégicas; Orquestador para el resto.

---

### DEC-0 — Arranque con lafabrica (script lafabrica_new.py)
**Fecha:** 2026-06-06
**Tipo:** proceso
**Quién aprobó:** Usuario / builder
**Estado:** ACTIVA

**Decisión:**
Usar lafabrica-template con el script `lafabrica_new.py` para arrancar este proyecto.

**Razonamiento:**
Manual con Cauvera validó el concepto; v0.2 automatiza el paso 0 sin agregar features que no se hayan dolido en uso real.

**Alternativas descartadas:**
- Repetir el flujo manual: ya validado, agregaba fricción innecesaria.
- CLI completa con sub-comandos: postergado a v0.3 si el script básico se queda corto.

**Implicaciones:**
El reemplazo de placeholders es semi-automático. Lo que el script no resuelve se completa a mano y se documenta como mejora.

---

### DEC-1 — Usar lafabrica como sistema operativo del proyecto.
**Fecha:** 2026-06-06
**Tipo:** [completar]
**Quién aprobó:** Usuario / builder (vía SEED)
**Estado:** ACTIVA

**Decisión:**
Usar lafabrica como sistema operativo del proyecto.

**Razonamiento:**
_(completar)_

**Alternativas descartadas:**
- _(completar si aplica)_

**Implicaciones:**
_(completar si aplica)_

---

### DEC-2 — Empezar con Discovery Intake, no con implementación directa.
**Fecha:** 2026-06-06
**Tipo:** [completar]
**Quién aprobó:** Usuario / builder (vía SEED)
**Estado:** ACTIVA

**Decisión:**
Empezar con Discovery Intake, no con implementación directa.

**Razonamiento:**
_(completar)_

**Alternativas descartadas:**
- _(completar si aplica)_

**Implicaciones:**
_(completar si aplica)_

---

### DEC-3 — Registrar la carpeta legacy como fuente externa.
**Fecha:** 2026-06-06
**Tipo:** [completar]
**Quién aprobó:** Usuario / builder (vía SEED)
**Estado:** ACTIVA

**Decisión:**
Registrar la carpeta legacy como fuente externa.

**Razonamiento:**
_(completar)_

**Alternativas descartadas:**
- _(completar si aplica)_

**Implicaciones:**
_(completar si aplica)_

---

### DEC-4 — No tocar producción, dominio, WordPress, hosting ni Vercel hasta validar AS-IS y TARGET.
**Fecha:** 2026-06-06
**Tipo:** [completar]
**Quién aprobó:** Usuario / builder (vía SEED)
**Estado:** ACTIVA

**Decisión:**
No tocar producción, dominio, WordPress, hosting ni Vercel hasta validar AS-IS y TARGET.

**Razonamiento:**
_(completar)_

**Alternativas descartadas:**
- _(completar si aplica)_

**Implicaciones:**
_(completar si aplica)_

---

### DEC-5 — Tratar Next.js/Vercel como preferencia inicial posible, no como decisión cerrada.
**Fecha:** 2026-06-06
**Tipo:** [completar]
**Quién aprobó:** Usuario / builder (vía SEED)
**Estado:** ACTIVA

**Decisión:**
Tratar Next.js/Vercel como preferencia inicial posible, no como decisión cerrada.

**Razonamiento:**
_(completar)_

**Alternativas descartadas:**
- _(completar si aplica)_

**Implicaciones:**
_(completar si aplica)_

---

### DEC-6 — Usar VS Code / Claude Code como superficie principal inicial.
**Fecha:** 2026-06-06
**Tipo:** [completar]
**Quién aprobó:** Usuario / builder (vía SEED)
**Estado:** ACTIVA

**Decisión:**
Usar VS Code / Claude Code como superficie principal inicial.

**Razonamiento:**
_(completar)_

**Alternativas descartadas:**
- _(completar si aplica)_

**Implicaciones:**
_(completar si aplica)_

---

### DEC-7 — Usar Antigravity más adelante si hay validación visual o UI.
**Fecha:** 2026-06-06
**Tipo:** [completar]
**Quién aprobó:** Usuario / builder (vía SEED)
**Estado:** ACTIVA

**Decisión:**
Usar Antigravity más adelante si hay validación visual o UI.

**Razonamiento:**
_(completar)_

**Alternativas descartadas:**
- _(completar si aplica)_

**Implicaciones:**
_(completar si aplica)_

---

### PEND-1 → DEC-8 — Arquitectura TARGET recomendada: Estrategia A0 + B1
**Fecha original:** 2026-06-06  
**Fecha de recomendación inicial (005):** 2026-06-13 — Opción A (WP+WC sin Elementor Pro)  
**Fecha de recomendación corregida (005b):** 2026-06-13 — Estrategia A0 + B1  
**Fecha de aprobación:** 2026-06-13 (Sesión 005d — aprobación literal del operador)  
**Tipo:** estratégica  
**Estado:** ✅ APROBADA — confirmación literal del operador: "APPROVE A0 + B1."

**Recomendación del agente (Sesión 005b — versión corregida):**
APPROVE Estrategia A0 + B1.

**¿Por qué se corrigió la Sesión 005?**
La recomendación inicial ("Quitar Elementor Pro → Gutenberg") respondía al deadline técnico pero no a la causa raíz del bloqueo. El operador confirmó que la fricción real era el backoffice de WP Admin (flujo de publicación de productos demasiado caótico), no solo el frontend. Resolver Elementor con Gutenberg no cambia la experiencia del backoffice.

**A0 — Track 0: Continuidad de la tienda (deadline 2026-07-01)**
- Auditar los 19 items de `elementor_library` — identificar cuáles usan widgets Pro.
- Migrar Cart, Mi Cuenta y mini-cart a WooCommerce Blocks.
- Resolver OPcache lleno y WP_MEMORY_LIMIT mínimos.
- Sin tocar pagos, SEO, productos ni pedidos.

**B1 — Track 1: Catenaccio Studio / backoffice PIM AI-first (30 días)**
- App Next.js con formularios diseñados para camisetas vintage.
- Claude asiste: precio de mercado, descripción, título SEO, atributos.
- Publica en WooCommerce vía REST API (Application Password, usuario limitado).
- Pablo aprueba borradores antes de publicar.
- Objetivo: publicar una camiseta en ~10 min en lugar de ~45 min.

**Alternativas descartadas:**
- Headless WC + Next.js storefront: WooPayments no soporta headless — STOP a corto plazo.
- Migración completa Next.js: DEFER — inviable antes del deadline, reevaluar con 100+ productos.
- Shopify: STOP — pérdida de activos reales sin justificación.
- Track 3 (storefront público Next.js): DEFER — post 100 productos y evidencia de tráfico.

**Aprobación del operador (literal, 2026-06-13):**
"APPROVE A0 + B1. Marketplace queda como NORTH_STAR / DEFER."

**Implicaciones si se aprueba:**
- Sesión 006: Track 0 — auditoría elementor_library + fixes + validación visual Pablo.
- Sesión 006 paralela / 007: Track 1 — diseño formulario Studio + Application Password + test WC API.
- Stack a largo plazo: WooCommerce como motor de venta/pagos + Studio como capa editorial AI-first.

---

### DEC-9 — Modelo de acceso sin SSH: Application Password + usuario limitado + DRAFT_ONLY
**Fecha:** 2026-06-13 (Sesión 006)  
**Tipo:** operativa / seguridad  
**Quién aprobó:** Operador (por aprobación implícita de la estrategia A0+B1 que requiere acceso API)  
**Estado:** ACTIVA — pendiente de ejecución (creación de credenciales por Pablo)

**Decisión:**
El agente opera el CMS/catálogo exclusivamente vía WP REST API + WC REST API con Application Password de un usuario WP limitado. Modo por defecto: DRAFT_ONLY. Pablo publica. El agente no publica directamente.

**Razonamiento:**
Sin SSH (Raiola Inicio SSD 2.0), la única vía controlada y segura para que un agente opere el catálogo es la REST API con credenciales de mínimo privilegio. La alternativa (usar la cuenta admin de Pablo) introduce riesgo de compromiso total del sitio.

**Implicaciones:**
- Usuario limitado `catenaccio-studio-agent` separado del admin.
- Application Password revocable independientemente del admin.
- Credenciales en `.env.local` local — nunca en el repo, nunca en el chat.
- Ver guía completa en `docs/operations/ACCESS_MODEL_NO_SSH.md`.

**Nota (Sesión 006d — 2026-06-13):** Access-first es la política operativa activa. `ACCESS_MODEL_ACTIVATION_READONLY` es el prerequisito de toda sesión de agente sobre el CMS. No pedir listas o capturas manuales a Pablo antes de probar el acceso. El orden correcto: credenciales activas → probe de solo lectura → auditoría Elementor → Studio.

---

### DEC-10 — NO_SSH_SHADOW_RELEASE_FLOW como patrón operativo para Catenaccio
**Fecha:** 2026-06-15 (Sesión 010C)
**Tipo:** operativa / proceso de release
**Quién aprobó:** Operador (definición y restricciones dictadas explícitamente)
**Estado:** ACTIVA — en validación con la migración A0 real (sesiones 011-015)

**Decisión:**
Adoptar el flujo NO_SSH_SHADOW_RELEASE_FLOW como patrón operativo estándar para liberar cambios en Catenaccio Vintage en ausencia de SSH y de entorno de staging dedicado.

**Descripción del flujo:**
1. **Ventana temporal de acceso** — el agente solicita acceso solo cuando lo necesita (cPanel API Token u otro canal aprobado). El acceso se revoca al cerrar la sesión.
2. **Superficie sombra** — los cambios se desarrollan contra un recurso WordPress inactivo:
   - Tema paralelo inactivo: `catenaccio-a0-child` (o equivalente) — nunca el tema activo `hello-elementor-child`.
   - Plugin paralelo inactivo si aplica en tareas futuras.
3. **El agente nunca toca el tema activo** (`hello-elementor-child`) ni plugins activos en producción.
4. **Validación visual con Antigravity** — Antigravity se usa exclusivamente para ver/comparar el resultado en el tema sombra inactivo. No edita archivos ni accede a cPanel.
5. **Promoción manual por Pablo** — Pablo activa el tema sombra en WP Admin y verifica en producción.
6. **Rollback definido** — Pablo reactiva `hello-elementor-child` si algo falla. Sin acción del agente.
7. **Cierre de acceso** — Pablo revoca el token cPanel API (u otro) al finalizar la sesión de sync.

**Canal de acceso autorizado para escritura:**
- Solo carpeta/recurso aislado e inactivo (tema o plugin sombra).
- Acceso cPanel API aprobado para READ_ONLY discovery: token temporal, TLS activo por defecto, path guardrail a `public_html/wp-content/themes/catenaccio-a0-child` (o equivalente), revocación posterior.
- NO escribir en tema activo `hello-elementor-child`, NO tocar plugins activos, NO modificar wp-config.php, NO operar pasarelas de pago.

**Restricción de extrapolación:**
El patrón NO se extrae como candidato reutilizable para lafabrica hasta validarlo con la migración A0 completa.

**Razonamiento:**
Catenaccio Vintage no tiene SSH (Raiola Inicio SSD 2.0) ni entorno de staging dedicado. El flujo convencional de staging → deploy → rollback no existe. El patrón shadow-release permite iterar con código real en el servidor sin riesgo para el tema activo ni para la tienda en producción. El token cPanel API demostró funcionalidad real en Sesión 010B (read-only), lo que valida el canal para escritura controlada en carpeta aislada.

**Prioridad operativa de próximas sesiones:**
1. Pablo revoca el token cPanel API usado en 010B.
2. SESSION 011 — A0_MIGRATION_PLAN (sin acceso servidor).
3. SESSION 012 — THEME_SHADOW_SCAFFOLD: diseño de superficie sombra `catenaccio-a0-child`.
4. SESSION 013 — implementación local o paquete del tema paralelo.
5. SESSION 014 — sync controlado a superficie sombra (acceso temporal).
6. SESSION 015 — validación visual con Antigravity sobre tema sombra.
7. RELEASE manual por Pablo + rollback definido.
8. Solo después: evaluar extracción del patrón a lafabrica.

**Alternativas descartadas:**
- WebDAV: BLOCKED — puertos 2077/2078 cerrados por firewall Raiola (Sesión 010A).
- FTP anónimo: DESCARTADO — sin credenciales FTP separadas aprobadas.
- Subir archivos manualmente por Pablo en cada iteración: funciona como fallback de último recurso, pero no es un flujo de agente.

---

### DEC-11 — SESSION_LEARNING_TRANSFER como estándar único de transferencia de aprendizaje
**Fecha:** 2026-06-20
**Tipo:** proceso / metodología
**Quién aprobó:** Pablo (vía instalación del estándar)
**Estado:** ACTIVA

**Decisión:**
`SESSION_LEARNING_TRANSFER` es el estándar único para capitalizar aprendizajes de sesiones
relevantes en este proyecto. Tiene dos destinos explícitos:
1. `lafabrica` — mejora el sistema operativo madre: patrones, workflows, guardrails, metodología, prompts.
2. `pablo-operating-brain` — capitaliza experiencia profesional de Pablo: evidencia, skills,
   servicios vendibles, contenido, portfolio, autoridad.

El bloque es **opcional y proporcional**: se usa solo cuando hay aprendizaje real que transferir.
No aplica en microajustes rutinarios, correcciones de texto ni cierres sin aprendizaje nuevo.

**Alias legacy:**
- `BRAIN_TRANSFER`: nombre anterior del bloque en el Brain. Compatible; se migra oportunistamente.
- `DOBLE_ROI`: nombre anterior de este concepto en lafabrica. Compatible; se migra oportunistamente.
No existe en este repo ninguno de los dos alias — la instalación se hace directamente en el estándar actual.

**Flujo estándar sin autorización explícita:**
El repo genera el bloque en el cierre de sesión → si merece persistencia, se añade en
`docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md` → el Brain absorbe cuando Pablo lo pida.
Escritura directa al Brain solo con `DIRECT_BRAIN_WRITE_ALLOWED` en el prompt.

**Razonamiento:**
Un único concepto por función evita duplicar esfuerzo entre `BRAIN_TRANSFER` y `DOBLE_ROI`.
El estándar unificado es más portable entre proyectos y captura los dos destinos de valor.

**Implicaciones:**
- AGENTS.md incluye el formato completo en `§Formato de reporte al orquestador`.
- ORCHESTRATOR.md incluye la regla de evaluación en §18.
- `docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md` es la cola local de candidatos.
- BACKLOG.md incluye `SESSION_LEARNING_TRANSFER_REVIEW_LOOP` como tarea transversal.

---

### DEC-12 — Absorción de reglas del Operating Brain y patrones de lafabrica en Catenaccio
**Fecha:** 2026-06-24 (Sesión 014 — meta-alineación)
**Tipo:** proceso / metodología
**Quién aprobó:** Pablo (prompt de sesión ALIGN_WITH_OPERATING_BRAIN_AND_LAFABRICA_V1)
**Estado:** ACTIVA

**Decisión:**
Absorber en los documentos operativos de Catenaccio:

1. Reglas personales de orquestación de Pablo (Operating Brain §13):
   - RULE-01: Revisión fría tras 3 sesiones sin convergencia
   - RULE-02: PABLO_VISUAL_OK como único gate visual
   - RULE-03: Staging es sintaxis; producción valida comportamiento
   - RULE-04: No ampliar mientras falla el flujo crítico
   - RULE-05: Cambiar de agente es decisión de gestión
   - DEC-PABLO-01: Cadena de agentes por tipo de tarea
   - DEC-PABLO-02: No PASS sin TEST B real
   - DEC-PABLO-03: Staging sin SMTP — declararlo antes

2. Patrones del sistema operativo madre (lafabrica PATTERN-05 a PATTERN-09):
   - PATTERN-05: AI_FIRST_LAYERED_DOCUMENTATION — activar cuando sesiones >30
   - PATTERN-06: AGENT_EXPERIENCE_LEDGER — instanciado en `docs/meta/AGENT_EXPERIENCE_LEDGER.md`
   - PATTERN-07: STOP_AND_REPLAN_MICROPATCH_PROTOCOL
   - PATTERN-08: TRANSACTIONAL_EMAIL_PRODUCTION_GATE
   - PATTERN-09: ECOMMERCE_HOOK_STATE_GUARD

3. Equivalencias técnicas PrestaShop → WooCommerce del Incident Playbook de lafabrica.

**Archivos modificados en esta sesión:**
- `ORCHESTRATOR.md` — §19 añadido (reglas + patrones + equivalencias)
- `AGENTS.md` — guardrails de email y hooks WC; protocolo STOP_AND_REPLAN; referencia al Ledger
- `docs/meta/AGENT_EXPERIENCE_LEDGER.md` — CREADO (6 entradas: 4 de sesiones pasadas + 2 placeholders)
- `DECISIONS.md` — DEC-12 añadido
- `BACKLOG.md` — tareas de alineación añadidas
- `CONTEXTO.md` — fase y sesión 014 appendeadas

**Razonamiento:**
Catenaccio tiene 14 sesiones activas y está entrando en la fase de implementación técnica real
(shadow release, hooks WC, emails). Sin estas reglas absorbidas, la próxima sesión de implementación
podría repetir errores ya documentados en Bijuymoda Suite (microparches infinitos, staging sin SMTP,
validación visual omitida). La absorción es documental; no requiere código.

**Qué NO se absorbió:**
- Lógica específica de Bijuymoda (PrestaShop hooks, b2bregister, OPC, B2B)
- Datos privados de ningún tipo (clientes, pedidos, credenciales, rutas de servidor)
- Estrategia comercial de Bijuymoda
- Código PHP específico de Bijuymoda

**Implicaciones:**
- Toda tarea futura de email transaccional WC → declarar PRODUCTION_ONLY_VALIDATION antes de abrir.
- Toda tarea de hook WC → usar estado del objeto, no contexto de ejecución.
- Si un agente lleva 3 sesiones sin convergencia → STOP_AND_REPLAN obligatorio.
- `docs/meta/AGENT_EXPERIENCE_LEDGER.md` — consultar al inicio de tareas de tipo registrado.

---

### PEND-2 — Marketplace multi-vendor (NORTH_STAR / DEFER)
**Fecha:** 2026-06-13 (Sesión 005c)  
**Tipo:** estratégica / visión largo plazo  
**Estado:** ✅ NORTH_STAR / DEFER — confirmado por el operador el 2026-06-13

**Contexto:**
Pablo declara que la visión a largo plazo de Catenaccio es un marketplace especializado en camisetas de fútbol — sistema donde otros coleccionistas puedan publicar sus propias camisetas bajo la marca Catenaccio.

**Por qué es NORTH_STAR y no MVP:**
- El marketplace requiere primero que Catenaccio tenga tracción propia (ventas recurrentes, tráfico orgánico, reputación).
- No está clara la propuesta de valor frente a Vinted para un vendedor externo hoy.
- Construir multi-vendor antes de validar el mercado es el error más caro en e-commerce.
- Pablo lo reconoció explícitamente: "El marketplace es difícil de escalar."

**Gates para activar (ver TARGET_OPTIONS.md §11):**
100+ productos propios vendiendo, tráfico orgánico ≥1.000 visitas/mes, ventas recurrentes, propuesta de valor definida frente a Vinted, sistema de autenticidad, modelo económico decidido.

**Implicación de diseño ahora:**
Incluir `owner_id` en el modelo de producto de Studio (aunque sea siempre Pablo en Fase 2). Diseñar autenticación de Studio con JWT/sesiones propias. No añadir features de marketplace al MVP.

**No activar PEND-2 sin revisión explícita con evidencia de las gates.** Ver BACKLOG.md → LATER → MARKETPLACE_NORTH_STAR_VALIDATION.

