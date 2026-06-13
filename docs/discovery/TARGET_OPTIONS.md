# TARGET_OPTIONS — Catenaccio Vintage

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-13 (Sesión 005 + corrección 005b)  
**Basado en AS-IS validado:** 2026-06-10 (VAL-004)  
**Estado:** EN_REVISIÓN — pendiente de aprobación del operador  
**Opción aprobada:** ninguna todavía  
**Deadline crítico:** ~2026-07-01 (expiración Elementor Pro — 18 días)  
**Agente:** Claude Code Sonnet (Sesión 005 + 005b)

---

## 1. VEREDICTO

**APPROVE Estrategia A0 + B1.**

- **A0 (Track 0):** Continuidad de la tienda actual. Quitar la dependencia crítica de Elementor Pro antes del 2026-07-01. Resolver performance mínima. Sin riesgo de pagos.
- **B1 (Track 1):** Construir Catenaccio Studio — un backoffice/PIM AI-first para catalogar camisetas. Next.js + formularios a medida + WooCommerce REST API. WooCommerce sigue siendo el motor de venta y pagos.

El storefront público moderno (tipo Classic Football Shirts) queda **DEFER** hasta tener catálogo de 100+ productos, workflow probado y evidencia de tráfico/conversión.

**Razón del cambio respecto a TARGET_OPTIONS v1 (Sesión 005):**  
La Sesión 005 respondió al deadline de Elementor, pero no a la causa raíz de por qué Pablo dejó de publicar productos. Quitar Elementor con Gutenberg no soluciona la fricción del backoffice. La visión de Pablo es un workflow AI-first y una app-like experience, no solo "WordPress con otro tema".

---

## 2. ROOT CAUSE — Por qué Catenaccio se bloqueó

El bloqueo no fue una sola causa. Fue la acumulación de estas cinco fricciones:

### Fricción 1 — Frontend: Elementor Pro no encajó

Elementor Pro no fue una mala elección inicial, pero acumuló deuda:
- Bugs y limitaciones documentadas (Elementor Loop no intercepta WooCommerce queries → workaround con `pre_get_posts`).
- Funcionalidades ausentes que obligaron a construir plugins propios: Filtro Camisetas Pro v3.0.0 y Off-Canvas Menu v2.2.0 existen porque ningún plugin de mercado cubría el caso de uso.
- Mini-cart override desactualizado — señal de que el mantenimiento de las plantillas Elementor generaba deuda constante.
- El editor resultaba lento, frágil y poco predecible para el operador.
- **Conclusión:** El problema con Elementor no era el producto en sí, sino el modelo: un page builder pensado para diseñadores, manejado por un operador que necesitaba rapidez operativa.

### Fricción 2 — Backoffice: publicar una camiseta era demasiado caótico

El proceso documentado (AS-IS §Proceso: Publicación de nuevo producto) tiene 5 pasos, pero en la práctica:
- 7 taxonomías de atributo a rellenar manualmente (liga, equipo, jugador, talla, marca, condición, año).
- Título SEO en inglés (requiere conocimiento del equipo y la temporada).
- Descripción larga (requiere investigación de historia del club, temporada, jugadores).
- Fotos: subir, reordenar, seleccionar principal.
- Precio: requiere consulta de mercado (ClassicFootballShirts, eBay, Vinted).
- Descripción corta: shortcode `[cv_short_description]`.
- Publicar + flush CDN.

Esto no es un proceso ágil para un operador solo. Es el flujo de un equipo de contenido con especialistas. El resultado: 28 productos en 4+ meses (15/03 a 10/06/2026 sin nuevas publicaciones).

**El cuello de botella real es el backoffice, no el frontend.** Un storefront Next.js sin resolver el backoffice produce el mismo resultado: 28 productos y Pablo sin entrar al sistema.

### Fricción 3 — Arquitectura de catálogo: compleja y parcialmente resuelta

La taxonomía de Catenaccio (pa_liga, pa_equipo, pa_jugador, pa_talla, pa_marca, pa_condicion, pa_ano) es correcta y valiosa para SEO. Pero su implementación en WordPress tiene fricción:
- URLs limpias conseguidas via rewrite rules custom en functions.php (62KB de código crítico) — esto funciona, pero es frágil: cualquier cambio en WP puede romperlo.
- Páginas SEO indexables por combinación de atributos (ej: `/laliga/real-madrid/`, `/jugador/zidane/`) son la aspiración declarada, pero no están implementadas de forma sistemática.
- El Filtro Camisetas Pro v3.0.0 resuelve el filtrado AJAX en frontend, pero no genera páginas indexables estáticamente.
- Crawler de Facebook causó un downtime de 2 horas en 15/03/2026 por URLs de filtros sin paginación ni protección.
- **Conclusión:** La arquitectura de catálogo es la deuda técnica más relevante a largo plazo. El SEO de atributos combinados (que es la propuesta de valor diferencial frente a Vinted) no está completamente construido.

