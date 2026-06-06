# AS_IS_UNDERSTANDING — Catenaccio Vintage

Comprensión documentada del estado actual del proyecto, construida a partir de las fuentes registradas en `SOURCE_REGISTRY.md`.

**Solo puede avanzarse al diseño TARGET una vez que este documento esté en estado `VALIDADO_POR_USUARIO`.**

**Proyecto:** Catenaccio Vintage  
**Fecha de última actualización:** 2026-06-06  
**Estado:** BORRADOR  
**Fuentes consultadas:** SRC-01, SRC-02, SRC-03, SRC-04, SRC-05, SRC-06  
**Conflictos resueltos antes de esta versión:** ver CONFLICT_REGISTER.md — CONF-001 detectado, pendiente de resolución

---

## Hechos confirmados

- Catenaccio Vintage es una tienda WooCommerce de camisetas vintage de fútbol, accesible en `catenacciovintage.com`, operada por Pablo. — fuente: SRC-02
- La tienda está **activa y en producción** con pagos live habilitados desde el 21/02/2026. — fuente: SRC-02
- Stack técnico: WordPress 6.x + WooCommerce + Elementor Pro + tema hello-elementor-child, sobre hosting Raiola Networks (LiteSpeed, PHP 8.3, MySQL ~104.8 MB). — fuente: SRC-02
- CDN: QUIC.cloud activo desde 15/02/2026 (DNS migrado a nameservers QUIC.cloud). — fuente: SRC-02
- Hay ~28 productos publicados a fecha 15/03/2026 (última actualización del CONTEXTO). El objetivo declarado es 100+ productos. — fuente: SRC-02
- Pasarelas de pago operativas: WooPayments (tarjeta, Google Pay, Apple Pay, Bancontact, iDEAL, Multibanco) + PayPal Business. Pedido real #1556 procesado. — fuente: SRC-02
- Checkout migrado de Elementor a Checkout Blocks (Gutenberg) el 20-21/02/2026. — fuente: SRC-02
- Hay dos plugins custom desarrollados con vibe coding + Claude: Filtro Camisetas Pro v3.0.0 y Off-Canvas Menu v2.2.0. — fuente: SRC-02, SRC-04
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

- **Elementor Pro cancelado — impacto en el sitio pendiente de verificar**: Elementor Pro era parte del stack AS-IS (page builder, diseño frontend, widgets Pro, templates). La suscripción ha sido cancelada (2026-06-06). El impacto en la web actual —posible degradación de widgets Pro, popups, plantillas premium, capacidades del builder— no está confirmado. No asumir rotura inmediata del sitio: la versión gratuita puede mantener parte de la funcionalidad. Sí considerarlo como driver de arquitectura y factor de coste/fricción a futuro en TARGET_OPTIONS. — **pendiente de validar**

