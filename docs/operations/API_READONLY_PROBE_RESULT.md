# API_READONLY_PROBE_RESULT — Catenaccio Vintage

Resultado del probe de solo lectura a la API de WordPress/WooCommerce sin SSH.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-13  
**Sesión:** 007 (público) + 007b (autenticado)  
**Modo:** READ_ONLY — ningún POST, PUT, PATCH ni DELETE ejecutado  
**Agente:** Claude Code (Sonnet)  
**Site URL testada:** `https://catenacciovintage.com`

---

## 1. VEREDICTO

**Acceso confirmado. Probe completo ejecutado.**

- Application Password de `catenaccio-studio-agent` (rol: `shop_manager`) funciona correctamente.
- WC REST API v3: acceso total de lectura. 28 productos. 7 atributos. Terms resueltos.
- Elementor Pro: licencia **activa** (`isExpired: false`). 14 templates listados por tipo.
- **Hallazgo crítico:** los productos actuales almacenan los atributos como ACF meta fields (IDs de término), no como WC product attributes. El campo WC `attributes` está vacío para todos los productos.
- Elementor template content: requiere Application Password de **Administrator** — shop_manager ve la lista pero no el contenido de cada template. Fallback: WP Admin visual.

---

## 2. CREDENCIALES VERIFICADAS

| Check | Resultado |
|-------|-----------|
| `.env.local` existe | ✅ |
| Ignorado por Git | ✅ `.gitignore`: `.env.*` + `.env.local` explícito |
| `WP_SITE_URL` definida | ✅ |
| `WP_APP_USER` definida | ✅ |
| `WP_APP_PASSWORD` definida | ✅ (longitud 29 — formato correcto con espacios) |
| Auth `wp/v2/users/me` | ✅ 200 OK |
| Usuario ID | 16 |
| Slug | `catenaccio-studio-agent` |
| Rol | `shop_manager` (= "Gestor de la tienda") |
| Capacidad `manage_woocommerce` | ✅ confirmada |

---

## 3. RESULTADOS POR ENDPOINT

### 3.1 Endpoints públicos (sin autenticación)

| Endpoint | Status | Resultado |
|----------|--------|-----------|
| `GET /wp-json/` | **200** | 37 namespaces. `elementor-pro/v1` activo. |
| `GET /wp-json/wp/v2/types` | **200** | 16 post types. `elementor_library` visible. |
| `GET /wc/store/v1/products?per_page=100` | **200** | 28 productos. `X-WP-Total: 28`. |
| `GET /wc/store/v1/products/categories` | **200** | 4 categorías. |

### 3.2 Endpoints autenticados — Application Password (shop_manager)

| Endpoint | Status | Resultado |
|----------|--------|-----------|
| `GET /wp/v2/users/me?context=edit` | **200** | Usuario, rol, capacidades WC. |
| `GET /wc/v3/products?per_page=10` | **200** | 28 productos. `attrs=0` (ver §5). |
| `GET /wc/v3/products/1792` | **200** | Producto completo. Meta fields con atributos. |
| `GET /wc/v3/products/attributes` | **200** | 7 atributos (pa_liga, pa_equipo, etc.). |
| `GET /wc/v3/products/attributes/5/terms` (pa_liga) | **200** | 6 ligas. |
| `GET /wc/v3/products/attributes/4/terms` (pa_equipo) | **200** | 21 equipos. Total en API. |
| `GET /elementor/v1/site-editor/templates` | **200** | 14 templates. Tipos y estados. |
| `GET /elementor-pro/v1/license/get-license-status` | **200** | `{"isExpired":false}` |
| `GET /elementor-pro/v1/license/tier-features` | **200** | Features disponibles. |
| `GET /wp/v2/elementor_library?context=edit` | **403** | Requiere Administrator. |
| `GET /elementor/v1/post?id=653` | **403** | Requiere Administrator. |

---

## 4. DATOS CONFIRMADOS

### WordPress / WooCommerce

```
Productos activos:   28
Categorías WC:       4
  - Leyendas (14), Nuevo (16), Selecciones Nacionales (9), Sin categorizar (5)
Precios:             EUR, enteros (45 = €45.00 — no cents en WC REST API v3)
```

### Atributos WooCommerce (taxonomías)

| ID | Nombre | Slug | Terms conocidos |
|----|--------|------|-----------------|
| 7 | Año | `pa_ano` | — |
| 2 | Condición | `pa_condicion` | — |
| 4 | Equipo | `pa_equipo` | 21 términos (Ajax, Bayern, Barcelona…) |
| 6 | Jugador | `pa_jugador` | — |
| 5 | Liga | `pa_liga` | 6 (Bundesliga, Eredivisie, LaLiga, Ligue 1, Premier, Serie A) |
| 3 | Marca | `pa_marca` | — |
| 1 | Talla | `pa_talla` | — |