### Fricción 4 — Performance y hosting: fricción acumulada que invisibilizó el producto

- OPcache completamente lleno (16 bytes libres) — nuevos archivos PHP no se cachean en tiempo real.
- WP_MEMORY_LIMIT = 40M en front-end — límite para un WordPress con 19+ plugins activos.
- LiteSpeed Cache activo pero generando una percepción de lentitud significativa (operador lo reporta directamente).
- Backoffice lento: WP Admin con muchos plugins activos en un hosting compartido (Raiola Inicio SSD 2.0) no da la experiencia de una app.
- QUIC Backend permanece OFF (causa error 520 si se activa) — CDN parcialmente desaprovechada.
- **Conclusión:** El hosting y la configuración de caché no están optimizados. Parte de la lentitud es manejable con configuración (OPcache, WP_MEMORY_LIMIT) sin cambiar de plan. Pero el WP Admin nunca será tan rápido como una app moderna — es una limitación estructural de WordPress.

### Fricción 5 — Visión y estrategia: la web no era el centro de la operación comercial

- 4.9★ / 130+ reseñas en Vinted — canal paralelo con tracción real.
- La web tenía pagos live desde el 21/02/2026 pero sin crecimiento de catálogo posterior.
- El objetivo declarado era 100+ productos — pero el proceso lo hacía inviable en solitario.
- La aspiración del operador no es "una tienda WordPress que funcione bien": es una plataforma/app donde agentes puedan operar el catálogo de forma controlada, el workflow sea AI-first, y el resultado se parezca más a classicfootballshirts.com.
- **Conclusión:** La visión del producto no casaba con la herramienta elegida inicialmente. WordPress/WooCommerce puede seguir siendo el motor de venta, pero el centro de la operación debe ser una interfaz diseñada para catalogar camisetas vintage, no el WP Admin genérico.

---

## 3. QUÉ ESTABA MAL ENFOCADO EN TARGET_OPTIONS v1 (Sesión 005)

| Lo que se evaluó en v1 | Lo que debería evaluarse |
|------------------------|--------------------------|
| Quitar Elementor Pro → Gutenberg | Rediseñar el workflow de publicación de productos |
| Frontend de tienda pública | Backoffice/PIM de catalogación |
| Qué tecnología para el storefront | Qué flujo hace posible subir 100 camisetas |
| Performance del sitio web | Velocidad percibida del backoffice para el operador |
| Opción A vs B vs C como caminos excluyentes | Tracks paralelos con distinto horizonte temporal |

**La Opción A de v1 (WP+WC sin Elementor Pro → Gutenberg) era necesaria pero insuficiente.** Resuelve el deadline técnico pero no cambia la dinámica de uso del backoffice. Pablo seguiría con el mismo flujo caótico de publicación, ahora con Gutenberg en lugar de Elementor.

---

## 4. CONTEXTO VERIFICADO

### Stack actual (confirmado 2026-06-10)

| Componente | Versión | Estado |
|------------|---------|--------|
| WordPress | 7.0 | Activo |
| WooCommerce | 10.8.1 | Activo, HPOS (`wp_wc_orders`) |
| Elementor Pro | 3.35.1 | **Expira ~2026-07-01. No se renueva.** |
| Hello Elementor Child | 1.0.0 | Activo, functions.php 62KB crítico |
| WooPayments | 10.8.0 | LIVE, tarjeta + Apple/Google Pay + APMs |
| PayPal Payments | 4.0.4 | Activo, webhooks a verificar |
| LiteSpeed Cache | 7.8.1 | Activo. OPcache lleno (16 bytes libres). |
| QUIC.cloud CDN | — | Activo. QUIC Backend = OFF permanente. |
| Filtro Camisetas Pro | 3.0.0 | Plugin custom, AJAX, HPOS-compatible |
| Off-Canvas Menu | 2.2.0 | Plugin custom, acordeón liga→equipo |
| ACF Free | 6.7.0 | 16 post types, 20 taxonomías |
| RankMath | — | Activo, Search Console + GA verificados |
| Hosting | Raiola Inicio SSD 2.0 | Sin SSH. WP Admin = vía operativa permanente. |
| PHP | 8.3.31 (ea-php81) | LiteSpeed SAPI. **No cambiar handler.** |

### Activos reutilizables relevantes

- **functions.php (62KB):** rewrite rules, carrito, SEO shortcodes, IVA, purge CDN. Producción-testeado. Agnóstico a Elementor.
- **Filtro Camisetas Pro v3.0.0:** filtros AJAX, contadores, shortcodes, HPOS-compatible. Reutilizable en cualquier tema o desde API.
- **Off-Canvas Menu v2.2.0:** menú "Explorar Colección" con acordeón liga→equipo. Funcional.
- **Taxonomías (pa_liga, pa_equipo, pa_jugador, pa_talla, pa_marca, pa_condicion, pa_ano):** estructura de datos correcta y reutilizable.
- **28 productos publicados:** con SEO, URLs limpias, atributos completos. Base del catálogo.
- **WooPayments LIVE:** configurado, verificado, con APMs activos. No tocar.
- **13 zonas de envío:** configuradas y operativas.
- **STOCK.xlsx (19/04/2026):** inventario estructurado con stock sin publicar.
- **Checkout en Gutenberg Blocks:** migrado 20-21/02/2026. La parte más crítica ya está desacoplada de Elementor.

