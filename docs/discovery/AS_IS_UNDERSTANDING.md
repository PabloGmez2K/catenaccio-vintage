# AS_IS_UNDERSTANDING — Catenaccio Vintage

Comprensión documentada del estado actual del proyecto, construida a partir de las fuentes registradas en `SOURCE_REGISTRY.md`.

**Solo puede avanzarse al diseño TARGET una vez que este documento esté en estado `VALIDADO_POR_USUARIO`.**

**Proyecto:** Catenaccio Vintage  
**Fecha de última actualización:** 2026-06-10  
**Estado:** VALIDADO_POR_USUARIO  
**Fuentes consultadas:** SRC-01, SRC-02, SRC-03, SRC-04, SRC-05, SRC-06, SERVER_CONTEXT_CHECK (2026-06-10)  
**Conflictos resueltos antes de esta versión:** ver CONFLICT_REGISTER.md — CONF-001 detectado, pendiente de resolución

---

## Hechos confirmados

- Catenaccio Vintage es una tienda WooCommerce de camisetas vintage de fútbol, accesible en `catenacciovintage.com`, operada por Pablo. — fuente: SRC-02
- La tienda está **activa y en producción** con pagos live habilitados desde el 21/02/2026. — fuente: SRC-02
- Stack técnico: WordPress 7.0 + WooCommerce 10.8.1 + Elementor Pro 3.35.1 + tema hello-elementor-child, sobre hosting Raiola Networks (LiteSpeed, PHP 8.3.31, MariaDB 11.4.10-cll-lve). — fuente: SRC-02; versiones confirmadas por SERVER_CONTEXT_CHECK 2026-06-10
- Servidor: Raiola Networks Inicio SSD 2.0, cPanel user `vnvnhzdd`, PHP SAPI: `litespeed`, servidor HTTP: **LiteSpeed** (no Apache — LiteSpeed corre en modo compatible Apache, usa `.htaccess`; cPanel reportaba Apache por compatibilidad), PHP 8.3.31 64-bit, Linux 4.18.0-553.89.1.lve.el8.x86_64 x86_64, IP compartida 178.211.133.29. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- CDN: QUIC.cloud activo desde 15/02/2026 (DNS migrado a nameservers QUIC.cloud). — fuente: SRC-02
- Elementor Pro 3.35.1 activo. **Suscripción caduca ~2026-07-01 (≈3 semanas desde 2026-06-10). Operador confirma que NO renovará.** Versión muy desactualizada (latest: 4.1.1, gap de versión mayor). Tiene 19 items en elementor_library. Al expirar: editor Pro bloqueado, widgets Pro pueden degradarse, mini-cart override ya desactualizado. Es el driver central de TARGET_OPTIONS. — fuente: confirmado por operador 2026-06-10
- LiteSpeed Cache 7.8.1 activo. El operador considera que ralentiza significativamente la web. Objetivo: reconfigurarlo o retirarlo. — fuente: confirmado por operador 2026-06-06; versión confirmada SERVER_CONTEXT_CHECK 2026-06-10
- **28 productos publicados** confirmado a 2026-06-10. El objetivo declarado es 100+ productos. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- Pasarelas de pago operativas: WooPayments (tarjeta, Google Pay, Apple Pay, Bancontact, iDEAL, Multibanco) + PayPal Business. Pedido real #1556 procesado. — fuente: SRC-02
- Checkout migrado de Elementor a Checkout Blocks (Gutenberg) el 20-21/02/2026. — fuente: SRC-02
- Hay dos plugins custom desarrollados con vibe coding + Claude: Filtro Camisetas Pro v3.0.0 y Off-Canvas Menu v2.2.0. Ambos activos y confirmados en producción. — fuente: SRC-02, SRC-04; confirmado SERVER_CONTEXT_CHECK 2026-06-10
- WooCommerce usa HPOS (High Performance Order Storage) con `OrdersTableDataStore` (`wp_wc_orders`). Sync a `wp_posts` desactivado. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- Shop base URL: `/camisetas/` (no el default `/shop/`). Checkout: `/finalizar-compra/` con bloque woocommerce/checkout. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- WooPayments activo en modo LIVE (no test). APMs habilitados: card, bancontact, ideal, multibanco. Apple Pay / Google Pay activos en product+cart+checkout. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- WP_MEMORY_LIMIT definido en wp-config.php: 40M (front-end). WP_MAX_MEMORY_LIMIT: 512M (operaciones admin/WooCommerce). WooCommerce usa el límite alto para operaciones de admin. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- OPcache activo con hit rate 93.65% pero **completamente lleno**: 16 bytes libres, cache_full = true. Nuevos archivos PHP no se cachean. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- WPS Hide Login instalado pero **inactivo** — URL de login expuesta en `/wp-admin` por defecto. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- ACF confirmado versión FREE (no Pro), v6.7.0. 16 post types y 20 taxonomías configuradas via UI. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- La base de datos (22.76 MB) contiene tablas huérfanas de al menos 8 plugins previamente activos y ya removidos: BeRocket filter, YITH WCAN, WOOF filter, WPF filter, Smush, WP Security Audit Log, Jetpack, posiblemente otros. `yith_wcan_preset: 2` y `br_product_filter: 1` como post types huérfanos. — fuente: SERVER_CONTEXT_CHECK 2026-06-10
- Taxonomías de producto WooCommerce configuradas: pa_liga, pa_equipo, pa_jugador, pa_talla, pa_marca, pa_condicion, pa_ano. — fuente: SRC-02
- 13 zonas de envío configuradas (España, Baleares, Canarias, Portugal, Francia, Benelux, DACH, Italia, Reino Unido, resto Europa UE/no-UE, resto del mundo). Mensajería: InPost via Envia.com. — fuente: SRC-02
- URLs limpias WooCommerce implementadas (sin prefijo `/producto/` ni `/categoria-producto/`) via rewrite rules con transients en functions.php. — fuente: SRC-02
- IVA 21% incluido en todos los precios, calculado sobre dirección de la tienda. Envíos también con IVA incluido via snippet en functions.php. — fuente: SRC-02
- Email transaccional operativo: info@catenacciovintage.com (WP Mail SMTP, puerto 465 SSL, SPF/DKIM/DMARC configurados). — fuente: SRC-02
- SEO con RankMath activo; Google Analytics y Search Console verificados. Títulos de producto en inglés ("YYYY-YY Club Home/Away Shirt"). — fuente: SRC-02
- La tienda sufrió un incidente de malware en agosto 2025 (archivos en `/imports/` y falso `wp-includes.php`). Wordfence lo detectó y fue desinstalado el 14/02/2026 liberando 5.24 GB de cuarentena. — fuente: SRC-02
- Hubo una caída de ~2 horas el 15/03/2026 por crawler de Facebook saturando el servidor con peticiones a URLs de filtros. Raiola añadió regla de bloqueo en .htaccess. — fuente: SRC-02
- Stock físico inventariado en carpeta legacy: 30 carpetas de producto "Original" con fotos individuales por producto; carpeta "Réplica" con 2 productos + ~70 fotos sueltas; carpeta "DORSALES" con 17 imágenes de dorsales personalizados. — fuente: SRC-01, SRC-03
- Existe un inventario estructurado en STOCK.xlsx (última modificación: 19/04/2026). — fuente: SRC-03
- Se dispone de ~30 variantes de logo y marca en Imágenes/Logo/REBRANDING, con versiones horizontal, circular, blanco, verde, negro. — fuente: SRC-05
- Volumen total de la carpeta legacy (archivos extraídos, sin contar zips): ~510 MB. Incluye fotos.zip (103 MB) y Photos-3-001.zip (12 MB) sin extraer. — fuente: SRC-01

