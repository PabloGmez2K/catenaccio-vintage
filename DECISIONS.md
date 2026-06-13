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
**Fecha de recomendación corregida (005b):** 2026-06-13 — Estrategia A0 + B1 (ver abajo)  
**Tipo:** estratégica  
**Estado:** RECOMENDACIÓN FUERTE — pendiente de aprobación explícita del operador

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

**Condición para convertirse en decisión formal:**
El operador aprueba explícitamente A0 + B1. Ver pregunta en TARGET_OPTIONS.md sección 12.

**Implicaciones si se aprueba:**
- Sesión 006: Track 0 — auditoría elementor_library + fixes + validación visual Pablo.
- Sesión 006 paralela / 007: Track 1 — diseño formulario Studio + Application Password + test WC API.
- Stack a largo plazo: WooCommerce como motor de venta/pagos + Studio como capa editorial AI-first.