---

## 5. OPCIONES Y TRACKS

### TRACK 0 — Continuidad: WordPress + WooCommerce sin Elementor Pro (deadline 2026-07-01)

**Qué resuelve:** elimina el bloqueo técnico del deadline de Elementor Pro sin riesgo a pagos, SEO ni productos.

**Cómo funciona:**
1. Auditoría de los 19 items en `elementor_library`: identificar cuáles usan widgets Pro exclusivos (Loop Grid, Woo Widgets, Slides, Pricing Table, etc.).
2. Migrar Cart y Mi Cuenta a WooCommerce Blocks si están construidas con Elementor.
3. Reemplazar mini-cart override de Elementor con solución WC nativa.
4. Para catálogo (shop, categorías, producto): evaluar si Elementor free es suficiente o si conviene un template PHP nativo del tema.
5. OPcache: aumentar `opcache.memory_consumption` en cPanel (solicitar a Raiola si no hay acceso).
6. Tema hijo: conservar Hello Elementor Child y functions.php intacto — la lógica crítica no depende de Elementor.

**Lo que NO resuelve:** la fricción del backoffice, la velocidad de publicación, el workflow AI-first.

**Coste / fricción:** bajo. Duración: 5-14 días.  
**Riesgo:** bajo. Checkout ya en Gutenberg — el riesgo de pagos es prácticamente cero.  
**Reversibilidad:** total. Si algo falla, se puede reinstalar Elementor free.

---

### TRACK 1 — Catenaccio Studio: backoffice/PIM AI-first

**Qué resuelve:** el cuello de botella real — la fricción de publicar productos. Diseña el workflow de catalogación para que sea rápido, AI-asistido y operable por agentes.

**Cómo funciona:**

**Catenaccio Studio** = una app web ligera (Next.js) con formularios diseñados específicamente para camisetas vintage de fútbol. No es un CMS genérico: es una interfaz que conoce las taxonomías de Catenaccio.

Flujo de publicación con Studio:
```
Pablo fotografía la camiseta
    ↓
Sube fotos a Studio (drag & drop)
    ↓
Studio / Claude identifica: liga, equipo, temporada (de la foto o del nombre)
    ↓
Claude propone: precio de mercado, descripción larga en español, título SEO en inglés, atributos completos
    ↓
Pablo revisa y ajusta en formulario compacto (1 pantalla, no 5 secciones de WP Admin)
    ↓
[Aprobar y publicar]
    ↓
Studio llama a WooCommerce REST API → crea el producto en WC con todos los campos
    ↓
WooCommerce ejecuta automáticamente: rewrite rules + flush CDN (lógica ya existe en functions.php)
    ↓
Producto publicado en la tienda con URL limpia, SEO y descripción lista
```

**Componentes de Studio:**
- **Frontend:** Next.js (React) — interfaz de formulario custom.
- **API layer:** llamadas a WooCommerce REST API v3 (productos, taxonomías, imágenes, categorías).
- **AI layer:** Claude (via Anthropic SDK) — asistencia en precio, descripción, título, atributos.
- **Auth:** Application Password de WordPress (temporal, revocable, usuario limitado).
- **Hosting Studio:** Vercel (gratis para este nivel de uso) o local durante desarrollo.

**Stack mínimo viable (MVP):**
- Formulario con campos: fotos, nombre/referencia, liga, equipo, temporada, talla, marca, condición, jugador (opcional), precio, descripción (Claude-assisted).
- Botón "Rellenar con Claude" → Claude propone precio + descripción + título + atributos.
- Botón "Publicar como borrador" → crea producto en WC en estado `draft`.
- Pablo revisa en WP Admin solo lo que necesita ajustar.
- Botón "Publicar" en WP Admin o desde Studio directamente.

**Lo que resuelve:**
- Publicar una camiseta pasa de ~45 minutos a ~10 minutos.
- El proceso es enseñable a agentes: Studio tiene una interfaz conocida y una API.
- Pablo no necesita conocer WP Admin para el flujo principal.
- Agents pueden operar Studio en modo DRAFT_ONLY sin acceso directo a producción.

**Coste / fricción:** medio. Requiere 2-4 semanas de desarrollo. Puede comenzarse en Track 0 paralelo.  
**Riesgo:** bajo. WooCommerce sigue siendo el backend — Studio es solo una capa de entrada.  
**Reversibilidad:** total. Studio no modifica nada en WP — solo llama la API.

---