- **La tienda ha tenido actividad después del 15/03/2026**: STOCK.xlsx y varias carpetas de productos en Stock/Original tienen fecha de modificación 19/04/2026. Es probable que se hayan publicado más productos o actualizado el stock entre marzo y abril. — **pendiente de validar**
- **El "bloqueo anterior" no fue técnico sino de workflow**: la tienda funciona y tiene ventas reales. El bloqueo fue de gestión del contexto: todo el conocimiento disperso en archivos locales y chats sin persistencia entre sesiones, dificultando escalar el proyecto. — **pendiente de validar**
- **Migrar de WordPress/WooCommerce puede no ser la decisión correcta**: la inversión en plugins custom, configuración de pagos, SEO activo, 28+ productos publicados y experiencia de usuario validada hace que la migración tenga un coste alto. Requiere evaluación objetiva en TARGET_OPTIONS. — **pendiente de validar**
- **El inventario físico supera los productos publicados**: hay 30 carpetas en Stock/Original pero solo ~28 productos publicados a 15/03/2026. Probablemente hay stock físico pendiente de publicar. — **pendiente de validar**
- **La cuenta de Vinted es activa y complementaria**: en CONTEXTO se menciona "4.9★ / 130+ opiniones en Vinted" (tarea #9 del backlog). Vinted parece ser un canal de venta paralelo con tracción. — **pendiente de validar**

---

## Incógnitas conocidas

- **Estado actual de la tienda (06/06/2026)**: el CONTEXTO tiene fecha 15/03/2026 y hay actividad hasta al menos 19/04/2026. Los últimos ~6 semanas no están documentados. Número real de productos, estado del stock y posibles incidentes desde entonces son desconocidos. — impacto: medio; afecta la validez del AS-IS
- **Contenido de backlog_catenaccio_v6.xlsx** (Excel, no legible sin herramienta): es la versión más reciente del backlog (19/04/2026). Puede contener decisiones de producto más actualizadas que el CONTEXTO. — impacto: medio
- **WP secret keys**: según CONTEXTO (tarea #42), las claves secretas de wp-config.php quedaron expuestas en un chat de sesión el 15/03/2026 y estaban pendientes de renovar. No se puede confirmar si fueron renovadas. — impacto: alto (seguridad)
- **Código actual del tema hijo**: el archivo functions.php de la carpeta legacy tiene fecha 14/03/2026. No se conoce si hubo modificaciones posteriores en el servidor. — impacto: bajo
- **Archivos referenciados en CONTEXTO sección 19 no encontrados en la carpeta legacy**: `_htaccess.md`, `filtro-camisetas.md`, `catenaccio-offcanvas-menu.md`, `resumen-operativo-catenaccio.docx`, `PROMPT_AUDITORIA_WORDPRESS.md`, `PREFERENCIAS_TRABAJO_PABLO.md`, `css-carrito-v6-completo.css`, `snippet-carrito-v2.3.php`. Pueden estar en otra ubicación, haberse eliminado o no haberse guardado en la carpeta legacy. Ver CONF-001. — impacto: bajo (el código real está en el servidor)
- **Presencia real en Vinted**: número exacto de reseñas actuales, URL del perfil, stock activo en Vinted. — impacto: medio (afecta decisión sobre integración Vinted↔web)
- **Estado del buscador AJAX móvil**: estaba "en desarrollo" según CONTEXTO sección 13 con pendientes no resueltos (breadcrumbs, estado recientes). No se sabe si fue completado. — impacto: bajo

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
| WordPress 6.x | CMS base | WooCommerce, Elementor Pro | — |
| WooCommerce | Tienda online, catálogo, pedidos | WooPayments, PayPal, LiteSpeed, RankMath | Incompatibilidad con "Objetos caché" (experimental) — no activar |
| Elementor Pro | Page builder, diseño frontend | WooCommerce, Hello Elementor Child | `woocommerce_product_query` NO intercepta queries de Elementor Loop; usar `pre_get_posts` |
| Hello Elementor Child | Tema hijo custom | Elementor Pro | functions.php de 62KB con lógica crítica |
| LiteSpeed Cache | Caché y rendimiento | QUIC.cloud CDN, WooCommerce | UCSS/CSS asíncrono desactivado (pendiente exclusiones) |
| QUIC.cloud CDN | CDN y DNS | LiteSpeed | Enable QUIC Backend debe permanecer OFF (causa error 520) |
| WooPayments | Pagos principales (tarjeta, GPay, APay) | WooCommerce, Stripe | reCAPTCHA v3+v2 configurado |
| PayPal Business | Pagos secundarios | WooCommerce | "Paga más tarde" desactivado |
| Raiola Networks | Hosting (LiteSpeed, cPanel, PHP 8.3) | JetBackup 5, Imunify360 | Handler PHP = ea-php81 (ea-php83 da error 403 — NO cambiar) |
| APCu (via plugin Pierre Lannoy) | Object cache | WordPress | Redis no disponible en Raiola |
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
| PROB-01 | WP secret keys de wp-config.php expuestas en chat de sesión el 15/03/2026 — pendiente confirmar si fueron renovadas | Seguridad: riesgo si las claves siguen activas | SRC-02 | Alta |
| PROB-02 | Credenciales OAuth de Google (client ID + secret) en archivo de texto plano: `Plugins/Nextend Social Login/usuario y clave secreta google.txt` | Seguridad: riesgo si el OAuth sigue activo | SRC-01 | Alta |

**PROB-01 y PROB-02 tienen plan de acción detallado en `docs/discovery/SECURITY_REVIEW.md` (SEC-002 y SEC-001 respectivamente). El discovery no debe avanzar a TARGET_OPTIONS hasta resolver ambos riesgos o documentar el riesgo residual aceptado.**
| PROB-03 | Páginas legales pendientes de revisión y creación (política de devoluciones, condiciones generales, aviso legal, privacidad) — obligatorio UE | Legal/compliance | SRC-02 | Alta |
| PROB-04 | Stock publicado (~28 productos) muy por debajo del objetivo declarado (100+) — el crecimiento del catálogo es el principal bloqueante de escala | Negocio | SRC-02 | Alta |
| PROB-05 | Crawler de Facebook puede saturar el servidor con peticiones masivas a URLs de filtros (ocurrió 15/03/2026, causó 2h downtime) | Rendimiento/disponibilidad | SRC-02 | Media |
| PROB-06 | UCSS y CSS asíncrono desactivados — PageSpeed móvil en 75 en lugar del máximo posible; pendiente configurar exclusiones | Rendimiento | SRC-02 | Media |
| PROB-07 | Widget de selección de Punto Pack InPost no integrado en el checkout — experiencia de envío incompleta para el método preferido | UX checkout | SRC-02 | Media |
| PROB-08 | Contexto del proyecto disperso en archivos locales sin gestión ordenada entre sesiones — razón principal por la que entra en lafabrica Discovery Intake | Workflow/escalabilidad | SRC-01 | Alta |

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

- **No asumir rotura inmediata del sitio al cancelar Elementor Pro** — la versión gratuita puede mantener parte de la funcionalidad activa. El impacto exacto depende de qué widgets Pro, popups y plantillas se usen activamente. Verificar en el sitio real antes de actuar.
- **No asumir que la tienda está inactiva o sin ventas** — está live, con pedidos reales procesados y pagos activados desde febrero 2026.
- **No asumir que migrar de WordPress es la decisión correcta** — hay inversión significativa en plugins custom, configuración de pagos, SEO activo y 28+ productos publicados. La migración tendría coste real. Evaluar en TARGET_OPTIONS con evidencia.
- **No asumir que el estado del CONTEXTO (15/03/2026) refleja el estado actual** — hay ~3 meses sin documentar. Pueden existir cambios en productos, configuración o incidentes.
- **No asumir que las WP secret keys fueron renovadas** — estaban pendientes según CONTEXTO tarea #42.
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

**Estado de validación:** pendiente — BORRADOR generado el 2026-06-06 por Claude Code (discovery)