---

## Hipótesis (requieren validación)

- **Elementor Pro expira ~2026-07-01, operador no renueva — impacto en el sitio a confirmar post-expiración**: Elementor Pro 3.35.1 activo hasta ~2026-07-01. El operador confirma que NO renovará (2026-06-10). Al expirar: el editor Pro queda bloqueado, los widgets Pro pueden degradarse en front-end (el contenido renderizado suele mantenerse), el mini-cart override ya está desactualizado. 19 items en elementor_library posiblemente usan widgets Pro. No asumir rotura inmediata del front-end, pero sí rotura de capacidad de edición. **Es el driver central y más urgente de TARGET_OPTIONS (deadline: ~2026-07-01).** — **CONFIRMADO por operador 2026-06-10; impacto post-expiración pendiente de observar**

- **La tienda ha tenido actividad después del 15/03/2026**: STOCK.xlsx y varias carpetas de productos en Stock/Original tienen fecha de modificación 19/04/2026. Número de productos confirmado a 2026-06-10: 28 — mismo número que el CONTEXTO de 15/03/2026, lo que sugiere que no se publicaron nuevos productos entre marzo y junio 2026. — **PARCIALMENTE VALIDADO: sin nuevos productos entre 15/03 y 10/06/2026**
- **El "bloqueo anterior" no fue técnico sino de workflow**: la tienda funciona y tiene ventas reales. El bloqueo fue principalmente operativo/workflow: Elementor resultaba lento, frágil y lleno de fricción; publicar productos era tedioso; Rank Math no simplificaba suficientemente el SEO. El objetivo actual es migrar Catenaccio hacia un workflow AI-first con Company Brain y lafabrica. — **VALIDADO por operador 2026-06-06**
- **Migrar de WordPress/WooCommerce puede no ser la decisión correcta**: la inversión en plugins custom, configuración de pagos, SEO activo, 28+ productos publicados y experiencia de usuario validada hace que la migración tenga un coste alto. Requiere evaluación objetiva en TARGET_OPTIONS. — **pendiente de validar**
- **El inventario físico supera los productos publicados**: hay 30 carpetas en Stock/Original pero solo ~28 productos publicados a 15/03/2026. Probablemente hay stock físico pendiente de publicar. — **pendiente de validar**
- **La cuenta de Vinted es activa y complementaria**: en CONTEXTO se menciona "4.9★ / 130+ opiniones en Vinted" (tarea #9 del backlog). Vinted parece ser un canal de venta paralelo con tracción. — **pendiente de validar**

---

## Incógnitas conocidas

- **Estado actual de la tienda (10/06/2026)**: 28 productos publicados confirmados. No se publicaron productos nuevos entre 15/03 y 10/06/2026. La tienda está activa y operativa. — **CERRADO por SERVER_CONTEXT_CHECK 2026-06-10**
- **Contenido de backlog_catenaccio_v6.xlsx** (Excel, no legible sin herramienta): es la versión más reciente del backlog (19/04/2026). Puede contener decisiones de producto más actualizadas que el CONTEXTO. — impacto: medio
- **WP secret keys**: rotadas por operador el 2026-06-06 (SEC-002 resuelto). — **CERRADO**
- **Código actual del tema hijo**: el archivo functions.php de la carpeta legacy tiene fecha 14/03/2026. No se conoce si hubo modificaciones posteriores en el servidor. — impacto: bajo
- **Archivos referenciados en CONTEXTO sección 19 no encontrados en la carpeta legacy**: `_htaccess.md`, `filtro-camisetas.md`, `catenaccio-offcanvas-menu.md`, `resumen-operativo-catenaccio.docx`, `PROMPT_AUDITORIA_WORDPRESS.md`, `PREFERENCIAS_TRABAJO_PABLO.md`, `css-carrito-v6-completo.css`, `snippet-carrito-v2.3.php`. Pueden estar en otra ubicación, haberse eliminado o no haberse guardado en la carpeta legacy. Ver CONF-001. — impacto: bajo (el código real está en el servidor)
- **Presencia real en Vinted**: número exacto de reseñas actuales, URL del perfil, stock activo en Vinted. — impacto: medio (afecta decisión sobre integración Vinted↔web)
- **Estado del buscador AJAX móvil**: estaba "en desarrollo" según CONTEXTO sección 13 con pendientes no resueltos (breadcrumbs, estado recientes). No se sabe si fue completado. — impacto: bajo

**Bloque 3 — estado 2026-06-06 (validado por operador):** Las incógnitas anteriores no bloquean la validación del AS-IS. El operador confirma que el AS-IS es suficiente para avanzar. Para cerrar las incógnitas sobre estado real del servidor (versiones efectivas, plugins activos, configuración LiteSpeed, impacto post-Elementor Pro), se planifica una sesión dedicada: `SERVER_CONTEXT_CHECK_READONLY`. Ver tarea en BACKLOG.md.

---

## Procesos actuales

### Proceso: Publicación de nuevo producto

**Disparador:** Decisión de subir una camiseta del stock físico a la tienda.  
**Pasos:**
1. Pablo fotografía la camiseta (delantera + trasera).
2. Consulta a Claude con nombre del producto + fotos para obtener precio de mercado y descripción larga.
3. Accede al admin de WordPress y crea el producto con: título SEO en inglés, atributos (liga, equipo, talla, marca, condición, año, jugador si procede), `[cv_short_description]` como descripción corta, precio, fotos.
4. Al publicar, el sistema ejecuta automáticamente: invalidar transient → reconstruir rewrite rules → flush → purgar CDN.
5. El producto queda indexado con URL limpia (sin prefijo `/producto/`).

**Actores:** Pablo (operador), Claude (apoyo en tasación y redacción).  
**Output:** Producto publicado en WooCommerce con URL limpia, SEO y descripción lista.  
**Frecuencia:** Sesiones esporádicas, por lotes.  
**Problemas conocidos:** Antes del 14/03/2026 existía un bug de 404 en productos nuevos (URLs no se regeneraban correctamente). Resuelto con refactorización de rewrite rules.

---

### Proceso: Tasación y descripción desde fotos

**Disparador:** Pablo entrega nombre del producto + foto delantera + foto trasera a Claude.  
**Pasos:**
1. Claude busca precio de mercado en ClassicFootballShirts, eBay (vendidos), Vinted ES.
2. Propone rango de precio con justificación (condición, rareza, dorsal, firma si aplica).
3. Genera descripción larga en español (contexto histórico, temporada, jugadores).
4. Descripción corta = shortcode `[cv_short_description]` (se autoinserta).

**Output:** Precio recomendado + descripción lista para pegar en WooCommerce.

---

## Sistemas y herramientas actuales

| Herramienta / sistema | Para qué se usa | Integrado con | Problemas conocidos |
|----------------------|-----------------|---------------|---------------------|
| WordPress 7.0 | CMS base | WooCommerce, Elementor Pro | — |
| WooCommerce 10.8.1 | Tienda online, catálogo, pedidos | WooPayments, PayPal, LiteSpeed, RankMath | HPOS activo (OrdersTableDataStore); sync a wp_posts desactivado. Incompatibilidad con "Objetos caché" (experimental) — no activar |
| Elementor Pro 3.35.1 | Page builder, diseño frontend | WooCommerce, Hello Elementor Child | **Expira ~2026-07-01. Operador NO renueva.** 1 versión mayor detrás (4.1.1). Mini-cart template override desactualizado. `woocommerce_product_query` NO intercepta queries de Elementor Loop; usar `pre_get_posts` |
| Hello Elementor Child 1.0.0 | Tema hijo custom | Elementor Pro | functions.php de 62KB con lógica crítica. Parent: Hello Elementor 3.4.5 |
| LiteSpeed Cache 7.8.1 | Caché y rendimiento | QUIC.cloud CDN, WooCommerce | Operador considera que ralentiza significativamente la web; objetivo: reconfigurar o retirar. UCSS/CSS asíncrono desactivado (pendiente exclusiones) |
| QUIC.cloud CDN | CDN y DNS | LiteSpeed | Enable QUIC Backend debe permanecer OFF (causa error 520) |
| WooPayments 10.8.0 | Pagos principales (tarjeta, GPay, APay) | WooCommerce, Stripe | Modo LIVE activo. APMs: card, bancontact, ideal, multibanco. Apple/Google Pay activos en product+cart+checkout. reCAPTCHA v3+v2 configurado |
| PayPal Payments 4.0.4 | Pagos secundarios | WooCommerce | Onboarded. Webhook status: vacío (a verificar). |
| Raiola Networks Inicio SSD 2.0 | Hosting (LiteSpeed, cPanel user: vnvnhzdd, PHP 8.3.31, MariaDB 11.4.10-cll-lve, IP 178.211.133.29) | JetBackup 5, Imunify360 | PHP SAPI: litespeed. Servidor HTTP: LiteSpeed (no Apache). Handler PHP = ea-php81 (ea-php83 da error 403 — NO cambiar) |
| APCu (via plugin Pierre Lannoy) | Object cache | WordPress | **OPcache lleno** (16 bytes libres, cache_full=true). WP_MEMORY_LIMIT=40M en front-end, 512M en admin. Redis no disponible en Raiola |
| RankMath | SEO | WordPress, Google Analytics | — |
| Google Analytics + Search Console | Métricas y indexación | WordPress, Complianz (GDPR) | GTM gestionado por Complianz — no modificar carga independiente |
| Complianz | Gestión cookies GDPR | GTM, WordPress | — |
| WP Mail SMTP | Emails transaccionales | info@catenacciovintage.com | — |
| InPost via Envia.com | Logística de envíos | WooCommerce | Widget selección Punto Pack no integrado en checkout |
| Vinted | Canal de venta paralelo | — | Reseñas (4.9★ / 130+) no integradas en la web |
| Filtro Camisetas Pro v3.0.0 | Filtros avanzados en tienda | WooCommerce, Elementor | Incompatible con "Objetos caché" experimental WooCommerce |
| Off-Canvas Menu v2.2.0 | Menú navegación "Explorar Colección" | WooCommerce, WordPress | — |

---

## Problemas detectados

| ID | Problema | Impacto | Fuente | Prioridad |
|----|---------|---------|--------|-----------|
| PROB-01 | WP secret keys de wp-config.php expuestas en chat de sesión el 15/03/2026 | Seguridad: **RESUELTO** — rotadas manualmente por operador el 2026-06-06 (SEC-002) | SRC-02 | ~~Alta~~ Cerrado |
| PROB-02 | Credenciales OAuth de Google (client ID + secret) en archivo de texto plano: `Plugins/Nextend Social Login/usuario y clave secreta google.txt` | Seguridad: **RESUELTO** — OAuth rotado por operador el 2026-06-06 (SEC-001) | SRC-01 | ~~Alta~~ Cerrado |

**PROB-01 y PROB-02 resueltos. Ver `docs/discovery/SECURITY_REVIEW.md` y `docs/discovery/VALIDATION_RECORD.md` (VAL-003) para detalle. El bloqueo a TARGET_OPTIONS por seguridad queda eliminado.**
| PROB-03 | Páginas legales pendientes de revisión y creación (política de devoluciones, condiciones generales, aviso legal, privacidad) — obligatorio UE | Legal/compliance | SRC-02 | Alta |
| PROB-04 | Stock publicado (~28 productos) muy por debajo del objetivo declarado (100+) — el crecimiento del catálogo es el principal bloqueante de escala | Negocio | SRC-02 | Alta |
| PROB-05 | Crawler de Facebook puede saturar el servidor con peticiones masivas a URLs de filtros (ocurrió 15/03/2026, causó 2h downtime) | Rendimiento/disponibilidad | SRC-02 | Media |
| PROB-06 | UCSS y CSS asíncrono desactivados — PageSpeed móvil en 75 en lugar del máximo posible; pendiente configurar exclusiones | Rendimiento | SRC-02 | Media |
| PROB-07 | Widget de selección de Punto Pack InPost no integrado en el checkout — experiencia de envío incompleta para el método preferido | UX checkout | SRC-02 | Media |
| PROB-08 | Contexto del proyecto disperso en archivos locales sin gestión ordenada entre sesiones — razón principal por la que entra en lafabrica Discovery Intake | Workflow/escalabilidad | SRC-01 | Alta |
| PROB-09 | OPcache completamente lleno (16 bytes libres, cache_full=true) — nuevos archivos PHP no se cachean, degradando rendimiento en tiempo real | Rendimiento | SERVER_CONTEXT_CHECK 2026-06-10 | Alta |
| PROB-10 | WP_MEMORY_LIMIT = 40M en front-end — posibles fatal errors en operaciones con muchos plugins activos | Estabilidad | SERVER_CONTEXT_CHECK 2026-06-10 | Media |
| PROB-11 | Elementor Pro mini-cart template override desactualizado (sin header de versión, requiere 10.0.0) — posibles bugs visuales en mini-carrito | UX/compatibilidad | SERVER_CONTEXT_CHECK 2026-06-10 | Media |
| PROB-12 | WPS Hide Login instalado pero inactivo — /wp-admin expuesto en URL por defecto | Seguridad | SERVER_CONTEXT_CHECK 2026-06-10 | Media |
| PROB-13 | Páginas Carrito y Mi Cuenta flaggeadas por WooCommerce como sin bloque/shortcode estándar — puede ser falso positivo de Elementor o rotura real | UX/funcionalidad | SERVER_CONTEXT_CHECK 2026-06-10 | Media |
| PROB-14 | PayPal webhook status vacío en System Status — estado de webhooks PayPal desconocido | Pagos | SERVER_CONTEXT_CHECK 2026-06-10 | Media |
| PROB-15 | 8+ ghost tables en BD de plugins removidos (BeRocket, YITH WCAN, WOOF, WPF, Smush, WSAL, Jetpack) — deuda técnica menor | Técnico | SERVER_CONTEXT_CHECK 2026-06-10 | Baja |

---

## Activos reutilizables

- **CONTEXTO_PROYECTO_CATENACCIO.md** (SRC-02): documento técnico completo de 37KB con stack, configuraciones, decisiones, historial y workflow. Es el activo documental más valioso — equivale a meses de trabajo de contexto.
- **functions.php del tema hijo** (SRC-04): 62KB de código PHP con lógica compleja de rewrite rules, carrito, SEO shortcodes, integración WooCommerce. Producción-testeado.
- **Plugin Filtro Camisetas Pro v3.0.0** (SRC-04): plugin custom funcional con filtros AJAX, contadores en tiempo real, shortcodes, soporte HPOS. Desarrollado específicamente para el catálogo de Catenaccio.
- **Plugin Off-Canvas Menu v2.2.0** (SRC-04): menú navegación "Explorar Colección" con cache via transients, acordeón liga→equipo. Funcional.
- **~30 variantes de logo y marca** (SRC-05): versiones horizontal, circular, colores (blanco, verde, negro). Incluye carpeta REBRANDING con iteraciones. Brand system completo.
- **Banners web** (SRC-05): desktop, tablet y mobile creados (bannerdesktop.png, bannermobile.png, bannertablet.png + biggerdesktopbanner.avif).
- **Iconos SVG de métodos de pago** (SRC-05): visa, mastercard, amex, paypal, googlepay — ya en el tema hijo en producción.
- **Stock fotográfico de ~30 productos originales** (SRC-03): carpetas individuales por producto con fotos, lista para re-publicar o migrar.
- **STOCK.xlsx** (SRC-03): inventario estructurado con información de stock (última modificación 19/04/2026).
- **Backlogs v3-v6** (SRC-06): historial de decisiones de producto y backlog actualizado (v6 = 19/04/2026).

---

## Cosas que no deben asumirse

- **No asumir rotura inmediata del front-end al expirar Elementor Pro (~2026-07-01)** — el contenido renderizado suele mantenerse visible. Lo que sí rompe: el editor Pro (no se puede editar con Pro), los widgets Pro pueden degradarse, el mini-cart override ya está desactualizado. El impacto exacto depende de qué widgets Pro estén en uso activo. Observar el sitio post-expiración antes de actuar en pánico.
- **No asumir que la tienda está inactiva o sin ventas** — está live, con pedidos reales procesados y pagos activados desde febrero 2026.
- **No asumir que migrar de WordPress es la decisión correcta** — hay inversión significativa en plugins custom, configuración de pagos, SEO activo y 28+ productos publicados. La migración tendría coste real. Evaluar en TARGET_OPTIONS con evidencia.
- **No asumir que el estado del CONTEXTO (15/03/2026) refleja el estado actual** — confirmado a 2026-06-10: 28 productos (sin nuevas publicaciones desde marzo), sitio operativo, WooPayments live.
- **No asumir que las WP secret keys siguen comprometidas** — rotadas por operador el 2026-06-06 (SEC-002 resuelto).
- **No asumir que el servidor HTTP es Apache** — es LiteSpeed. Apache era un reporte de compatibilidad de cPanel. El PHP SAPI es `litespeed`.
- **No asumir que las páginas de Carrito y Mi Cuenta están rotas** — WooCommerce System Status las flaggea como sin bloque/shortcode estándar, pero pueden estar construidas con widgets Elementor (falso positivo frecuente). Verificar navegando al front-end antes de actuar.
- **No asumir que los archivos listados en CONTEXTO sección 19 están presentes en la carpeta legacy** — varios no se encontraron. El código real está en el servidor, no en la carpeta local.
- **No asumir que Vinted es un canal menor** — 4.9★ con 130+ reseñas indica actividad real y reputación construida.

---

## Validación

Este documento debe ser revisado y aprobado por la persona usuaria antes de que el workflow avance a `TARGET_OPTIONS.md`.

**Instrucción para la persona usuaria:**  
Lee cada sección. Para cada ítem:
- Si es correcto: no hagas nada.
- Si algo es incorrecto o incompleto: añade una nota bajo el ítem o actualiza directamente.
- Cuando hayas revisado todo: cambia el estado de este documento a `VALIDADO_POR_USUARIO` y registra la validación en `VALIDATION_RECORD.md`.

**Estado de validación:** VALIDADO_POR_USUARIO — confirmado el 2026-06-10 por el operador (Pablo). El AS-IS es suficientemente correcto para avanzar a TARGET_OPTIONS. Las incógnitas residuales no bloquean la decisión. Ver VALIDATION_RECORD.md (VAL-004).
