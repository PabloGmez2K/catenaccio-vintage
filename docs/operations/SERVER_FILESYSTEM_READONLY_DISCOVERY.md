# SERVER_FILESYSTEM_READONLY_DISCOVERY — Catenaccio Vintage

Discovery de la estructura real del filesystem del servidor: child theme, plugins custom, overrides Elementor.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-14  
**Sesión:** 010A  
**Modo:** READ_ONLY (PROPFIND / GET / HEAD únicamente)  
**Agente:** Claude Code (Sonnet)  
**Método intentado:** cPanel Web Disk / WebDAV (cv-readonly@catenacciovintage.com)  
**Prerequisito para:** A0_MIGRATION_PLAN

---

## 1. ESTADO GENERAL

```
BLOCKED_WEBDAV_CONNECTION
```

El acceso WebDAV al servidor no pudo establecerse. El Web Disk fue configurado correctamente en cPanel por Pablo, pero los puertos WebDAV de cPanel están bloqueados por el firewall de Raiola desde redes externas.

**Veredicto final:**

```
FIX_BLOCKER_FIRST
```

El A0_MIGRATION_PLAN no puede escribirse sin conocer el contenido real de `functions.php` y los plugins custom. Ver §5 para las dos rutas de desbloqueo.

---

## 2. DIAGNÓSTICO DE CONEXIÓN

### 2.1 Resultados del probe (2026-06-14)

| URL intentada | Resultado |
|---------------|-----------|
| `https://catenacciovintage.com:2078/` | **TIMEOUT** — puerto bloqueado por firewall |
| `http://catenacciovintage.com:2077/` | **TIMEOUT** — puerto bloqueado por firewall |
| `https://webdisk.catenacciovintage.com/` | **ConnectionError** — DNS no resuelve |
| `https://webdisk.catenacciovintage.com:2078/` | **ConnectionError** — DNS no resuelve |
| `https://catenacciovintage.com/` (HEAD) | **200 OK** — sitio web accesible |
| `https://catenacciovintage.com/` (PROPFIND) | **403 Forbidden** — WebDAV no habilitado en puerto 443 |

### 2.2 Causa raíz

Raiola Networks Inicio SSD 2.0 **bloquea los puertos 2077/2078 desde redes externas** en planes compartidos. El Web Disk de cPanel solo es accesible desde la red interna de Raiola o mediante VPN específica del proveedor. Comportamiento documentado y común en hosting compartido español.

El subdominio `webdisk.catenacciovintage.com` tampoco tiene entrada DNS — cPanel lo genera pero el registro A/CNAME debe apuntar al servidor (normalmente lo hace automáticamente, pero puede no estar propagado o no estar habilitado en este plan).

### 2.3 Read-only verification

```
READ_ONLY_NOT_VERIFIED — no se ejecutó ninguna escritura.
La configuración read-only del Web Disk (cPanel) se asume por configuración del operador.
No se intentó PUT/POST/DELETE/MKCOL/MOVE en ningún momento.
```

---

## 3. LO QUE YA SABEMOS — SIN FILESYSTEM

Aunque el acceso WebDAV está bloqueado, las sesiones anteriores aportaron información significativa sobre la estructura del servidor.

### 3.1 Child theme: hello-elementor-child

**Fuentes:** AS_IS_UNDERSTANDING.md (SRC-02, SRC-04), API probe 007b, Elementor audit 008.

| Hecho | Fuente | Confianza |
|-------|--------|-----------|
| Tema hijo activo: `hello-elementor-child` | AS_IS (SRC-02) | Alta |
| Tiene `functions.php` con rewrite rules custom | AS_IS (SRC-02) | Alta |
| URLs limpias WooCommerce via `add_rewrite_rule` + transients | AS_IS (SRC-02) | Alta |
| IVA 21% calculado vía snippet en `functions.php` | AS_IS (SRC-02) | Alta |
| Shop base URL: `/camisetas/` (no `/shop/`) | API probe 007b | Confirmado |
| Checkout: `/finalizar-compra/` | API probe 007b | Confirmado |
| ACF FREE v6.7.0 activo — 16 post types, 20 taxonomías | AS_IS (Server Check 003) | Confirmado |
| No hay SSH ni acceso CLI al servidor | AS_IS, Raiola plan | Confirmado |