### Equipos en pa_equipo (21 términos confirmados)

AC Milan, Ajax, Alemania, Arsenal, AS Roma, Bayern Munich, Borussia Dortmund, Colombia, Escocia, FC Barcelona, Francia, Juventus, Lazio, Liverpool, Málaga, Manchester United, Paraguay, PSG, Paris Saint-Germain, Real Madrid + más.

---

## 5. HALLAZGO CRÍTICO — MODELO DE DATOS REAL

**Los productos NO usan WC product attributes. Usan ACF meta fields.**

Todos los productos tienen `attributes: []` (vacío) en WC REST API v3. Los atributos están almacenados en `meta_data` como pares clave-valor:

```
meta_data de producto 1792 (2014-15 France Away Shirt):
  liga         = ''         ← vacío (Francia = selección, no liga de club)
  equipo       = '129'      ← ID del término "Francia" en pa_equipo
  jugador      = ''
  ano_temporada = '139'     ← ID del término en pa_ano
  talla        = 'XXL'      ← string directo
  condicion    = 'Excelente' ← string directo
  descripcion_del_producto = '<p>...</p>'  ← HTML generado por Claude
```

**Resolución de IDs confirmada:**
- `pa_equipo` id=129 → "Francia"
- `pa_liga` id=177 → "Eredivisie", id=72 → "LaLiga", id=95 → "Premier League", id=51 → "Serie A"

**Por qué esto importa para Studio:**

| Escenario | Implicación |
|-----------|-------------|
| Studio crea un producto | Debe escribir en `meta_data`, no en `attributes[]` |
| Filtro Camisetas Pro | Lee de ACF meta fields — Studio debe respetar este contrato |
| Formato de IDs vs strings | `liga`, `equipo`, `jugador`, `ano_temporada` → term IDs. `talla`, `condicion` → strings directos |
| `descripcion_del_producto` | Campo ACF donde va la descripción larga generada por Claude |

**Nota:** las taxonomías pa_ tienen terms con counts correctos (pa_equipo: Ajax count=1, Francia count=3, etc.), lo que confirma que los productos SÍ están asignados a los términos WC vía `wp_term_relationships` — pero la relación no pasa por `_product_attributes`, que es lo que expone el campo `attributes[]` de WC REST API. Los ACF fields almacenan el ID del término como referencia; el Filtro Camisetas Pro usa ambas rutas.

---

## 6. ELEMENTOR — TEMPLATES Y LICENCIA

### Licencia Pro

```json
{"isExpired": false}
```

**Elementor Pro 3.35.1 sigue activo** (expira ~2026-07-01, quedan ~18 días desde 2026-06-13).

### Templates en elementor_library (14 registros)

| ID | Título | Tipo | Status | Dep. Pro |
|----|--------|------|--------|----------|
| 1471 | Elementos Buscador | `loop-item` | publish | **PRO** |
| 1414 | Elementor Archivo de productos #1414 | `product-archive` | publish | **PRO** |
| 1107 | Elementor Página individual #1107 | `single-page` | draft | — |
| 892 | Grid de Tienda | `loop-item` | publish | **PRO** |
| 878 | Elementor Elemento de bucle #878 | `loop-item` | publish | **PRO** |
| 833 | Elementor Error 404 #833 | `error-404` | publish | PRO (Theme Builder) |
| 761 | Elementor Resultados de búsqueda #761 | `search-results` | publish | **PRO** |
| 720 | Live Results - Search | `loop-item` | publish | **PRO** |
| 653 | Cabecera simple | `header` | publish | **PRO** (Theme Builder) |
| 354 | Slide de productos recientes | `loop-item` | publish | **PRO** |
| 141 | Plantilla Página Individual | `single-page` | publish | — (depende del contenido) |
| 129 | Archivo de Productos - Loop + Filtro personalizado | `product-archive` | publish | **PRO** |
| 100 | Plantilla producto individual | `product` | publish | **PRO** (WC Single Product) |
| 87 | Elementor Pie de página #87 | `footer` | publish | **PRO** (Theme Builder) |

**Resumen por tipo:**
- `loop-item` × 5 → Elementor Loop — **exclusivo Pro**
- `product-archive` × 2 → WooCommerce Archive — **exclusivo Pro**
- `product` × 1 → WooCommerce Single Product — **exclusivo Pro**
- `header` × 1 → Theme Builder — **exclusivo Pro**
- `footer` × 1 → Theme Builder — **exclusivo Pro**
- `error-404` × 1 → Theme Builder — **Pro (puede hacerse con página estática)**
- `search-results` × 1 → Theme Builder — **Pro**
- `single-page` × 2 → genérico — sin información de widgets todavía

**12 de 14 templates son definitivamente Pro-dependientes por su tipo.**

