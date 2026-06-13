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

### PEND-1 → DEC-8 — Arquitectura TARGET recomendada: Opción A (WP+WC sin Elementor Pro)
**Fecha original:** 2026-06-06  
**Fecha de recomendación fuerte:** 2026-06-13 (Sesión 005)  
**Tipo:** estratégica  
**Estado:** RECOMENDACIÓN FUERTE — pendiente de aprobación explícita del operador

**Recomendación del agente (Sesión 005):**
APPROVE Opción A — mantener WordPress + WooCommerce y eliminar la dependencia de Elementor Pro migrando el frontend a bloques Gutenberg/WooCommerce antes del 2026-07-01.

**Razonamiento:**
1. El Checkout ya fue migrado a Gutenberg Checkout Blocks en febrero 2026 — la parte más crítica ya está hecha. El riesgo de pagos al eliminar Elementor Pro es prácticamente cero.
2. La migración del frontend de catálogo (19 items elementor_library + Cart + Mi Cuenta + mini-cart) es manejable en 5-14 días focales.
3. Las opciones alternativas (headless, migración completa, Shopify) son inviables antes del deadline de 2026-07-01 y añaden riesgo sin resolver el problema inmediato.
4. El cuello de botella real no es el frontend — es el catálogo (28 productos vs. objetivo 100+). Opción A libera energía hacia el catálogo.

**Alternativas descartadas:**
- B (headless): WooPayments no soporta headless en producción — STOP.
- C (migración completa): no factible antes del deadline — DEFER (reevaluar con evidencia en 6-12 meses).
- D (aplazar): fallback aceptable solo si Opción A resulta más compleja de lo esperado en la primera semana.
- E (Shopify): pérdida de activos reales sin justificación — STOP.

**Condición para convertirse en decisión formal (DEC-8):**
El operador aprueba explícitamente la Opción A. Ver pregunta en TARGET_OPTIONS.md sección 9.

**Implicaciones si se aprueba:**
- Próxima sesión: auditoría de los 19 items elementor_library en WP Admin (read-only).
- Siguiente sesión: migración de Cart, Mi Cuenta y mini-cart.
- Plazo de implementación: 5-14 días antes del 2026-07-01.
- Stack a largo plazo: WordPress + WooCommerce + Gutenberg blocks + tema ligero. Elementor eliminado completamente o solo en free para contenido estático.