**Ficheros probablemente presentes en `hello-elementor-child/`:**
- `style.css` — obligatorio (header de tema hijo)
- `functions.php` — confirmado con lógica de rewrite y WC hooks
- Posiblemente: `header.php`, `footer.php`, `woocommerce/` (overrides WC templates)

**Dependencias inferidas en `functions.php`:**
- `add_rewrite_rule` / `flush_rewrite_rules` — URLs limpias `/camisetas/`
- Hooks WooCommerce (IVA, envío, precios)
- Posiblemente hooks ACF para meta fields `liga`, `equipo`, `ano_temporada`
- Desconocido: ¿dependencias directas de Elementor? ¿shortcodes propios?

### 3.2 Plugins custom

Confirmados por AS_IS (SRC-02, SRC-04) y Server Context Check (sesión 003):

#### Filtro Camisetas Pro v3.0.0

| Atributo | Valor conocido |
|----------|---------------|
| Estado | Activo en producción |
| Versión | 3.0.0 |
| Origen | Vibe coding + Claude |
| Rol en el sitio | Filtro de productos en shop/archive (page id=129) |
| Widget Elementor | `off-canvas` en template 129 (probablemente el panel lateral del filtro) |
| Loop | Interactúa con el loop-grid de Elementor (template 878) |
| AJAX | Probable — filtros en frontend suelen usar `wp_ajax_` / `wp_ajax_nopriv_` |
| Shortcode | Desconocido — requiere lectura del plugin |
| ACF | Probable — filtra por meta fields `liga`, `equipo`, `ano_temporada`, `talla`, `condicion` |

#### Off-Canvas Menu v2.2.0

| Atributo | Valor conocido |
|----------|---------------|
| Estado | Activo en producción |
| Versión | 2.2.0 |
| Origen | Vibe coding + Claude |
| Rol en el sitio | Menú móvil overlay — referenciado en header template 653 |
| Widget Elementor | `off-canvas` en header 653 (posiblemente el plugin registra este widget) |
| Shortcode | Desconocido |

#### Buscador AJAX (incierto)

Template 1471 "Elementos Buscador" y template 1468 "Buscador móvil" existen en Elementor. Podría ser un plugin propio o funcionalidad del tema. Requiere verificación.

### 3.3 MU-plugins

Desconocido. Raiola puede instalar mu-plugins propios (LiteSpeed Cache vive aquí en algunos setups). Requiere filesystem para confirmar.

### 3.4 Elementor uploads/css

El Elementor Pro activo genera CSS per-template en `uploads/elementor/css/`. Estos ficheros son compilados en runtime — no críticos para A0 (se regeneran al desactivar Pro). No bloquean la migración.

---

## 4. MAPA A0 — CON DATOS DISPONIBLES

Basado en ELEMENTOR_DEPENDENCY_AUDIT.md + lo que ya sabemos, el mapa A0 actual es:

### P1-A Header (template 653) — CRÍTICO

| Elemento | Estado conocido | Riesgo filesystem |
|----------|----------------|-------------------|
| `nav-menu` Pro | Reemplazar por WP native nav menu | Bajo — no depende de child theme |
| `woocommerce-menu-cart` Pro | Reemplazar por shortcode `[woocommerce_cart_link]` | Bajo |
| `off-canvas` (Off-Canvas Menu plugin) | Mantener si el plugin funciona sin Pro | **Alto** — necesito ver cómo el plugin registra el widget |
| Menú móvil (popup 661) | Reemplazar nav-menu Pro | Bajo |

**Riesgo A0-P1A principal:** si `off-canvas` en el header es un widget registrado por Elementor Pro (no por el plugin Off-Canvas Menu), desaparece al desactivar Pro. Si es el plugin propio, sobrevive.  
**Necesito para resolver:** leer el archivo principal de Off-Canvas Menu plugin.

### P1-B Producto individual (template 100) — CRÍTICO

| Elemento | Estado conocido | Riesgo filesystem |
|----------|----------------|-------------------|
| 5 widgets WC Pro | Reemplazar por WooCommerce Blocks o `do_action('woocommerce_*')` hooks | Medio |
| URL limpia `/producto/{slug}` | Depende de `functions.php` — rewrite rule | **Alto** — tocar WP Rewrite puede romper URLs |
| ACF meta fields en PDP | Desconocido — ¿se muestran via shortcode? ¿via template PHP? | **Alto** — sin ver template PHP ni funciones.php no sabemos |

### P1-C Archivo productos (template 129) — CRÍTICO

