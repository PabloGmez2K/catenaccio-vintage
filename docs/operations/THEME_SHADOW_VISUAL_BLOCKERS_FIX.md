# THEME_SHADOW_VISUAL_BLOCKERS_FIX — Sesión 016

**Fecha:** 2026-06-27  
**Agente:** Claude Code (Sonnet)  
**Modo:** LOCAL_CODE_ONLY / SHADOW_THEME_VISUAL_FIX  
**Resultado:** COMPLETED  
**Veredicto:** APPROVE_READY_FOR_SHADOW_RESYNC

---

## Contexto

Pablo realizó una preview manual del tema sombra `catenaccio-a0-child` (ya sincronizado en servidor, sin activar) y detectó los siguientes blockers visuales:

| Área | Estado previo |
|------|--------------|
| Header desktop | FAIL — logo/menú/carrito no correctos; botón menú visible en desktop |
| Off-canvas panel | FAIL — scroll horizontal; títulos no se adaptan; "Explorar colección" desborda |
| Mini-carrito | FAIL — overlay/dropdown se superpone al grid de productos |
| Filtros sidebar | FAIL — diseño tosco, sin jerarquía visual |
| Producto individual | PASS con fallos menores de diseño |
| Archive/categoría | PASS |

---

## Causa raíz por blocker

### A. Header desktop
`woocommerce_mini_cart()` se llamaba **inline** dentro del `.cv-header__actions`. Esta función vuelca la lista completa de ítems del carrito + totales + botones directamente en el DOM del header, no como un dropdown. Resultado: el header tiene contenido de carrito expandido inline que empuja el layout y aparece sobre el grid al hacer scroll.

El toggle off-canvas tenía `display: none` pero sin `!important`, lo que en la preview del Customizer (donde se inyectan estilos del parent theme `hello-elementor`) podía ser sobreescrito.

### B. Off-canvas panel
El panel tenía `overflow-y: auto` pero sin `overflow-x: hidden`. El shortcode `[catenaccio_offcanvas_menu]` puede generar contenido (links largos, títulos de colección) que excede el ancho del panel, causando scroll horizontal del viewport.

### C. Mini-carrito
Misma causa que A: `woocommerce_mini_cart()` inline es la causa directa del overlay sobre el grid.

### D. Filtros sidebar
Faltaba CSS defensivo para el output HTML de los shortcodes `[filtro_taxonomico]`. El plugin genera listas, títulos y links sin clases específicas que el tema pudiera seleccionar — sin reglas defensivas, hereda estilos del parent theme que dan anchos excesivos.

### E. Toggle desktop visible
`display: none` sin `!important` + ausencia de media query negativa (`min-width: 769px`).

---

## Cambios aplicados

### `catenaccio-a0-child/header.php`

**Antes:**
```php
<div class="cv-mini-cart" id="cv-mini-cart">
  <?php woocommerce_mini_cart(); ?>
</div>
```

**Después:** Estructura trigger + dropdown. `woocommerce_mini_cart()` queda dentro de un `div[aria-hidden="true"]` que JS abre/cierra. Se muestra un botón con icono 🛒 + contador de ítems.

```php
<div class="cv-mini-cart" id="cv-mini-cart">
  <button class="cv-mini-cart__trigger" ... aria-expanded="false">
    <span class="cv-mini-cart__icon">&#128722;</span>
    <span class="cv-mini-cart__count">N</span>
  </button>
  <div class="cv-mini-cart__dropdown" id="cv-mini-cart-dropdown" aria-hidden="true">
    <?php woocommerce_mini_cart(); ?>
  </div>
</div>
```

### `catenaccio-a0-child/assets/css/cv-a0.css`

Añadidos ~180 líneas:

1. **Mini-cart trigger/dropdown**: `.cv-mini-cart__trigger`, `.cv-mini-cart__icon`, `.cv-mini-cart__count`, `.cv-mini-cart__dropdown` — dropdown `position:absolute`, `top: calc(100% + 6px)`, `right: 0`, `width: 300px`, `z-index: 200`, `aria-hidden="false"` como selector de visibilidad.

2. **Toggle desktop override**:
   ```css
   @media (min-width: 769px) {
     .cv-offcanvas-toggle { display: none !important; }
   }
   ```

3. **Offcanvas overflow**: `overflow-x: hidden` en `.cv-offcanvas-panel`. Reglas `word-break: break-word`, `overflow-wrap: break-word`, `font-size: clamp(...)` en headings/links del inner.

4. **Sidebar filtros**: CSS defensivo para `ul/li/a` dentro de `.cv-archive-sidebar` — lista sin estilos WP, separadores, hover states, títulos de sección, contenedores por filtro con borde inferior.

5. **Toolbar overflow**: `max-width: 100%; overflow: hidden` en hijos directos de `.cv-archive-toolbar`.

### `catenaccio-a0-child/assets/js/cv-a0.js`

Añadido bloque `MINI-CART DROPDOWN TOGGLE` (~35 líneas):
- Toggle por click en `.cv-mini-cart__trigger`
- Cierre por click fuera del componente
- Cierre por ESC

---

## Validaciones

| Check | Resultado |
|-------|-----------|
| `git diff --check` | PASS |
| `git status` | 3 archivos modificados, todos en scope |
| PHP lint | NOT_AVAILABLE (PHP CLI no instalado en PATH) |
| Secret scan (grep diff) | CLEAN |
| Scope check | CLEAN — solo `catenaccio-a0-child/header.php`, `assets/css/cv-a0.css`, `assets/js/cv-a0.js` |
| Shortcodes literales añadidos | NINGUNO |
| Referencias absolutas locales | NINGUNA |
| Dependencia nueva Elementor | NINGUNA |

---

## Qué NO se tocó

- `hello-elementor-child/` — intacto
- `catenaccio-a0-child/functions.php` — no modificado
- Servidor / cPanel / WP Admin — nada
- DB / plugins / WooCommerce settings — nada
- Pagos / pedidos / clientes / stock — nada
- `.env.local` — no tocado
- `woocommerce/archive-product.php` — no modificado
- `woocommerce/content-product.php` — no modificado
- `woocommerce/single-product.php` — no modificado

---

## Estado post-fix

El tema sombra requiere un **resync a servidor** antes de que Pablo pueda repetir la preview manual. Los cambios son locales hasta ese punto.

| Blocker | Estado post-fix |
|---------|----------------|
| A. Header desktop — toggle visible | MITIGADO — `display:none!important` en `min-width:769px` |
| B. Off-canvas scroll horizontal | MITIGADO — `overflow-x:hidden` + word-break |
| C. Mini-cart overlay grid | MITIGADO — ahora dropdown contenido, no inline |
| D. Filtros sidebar design | MITIGADO — CSS defensivo básico |
| E. Producto/archive | SIN CAMBIOS (PASS previo mantenido) |

---

## Siguiente paso

1. **Resync a servidor** — Abrir sesión Codex para subir los 3 archivos modificados a `public_html/wp-content/themes/catenaccio-a0-child/` (mismo flujo que Sesión 014-sync, solo 3 archivos esta vez).
2. **Pablo repite preview manual** — desde WP Admin Customizer con su navegador autenticado.
3. Si preview pasa → **RELEASE_MANUAL_PABLO**.