### TRACK 2 — Arquitectura de catálogo e indexación SEO

**Qué resuelve:** las páginas SEO indexables por atributos combinados — la propuesta de valor diferencial de Catenaccio frente a Vinted.

**Objetivo:** que `/laliga/fc-barcelona/`, `/champions-league/`, `/jugador/ronaldinho/`, `/marca/nike/temporada/2003-04/` sean páginas reales con contenido útil, indexadas por Google, con productos filtrados.

**Cómo funciona (dentro de WP+WC):**
- Páginas de taxonimía de producto (`product_tag`, `pa_liga`, `pa_equipo`) que WooCommerce genera automáticamente si se configuran correctamente.
- Custom archive templates en el tema hijo para cada tipo de taxonomía.
- RankMath: configurar SEO para archive pages de producto (título, meta description dinámicos).
- Filtro Camisetas Pro: ya genera URLs con parámetros — evaluar si puede generar URLs indexables (permalinks) para combinaciones clave.
- Para combinaciones de atributos (liga + equipo): considerar páginas creadas manualmente con shortcode + título SEO optimizado.
- Protección contra crawlers: rate limiting en .htaccess o en LiteSpeed para URLs de filtros (PROB-05 ya ocurrió una vez).

**Coste / fricción:** medio. Requiere decisión de arquitectura URL y config de RankMath.  
**Timeline:** 30-60 días. No es urgente — pero condiciona el SEO a largo plazo.

---

### TRACK 3 — Storefront público moderno (DEFER)

**Referencia aspiracional:** classicfootballshirts.com — experiencia de catálogo moderna, foto-centric, con filtros, búsqueda, ficha de producto detallada.

**Por qué DEFER:**
- Sin catálogo de 100+ productos, un storefront moderno no tiene impacto en ventas ni SEO.
- WooCommerce puede servir de storefront razonablemente bien una vez resuelto Track 0 + Track 2.
- La conversión a Next.js frontend requiere resolver el checkout headless (WooPayments no soporta headless en 2026).
- **Cuando revisar:** con 100+ productos publicados, evidencia de tráfico orgánico y un workflow de publicación fluido (Track 1 funcionando).

---

### TRACK 4 — Acceso de agentes al CMS sin SSH

**Objetivo:** que Claude Code (u otros agentes) pueda operar el catálogo de Catenaccio de forma controlada, sin acceso SSH, con reversibilidad.

Ver sección 6 (Modelo de acceso sin SSH) para el detalle técnico.

---

### Opciones descartadas

| Opción | Veredicto | Razón |
|--------|-----------|-------|
| Migración completa a Next.js (tienda pública + backend) | **DEFER** | Inviable antes del deadline. Requiere resolver checkout headless con WooPayments. Revisitar con catálogo de 100+ productos. |
| Shopify | **STOP** | Pérdida de activos reales (plugins custom, configuración de pagos, SEO activo, taxonomías). Sin ventaja sobre WC para el caso de uso específico. |
| WordPress + WooCommerce headless (Next.js frontend, WC backend) | **STOP a corto plazo** | WooPayments no tiene soporte headless oficial en 2026. El checkout es el componente más crítico. No riesgar pagos. Puede ser Track 3 en 12+ meses si cambia la pasarela. |

---

## 6. COMPARATIVA EN TABLA

| Criterio | Track 0 (continuidad) | Track 1 (Studio/PIM) | Track 2 (catálogo SEO) | Track 3 (storefront, DEFER) |
|----------|----------------------|---------------------|----------------------|----------------------------|
| **Urgencia** | Crítica — 2026-07-01 | Alta — arrancar en paralelo | Media | Baja — post 100 productos |
| **Riesgo pagos** | Ninguno | Ninguno | Ninguno | Alto (checkout headless) |
| **Riesgo SEO** | Ninguno | Ninguno | Bajo (si se gestiona bien) | Medio-alto (migración URLs) |
| **Impacto en publicación** | Ninguno | Alto — de 45min a 10min | Ninguno directo | Ninguno directo |
| **Dependencia de agentes** | Baja | Alta — Studio es el canal | Media | Alta |
| **Coste desarrollo** | Bajo | Medio (2-4 semanas) | Bajo-Medio | Alto |
| **Compatibilidad lafabrica** | Media | Alta — nativo Next.js | Media | Alta |
| **7 días** | ✅ Auditoría + fixes | 🔲 Diseño formulario | ❌ No urgente | ❌ |
| **30 días** | ✅ Completado | ✅ MVP Studio operativo | 🔲 Arquitectura URL | ❌ |
| **90 días** | ✅ Estable | ✅ 100+ productos publicados | ✅ Páginas taxon. indexadas | 🔲 Evaluación |

---

## 7. RIESGOS POR TRACK