| Elemento | Estado conocido | Riesgo filesystem |
|----------|----------------|-------------------|
| `loop-grid` Pro + loop-item 878 | Reemplazar por `woocommerce_product_loop` PHP nativo o WC Blocks | Medio |
| Filtro Camisetas Pro (`off-canvas` panel) | Mantener — el filtro es el plugin propio | **Muy alto** — sin código del plugin no sé si el panel lateral puede desacoplarse de Elementor |
| URL `/camisetas/` + `/camisetas/liga/laliga/` | Depende de rewrite rules en functions.php | **Alto** |

### P2 Carrito / Mi Cuenta — ALTO

Quick win disponible (sin filesystem):
- Carrito id=25: reemplazar `woocommerce-cart` Pro widget por `[woocommerce_cart]` shortcode en WP Admin
- Mi Cuenta id=27: reemplazar `woocommerce-my-account` Pro widget por `[woocommerce_my_account]` shortcode en WP Admin
- **Esta acción NO requiere filesystem y puede hacerse YA** (ver BACKLOG: CARRITO_MICUENTA_QUICKWIN)

---

## 5. RUTAS DE DESBLOQUEO

Hay dos caminos para obtener los ficheros necesarios. Recomendado: Ruta A (más rápido, sin configuración).

### Ruta A — Pablo pega los ficheros manualmente (30-40 min, sin configuración)

Pablo abre cPanel File Manager (funciona en cualquier plan Raiola) y copia el contenido de estos 4 ficheros:

1. `public_html/wp-content/themes/hello-elementor-child/functions.php`
2. `public_html/wp-content/themes/hello-elementor-child/style.css`
3. `public_html/wp-content/plugins/filtro-camisetas-pro/[main-file].php`  
   _(el nombre del directorio puede ser `filtro-camisetas-pro`, `filtro-camisetas`, o similar — buscar en `/plugins/`)_
4. `public_html/wp-content/plugins/off-canvas-menu/[main-file].php`  
   _(buscar en `/plugins/` por nombre similar)_

Pasos en cPanel File Manager:
1. cPanel → File Manager → navegar a `public_html/wp-content/`
2. Para cada fichero: clic derecho → View o Edit → Seleccionar todo → Copiar
3. Pegar en el chat en la próxima sesión (una sesión por fichero, o todos juntos)

Con estos 4 ficheros, el agente puede:
- Completar el análisis de dependencias
- Escribir A0_MIGRATION_PLAN con riesgos reales
- Identificar si Filtro Camisetas Pro puede sobrevivir sin Elementor Pro

**Tiempo estimado para Pablo:** 20-30 min en File Manager.  
**Tiempo agente post-ficheros:** 1 sesión (30 min) para A0_MIGRATION_PLAN completo.

### Ruta B — Corregir acceso WebDAV (más setup, más potente)

Requiere que Pablo compruebe en cPanel cuál es la URL exacta que muestra el cliente de Web Disk:

1. cPanel → Web Disk → clic en la cuenta `cv-readonly`
2. Botón "Client Configuration Scripts" o "Configure Client"
3. Apuntar la URL exacta que muestra (puede ser una IP de servidor Raiola, no el dominio)
4. Actualizar `CV_WEBDAV_URL` en `.env.local` con esa URL
5. Reintentar probe

También revisar en cPanel si hay un registro DNS `webdisk.catenacciovintage.com`:
- cPanel → Zone Editor → buscar `webdisk`
- Si no existe: añadir CNAME → `catenacciovintage.com` o A record → IP del servidor

**Nota:** Raiola puede tener el WebDAV deshabilitado en el plan actual. Si la URL del cliente de cPanel apunta al mismo host:2078 y sigue bloqueado, el proveedor no lo permite externamente.

---

## 6. RIESGOS IDENTIFICADOS — SIN FILESYSTEM

Estos riesgos se identifican como probables aunque no podamos confirmarlos hasta leer el código:

| Riesgo | Probabilidad | Impacto | Trigger |
|--------|-------------|---------|---------|
| URL rewrite en functions.php — tocar el child theme puede romper `/camisetas/` | Alta | Crítico | Cualquier modificación de tema activo |
| Filtro Camisetas Pro acoplado a Elementor `loop-grid` | Media | Alto | Desactivar Elementor Pro |
| Off-Canvas Menu registra widget Elementor Pro directamente | Media | Medio | Desactivar Elementor Pro |
| OPcache lleno (16 bytes libres) — nuevo PHP no se cachea | Alta (conocido) | Medio | Cualquier cambio de código |
| ACF meta fields referenciados en child theme (no via API) | Media | Medio | Si hay `get_field()` en functions.php |
| `flush_rewrite_rules()` no ejecutado después de cambios de tema | Alta (patrón WP) | Alto | Activar tema nuevo o cambiar slug base |

---

## 7. PLAN DE CONTINGENCIA — MIGRACIONES SIN SERVIDOR

Mientras se resuelve el blocker de filesystem, hay acciones que NO requieren leer el servidor:

### Inmediatas (Pablo, sin agente)
- [ ] **CARRITO_MICUENTA_QUICKWIN** — reemplazar widgets Pro en páginas Carrito (id=25) y Mi Cuenta (id=27) por shortcodes `[woocommerce_cart]` y `[woocommerce_my_account]` en WP Admin → Elementor. 10 min.

### Con filesystem (próxima sesión post-desbloqueo)
- [ ] Leer `functions.php` → analizar rewrite rules, hooks WC, shortcodes registrados, dependencias ACF/Elementor
- [ ] Leer plugin Filtro Camisetas Pro → shortcodes, AJAX endpoints, dependencia Elementor
- [ ] Leer plugin Off-Canvas Menu → si widget Elementor registrado o plugin independiente
- [ ] Revisar `themes/hello-elementor-child/woocommerce/` → si hay template overrides WC

### Sin filesystem, con API (posible en esta sesión)
La API WC ya está disponible (sesión 007b). Se podría enriquecer el análisis:
- `GET /wc/v3/products?per_page=1` → confirmar que `meta_data` sigue siendo la fuente de atributos
- `GET /wp/v2/pages/25` → confirmar estado actual de la página Carrito

---

## 8. ARCHIVOS PENDIENTES DE LEER

Lista exacta de lo que necesitamos para A0_MIGRATION_PLAN completo:

| Archivo | Importancia | Razón |
|---------|-------------|-------|
| `themes/hello-elementor-child/functions.php` | **Crítica** | Rewrite rules, WC hooks, shortcodes, ACF deps |
| `plugins/filtro-camisetas-pro/[main].php` | **Crítica** | AJAX endpoints, shortcodes, dep Elementor |
| `plugins/off-canvas-menu/[main].php` | **Alta** | Widget Elementor vs plugin independiente |
| `themes/hello-elementor-child/style.css` | Media | Versión del tema hijo, parent theme reference |
| `themes/hello-elementor-child/woocommerce/` | Media | Template overrides que podrían romperse |
| Listado completo de `plugins/` | Media | Confirmar nombres exactos de directorios |
| `mu-plugins/` contenido | Baja | Confirmar si Raiola instala mu-plugins |

---

## 9. HISTORIAL DE INTENTOS DE CONEXIÓN

```
2026-06-14T16:xx:xx — SESSION 010A
Script:    scripts/filesystem/webdav_probe.py
Método:    HEAD → https://catenacciovintage.com:2078/
Resultado: ConnectTimeout (15s)

Método:    HEAD → http://catenacciovintage.com:2077/
Resultado: ConnectTimeout (8s)

Método:    HEAD → https://webdisk.catenacciovintage.com/
Resultado: ConnectionError (DNS not found)

Método:    HEAD → https://catenacciovintage.com/
Resultado: 200 OK (website, no WebDAV)

Método:    PROPFIND → https://catenacciovintage.com/
Resultado: 403 Forbidden (WebDAV no habilitado en 443)

Conclusión: BLOCKED_WEBDAV_CONNECTION
Causa:     Puertos 2077/2078 bloqueados por firewall Raiola (shared hosting)
           webdisk subdomain DNS no configurado
           Puerto 443 no sirve WebDAV
```

---

## 10. VEREDICTO FINAL

```
BLOCKED_WEBDAV_CONNECTION → FIX_BLOCKER_FIRST
```

**Ruta más rápida:** Pablo pega manualmente 4 ficheros desde cPanel File Manager (§5 Ruta A).  
**Bloqueante para:** A0_MIGRATION_PLAN, APPROVE_THEME_SHADOW_FLOW  
**No bloqueante para:** CARRITO_MICUENTA_QUICKWIN (Pablo puede hacerlo ya en WP Admin)