### Límite de permisos para el audit profundo

El rol `shop_manager` puede:
- ✅ Listar templates (`elementor/v1/site-editor/templates`)
- ✅ Ver tipo, ID, título, status
- ❌ Leer el JSON de Elementor con widgets (`elementor/v1/post?id=X` → 403)
- ❌ Leer `_elementor_data` meta field via `wp/v2/elementor_library?context=edit` → 403

Para el widget-level audit necesitamos una de estas opciones:
- **Opción A:** Application Password de un usuario Administrador (no shop_manager).
- **Opción B:** WP Admin supervisado — Pablo abre Elementor Library, el agente inspecciona.

La Opción A es la más limpia. El agente no necesita acceso admin permanente — solo para la sesión de auditoría de Elementor, con credenciales separadas y revocables.

---

## 7. MAPA DE ACCESO REAL (shop_manager)

| Operación | shop_manager | Notas |
|-----------|-------------|-------|
| Leer productos WC | ✅ | wc/v3/products — completo |
| Leer atributos WC + terms | ✅ | wc/v3/products/attributes + /terms |
| Leer categorías WC | ✅ | wc/v3/products/categories |
| Crear producto en draft | ✅ probable | A testear en sesión de escritura |
| Leer meta fields (ACF) | ✅ | En meta_data del producto |
| Escribir meta fields (ACF) | ✅ probable | WC REST API admite meta_data writes |
| Leer lista de templates Elementor | ✅ | elementor/v1/site-editor/templates |
| Leer JSON de template Elementor | ❌ 403 | Requiere Administrator |
| Leer Elementor Pro license | ✅ | isExpired: false |
| WP Admin acceso | N/A | Solo Pablo |

---

## 8. IMPLICACIONES PARA STUDIO (cambio de diseño)

### Campo de atributos en Studio → meta_data, no attributes[]

Cuando Studio cree un producto via WC REST API:

```json
{
  "name": "2014-15 France Away Shirt - (XXL)",
  "status": "draft",
  "meta_data": [
    { "key": "liga",           "value": "" },
    { "key": "equipo",         "value": "129" },
    { "key": "ano_temporada",  "value": "139" },
    { "key": "talla",          "value": "XXL" },
    { "key": "condicion",      "value": "Excelente" },
    { "key": "jugador",        "value": "" },
    { "key": "descripcion_del_producto", "value": "<p>...</p>" }
  ]
}
```

Studio necesita:
1. Un selector de `liga` → lista los terms de pa_liga via `GET /wc/v3/products/attributes/5/terms`.
2. Un selector de `equipo` → lista los terms de pa_equipo via `GET /wc/v3/products/attributes/4/terms`.
3. Al guardar: convertir el term seleccionado a su ID para el campo meta.
4. `talla` y `condicion`: strings directos (no term IDs).

---

## 9. NOTA — SESIÓN 008: WIDGET-LEVEL AUDIT COMPLETADO

Sesión 008 elevó `catenaccio-studio-agent` temporalmente a Administrator.  
Auditoría widget-level completada via `wp/v2/elementor_library/{id}?context=edit`.  
Ver `docs/operations/ELEMENTOR_DEPENDENCY_AUDIT.md` para el análisis completo.

**Hallazgo adicional sesión 008:**
- Carrito (id=25) y Mi cuenta (id=27) usan widgets Pro (`woocommerce-cart`, `woocommerce-my-account`).
- Finalizar compra (id=1548) NO usa Elementor — ya en WooCommerce Blocks ✅.
- 15/20 elementos auditados requieren migración antes del 2026-07-01.

## 10. PRÓXIMOS PASOS

| Paso | Sesión | Acción |
|------|--------|--------|
| A0_MIGRATION_PLAN | 009 | Plan técnico de migración basado en ELEMENTOR_DEPENDENCY_AUDIT.md. Prioridades P1-A/B/C. |
| Studio — diseño de formulario | 009 | Usar `GET /wc/v3/products/attributes/{id}/terms` para poblar selectores. Escribir en `meta_data`. |
| Studio — test de escritura | 009 | `POST /wc/v3/products` con `status: draft` + `meta_data`. Confirmar que Filtro Pro los lee. |
| Carrito + Mi Cuenta — quick win | Inmediato (Pablo) | Reemplazar widgets Pro por shortcodes `[woocommerce_cart]` / `[woocommerce_my_account]` en Elementor. 10 min. |

---

*Versión 007 (público) + 007b (autenticado) + 008 (admin audit) — 2026-06-13 — Claude Code Sonnet.*  
*Probe y auditoría ejecutados en modo estrictamente READ_ONLY. Ningún write al sitio.*  
*Credenciales no almacenadas en este documento. Ver `.env.local` (ignorado por Git).*