### Track 0
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Widgets Pro sin equivalente gratuito | Media | Medio | Fallback HTML estático; template PHP nativo |
| Cart/Mi Cuenta en Elementor → rotura en migración | Media | Medio | WC Blocks nativos disponibles en WC 10.8.1 |
| OPcache lleno bloquea PHP | Alta (ya ocurre) | Medio | Aumentar `opcache.memory_consumption` en cPanel |

### Track 1 (Studio)
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| WooCommerce REST API no acepta todos los campos de atributo | Baja | Medio | WC REST API v3 soporta `attributes[]` completo — testar en draft mode primero |
| Application Password expuesta o reutilizada | Baja | Alto | Usar usuario limitado (solo editor de productos), revocar si se compromete |
| Claude genera contenido incorrecto (precio, descripción) | Media | Bajo | Pablo siempre revisa antes de publicar — Studio no publica sin aprobación humana |
| Complejidad de imágenes (upload + reorder + WC media) | Media | Medio | WC REST API soporta upload vía Media Library — puede requerir iteración |

### Track 2
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Crawlers saturan URLs de filtros (PROB-05, ya ocurrió) | Alta sin mitigación | Alto | Rate limiting en .htaccess / LiteSpeed reglas por user-agent |
| RankMath mal configurado en archive pages | Media | Medio | Auditoría específica de RankMath en product archive templates |

---

## 8. RECOMENDACIÓN BINARIA

| Track | Veredicto | Horizonte |
|-------|-----------|-----------|
| **Track 0 — Continuidad** | **✅ APPROVE — URGENTE** | 7-14 días |
| **Track 1 — Studio AI-first** | **✅ APPROVE — arrancar en paralelo** | 14-30 días |
| Track 2 — Catálogo SEO | **🔲 APPROVE después de Track 1** | 30-60 días |
| Track 3 — Storefront moderno | **⏸ DEFER** | Post 100 productos + evidencia tráfico |
| Track 4 — Acceso agentes | **✅ APPROVE — define el modelo en Track 1** | Con Track 1 |

**Estrategia completa:** APPROVE A0 (Track 0) + APPROVE B1 (Track 1) en paralelo. Track 2 se activa cuando Studio tenga el primer lote de productos. Track 3 es la conversación de dentro de 6-12 meses.

---

## 9. MODELO DE ACCESO SIN SSH

Raiola Inicio SSD 2.0 no ofrece SSH. Esto no bloquea operación de agentes — solo cambia el canal de acceso.

### Niveles de acceso para agentes

| Modo | Qué puede hacer el agente | Autorización requerida |
|------|--------------------------|----------------------|
| `READ_ONLY` | Leer estado: WP Admin / Site Health / WC Status / API GET | Ninguna (navegación normal) |
| `DRAFT_ONLY` | Crear/editar productos en estado `draft` vía WC REST API | Application Password de usuario limitado |
| `APPLY_WITH_APPROVAL` | Publicar producto, cambiar precio, modificar stock | Aprobación explícita de Pablo antes de cada acción |
| `ADMIN` | Instalar plugins, cambiar configuraciones críticas | Solo Pablo vía WP Admin — agentes nunca |

### Implementación práctica

**Application Password de WordPress:**
1. Crear usuario en WP Admin con rol `Author` o `Editor` limitado a productos.
2. En el perfil de ese usuario: `Contraseñas de aplicación` → crear → copiar.
3. Usar en las llamadas de Studio / agentes:
   ```
   Authorization: Basic base64(usuario:app_password)
   ```
4. Revocar desde WP Admin si se compromete — sin tocar el servidor.
5. **No usar la cuenta de administrador principal** para las llamadas de API.

**Endpoints WooCommerce REST API relevantes:**
- `GET /wp-json/wc/v3/products` — listar productos
- `POST /wp-json/wc/v3/products` — crear producto (en `status: draft` por defecto)
- `PUT /wp-json/wc/v3/products/{id}` — actualizar producto
- `GET /wp-json/wc/v3/products/attributes` — listar taxonomías (pa_liga, pa_equipo, etc.)
- `POST /wp-json/wp/v2/media` — subir imagen a Media Library

**Modos de operación en Studio:**
- `DRAFT_ONLY` para el flujo principal: Studio crea en borrador, Pablo aprueba y publica.
- Pablo puede publicar desde Studio (si se implementa el botón) o desde WP Admin.
- Agentes (Claude Code) pueden crear borradores en modo automatizado sin autorización manual para cada producto.

**Operación de WP Admin vía agente (casos excepcionales):**
- Capturas de pantalla para verificación visual (modo READ_ONLY).
- Antigravity / browser headless si hay una tarea puntual de configuración que requiere UI.
- No como canal habitual — Studio + REST API es la vía principal.

---

## 10. PLAN 7 / 30 / 90 DÍAS

### Semana 1 (7 días) — Track 0: resolver el deadline

**Objetivo:** estar libres de la dependencia editorial de Elementor Pro antes del 2026-07-01.

**Día 1-2 — Auditoría (WP Admin, read-only):**
- [ ] Listar los 19 items de `elementor_library` — clasificar cuáles usan widgets Pro exclusivos (Loop Grid, Woo Widgets, Slides, Pricing Table, etc.).
- [ ] Verificar en el front-end: Home, /camisetas/, producto individual, Cart, Mi Cuenta.
- [ ] Confirmar si Cart y Mi Cuenta están en Elementor o ya en bloques (resolver PROB-13).
- [ ] Confirmar qué mini-cart ve el usuario: override de Elementor o estándar.

**Día 3-5 — Migración:**
- [ ] Cart y Mi Cuenta → WooCommerce Blocks si están en Elementor.
- [ ] Mini-cart → solución nativa WC (hook `woocommerce_add_to_cart_fragments` o bloque Mini-Cart).
- [ ] Para catálogo: si Loop Grid es Pro → template PHP nativo en tema hijo (la lógica ya está en functions.php).
- [ ] Mantener Filtro Camisetas Pro y Off-Canvas Menu intactos.
- [ ] OPcache: solicitar a Raiola aumentar `opcache.memory_consumption` de 128M a 256M.

**Día 6-7 — Validación visual:**
- [ ] Pablo valida: home, catálogo, producto, carrito, checkout.
- [ ] Test rápido: añadir al carrito + checkout (no llegar a pago real, solo verificar el flujo).
- [ ] Confirmar que RankMath, Google Analytics y Complianz siguen activos.

**Resultado esperado:** Elementor Pro puede expirar el 2026-07-01 sin impacto. El editor de bloques WP es la nueva superficie de edición de emergencia.

---

### Mes 1 (30 días) — Track 1: Catenaccio Studio MVP

**Objetivo:** tener una interfaz mínima para publicar camisetas 10x más rápido.

**Semana 2 — Diseño del formulario:**
- [ ] Diseñar el formulario de Studio con los campos exactos de una camiseta:
  - Fotos (upload múltiple, reordenar).
  - Nombre de referencia (para uso interno, no SEO).
  - Liga, Equipo, Temporada, Talla, Marca, Condición, Jugador (si aplica).
  - Estado: draft o publicado.
  - Precio (con sugerencia de Claude).
  - Título SEO en inglés (sugerido por Claude).
  - Descripción larga en español (generada por Claude).
- [ ] Definir la estructura de llamada a WooCommerce REST API para crear un producto con todos estos campos.
- [ ] Crear el Application Password del usuario limitado en WP Admin.
- [ ] Validar que la API acepta la creación de producto con atributos custom (pa_liga, pa_equipo, etc.).

**Semana 3 — Implementación:**
- [ ] Scaffolding Next.js (simple, sin over-engineering — un formulario y una pantalla de revisión).
- [ ] Integración Claude: botón "Sugerir con Claude" → rellena precio, descripción, título.
- [ ] Integración WC REST API: botón "Crear borrador" → llama a `POST /wp-json/wc/v3/products` con status=draft.
- [ ] Upload de imágenes: llamada a `POST /wp-json/wp/v2/media` y asignación al producto.

**Semana 4 — Prueba real:**
- [ ] Pablo publica sus primeras 5 camisetas usando Studio (sin entrar a WP Admin).
- [ ] Medir el tiempo: ¿de cuánto baja el tiempo por camiseta?
- [ ] Ajustes basados en feedback de uso real.

**Resultado esperado:** Studio operativo. Pablo puede publicar una camiseta en ~10 minutos. Claude asiste en precio + descripción + título + atributos.

---

### Trimestre 1 (90 días) — Catálogo + SEO + operación AI-first

**Objetivo:** 100+ productos publicados, arquitectura SEO estable, workflow operativo sin intervención técnica constante.

**Catálogo:**
- [ ] Usar Studio para publicar el stock existente: mínimo 30-50 productos nuevos.
- [ ] Revisar STOCK.xlsx (19/04/2026): identificar stock pendiente de publicar.
- [ ] Objetivo: 100+ productos activos a fin del trimestre.

**Track 2 — SEO de catálogo:**
- [ ] Auditar los archive templates de WooCommerce para taxonomías de producto (pa_liga, pa_equipo).
- [ ] Configurar RankMath para títulos SEO dinámicos en archive pages (ej: "Camisetas de Real Madrid | Catenaccio Vintage").
- [ ] Proteger URLs de filtros contra crawlers (rate limiting, robots.txt).
- [ ] Evaluar si conviene generar páginas dedicadas para combinaciones de alta demanda (ej: `/laliga/real-madrid/`).

**Operación:**
- [ ] Habilitar WPS Hide Login (PROB-12) — 10 minutos en WP Admin.
- [ ] Investigar webhooks de PayPal (PROB-14).
- [ ] Resolver WP_MEMORY_LIMIT 40M (PROB-10) — solicitar a Raiola si no hay acceso vía cPanel.
- [ ] Evaluar si el plan de Raiola es suficiente o si merece upgrade (a 100+ productos con tráfico real).

**Track 3 — Evaluación:**
- [ ] Con 100+ productos y tráfico documentado: ¿justifica el esfuerzo de un storefront Next.js?
- [ ] Decisión en ese momento — no antes.

---

## 11. MARKETPLACE NORTH STAR — Visión a largo plazo

### La visión

La intención declarada de Pablo a largo plazo es que Catenaccio evolucione hacia un **marketplace especializado en camisetas de fútbol** — un sistema tipo Vinted pero enfocado, donde otros coleccionistas puedan publicar sus propias camisetas bajo la marca y los estándares de calidad de Catenaccio.

Esta visión es legítima y cambia el modelo de datos que conviene diseñar desde el principio. Pero **no es el MVP** y no debe serlo.

### Las 4 fases

| Fase | Descripción | Criterio de entrada |
|------|-------------|-------------------|
| **Fase 1 — Tienda propia estable** | catenacciovintage.com funcionando, rápida, sin fricción técnica. Elementor Pro resuelto. Performance mínima. | Track 0 completado |
| **Fase 2 — Studio interno** | Catenaccio Studio operativo para publicar las propias camisetas de Pablo. Workflow validado: ≤10 min por producto. | Track 1 MVP operativo |
| **Fase 3 — Catálogo robusto** | 100+ productos publicados, taxonomía estable, SEO de atributos activo, operación fluida sin intervención técnica. | 100 productos + SEO Track 2 |
| **Fase 4 — Marketplace (si hay tracción)** | Otros usuarios publican sus camisetas en Catenaccio. Multi-vendor, confianza/autenticidad, modelo de comisión o suscripción. | Ver gates abajo |

### Gates para abrir el marketplace (Fase 4)

**No abrir Fase 4 hasta cumplir TODOS:**

- [ ] 100+ productos propios publicados y vendiendo.
- [ ] Workflow interno validado: publicación de producto en ≤10 minutos de forma consistente.
- [ ] Tráfico orgánico demostrable (ej: 1.000+ visitas/mes desde Google) o comunidad activa documentada.
- [ ] Ventas recurrentes reales (no solo pedidos aislados).
- [ ] **Propuesta de valor clara frente a Vinted:** ¿por qué un vendedor publicaría en Catenaccio antes que en Vinted? (especialización, audiencia específica, autenticación, precio premium, comisión menor, marca, etc.)
- [ ] Sistema de confianza/autenticidad definido: ¿cómo garantiza Catenaccio que las camisetas son auténticas? ¿fotos obligatorias de etiqueta? ¿validación por Pablo? ¿reputación de vendedor?
- [ ] Decisión sobre el modelo económico: ¿comisión por venta? ¿suscripción mensual? ¿freemium?
- [ ] Capacidad técnica: modelo de datos multi-usuario implementado en Studio (users, listings, ownership).

### Implicaciones de diseño ahora (sin construir el marketplace)

Aunque el marketplace es Fase 4, algunas decisiones de diseño ahora pueden evitar reescrituras costosas más adelante:

| Decisión | Recomendación ahora | Por qué |
|----------|--------------------|----|
| **Modelo de producto en Studio** | Incluir campo `owner_id` (aunque sea siempre Pablo en Fase 2) | Facilita multi-vendor sin migración de datos |
| **Autenticación en Studio** | Diseñar con JWT / sesiones propias, no hardcoded a un solo usuario | Permite añadir usuarios externos sin reescribir auth |
| **WooCommerce como backend** | Mantenerlo solo si escala a marketplace; evaluar en Fase 3 | WC multi-vendor requiere plugins pesados (Dokan, WCFM); puede que en Fase 4 convenga otro backend |
| **Modelo de datos de camiseta** | Taxonomías actuales (pa_liga, pa_equipo, etc.) son correctas y reutilizables en marketplace | No cambiarlas — son la base del catálogo |
| **URLs y SEO** | Diseñar las URLs de Fase 2 sin asumir seller subdomains | `/camisetas/real-madrid/` puede escalar a `/vendedores/pablo/camisetas/real-madrid/` con redirects |

### Por qué el marketplace no es el MVP

Pablo lo reconoció explícitamente (2026-06-13):
- "El marketplace es difícil de escalar."
- "No está claro por qué un usuario publicaría en Catenaccio antes que en Vinted."
- La propuesta de valor del marketplace requiere que Catenaccio tenga primero tracción propia.

Un marketplace construido antes de validar la demanda es el error más caro en e-commerce. Vinted tiene 90M+ usuarios y 9 años de historia. Catenaccio necesita primero ser una referencia de calidad en camisetas vintage antes de pedirle a otros que confíen su inventario a la plataforma.

**La secuencia correcta:** primero Pablo lo usa y vende, luego otros quieren estar donde Pablo está.

---

## 12. QUÉ NO HACER TODAVÍA

- **No construir el storefront público en Next.js** hasta tener evidencia de tráfico y catálogo de 100+ productos. El frontend no es el cuello de botella.
- **No migrar a Shopify.** Pérdida de activos reales sin justificación.
- **No implementar headless checkout.** WooPayments no lo soporta en 2026.
- **No intentar actualizar Elementor Pro a 4.x.** La decisión de no renovar es firme.
- **No hacer over-engineering en Studio.** El MVP es un formulario + llamada a REST API + Claude. No necesita autenticación compleja, multi-usuario, ni dashboard en la primera versión.
- **No diseñar features de marketplace en el MVP de Studio.** Sin multi-vendor, sin sistema de comisiones, sin perfiles de vendedor, sin ratings externos. El `owner_id` en el modelo de datos es suficiente para no cerrar la puerta.
- **No activar UCSS/CSS asíncrono en LiteSpeed** sin configurar primero las exclusiones de WooCommerce.
- **No cambiar el PHP handler** (ea-php81 → ea-php83 da error 403 — documentado).
- **No usar la cuenta de administrador** como Application Password de Studio.
- **No limpiar la base de datos (PROB-15)** sin backup previo verificado — tarea de baja urgencia.
- **No pushear nada a producción sin aprobación visual de Pablo.** Track 0 y Track 1 tienen validación humana antes de cada acción sobre producción.

---

## 13. DECISIÓN QUE DEBE TOMAR EL OPERADOR

**Pregunta exacta:**

> **¿Apruebas la estrategia A0 + B1 para Catenaccio Vintage?**
>
> - **A0 (urgente — antes del 2026-07-01):** auditar y migrar los templates de Elementor Pro a WooCommerce Blocks / templates PHP, resolver OPcache y fixes mínimos de performance. Sin tocar pagos ni SEO.
>
> - **B1 (arrancar en paralelo, MVP en 30 días):** construir Catenaccio Studio — una app Next.js con formularios diseñados para catalogar camisetas, asistida por Claude para precios/descripciones/atributos, que publica directamente en WooCommerce vía REST API. El resultado: publicar una camiseta en ~10 minutos en lugar de ~45.
>
> WooCommerce sigue siendo el motor de venta y pagos. El storefront público moderno se evalúa en 90 días con evidencia real de tráfico y catálogo.

**Preguntas complementarias para afinar la decisión:**

1. ¿Quieres que Studio sea una app local (solo para tu uso) o que pueda ejecutarse en la nube (Vercel)?
2. ¿Tienes preferencia sobre cómo gestionar las fotos? (subida directa a WooCommerce, Google Drive, carpeta local)
3. Para el formulario de Studio, ¿hay algún campo que actualmente no estés usando pero querrías añadir? (ej: dorsales, condición con escala 1-10, fotos de etiqueta)
4. ¿La App Password de Studio la creas tú en WP Admin o prefieres que un agente te guíe paso a paso?

**Respuestas posibles:**
- `APPROVE A0 + B1` → Sesión 006: Track 0 (auditoría elementor_library) + diseño del formulario de Studio.
- `APPROVE solo A0` → resolver el deadline, aplazar Studio.
- `Ajuste` → especificar qué cambia en la estrategia.

---

## 14. CAMBIOS DOCUMENTALES REALIZADOS

| Documento | Cambio |
|-----------|--------|
| `docs/discovery/TARGET_OPTIONS.md` | Reescrito completo (005b) + sección Marketplace North Star añadida (005c) |
| `DECISIONS.md` | DEC-8 con A0+B1. PEND-2 añadida: marketplace como NORTH_STAR / DEFER |
| `BACKLOG.md` | Nuevas tareas derivadas 005b/005c. MARKETPLACE_NORTH_STAR_VALIDATION en LATER |
| `CONTEXTO.md` | Sesiones 005b y 005c añadidas (append) |
| `HISTORIAL_SESIONES.md` | Entradas 005b y 005c añadidas (append-only) |
| `agent_events.jsonl` | Eventos `target_options_reframed` y `marketplace_north_star_added` registrados |

---

## 15. CIERRE DE SESIÓN

**Estado del workflow:** AS_IS_VALIDADO → TARGET_OPTIONS EN_REVISIÓN (versión 005c — definitiva para aprobación)  
**Siguiente paso:** Operador responde a la pregunta de la sección 13. Si aprueba A0+B1 → Sesión 006: Track 0 + arranque Studio.  
**Deadline:** Track 0 debe completarse antes del **2026-07-01**.  
**Commits no pusheados:** 15d478c (005) + f7a112f (005b) + este (005c) — 3 commits ahead. No pushear hasta aprobación del operador.

---

*Versión 005c — 2026-06-13 — Claude Code Sonnet.*  
*005: TARGET_OPTIONS inicial. 005b: Root Cause + A0+B1. 005c: Marketplace North Star + fases + gates.*  
*Basado en AS_IS_UNDERSTANDING.md (VALIDADO_POR_USUARIO, 2026-06-10) y contexto operativo del operador.*
