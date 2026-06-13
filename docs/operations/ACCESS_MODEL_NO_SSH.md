# ACCESS_MODEL_NO_SSH — Catenaccio Vintage

Modelo operativo de acceso a WordPress/WooCommerce sin SSH. Define cómo puede operar un agente con el sitio actual de forma segura sin riesgo para producción, credenciales, pagos, SEO ni el filesystem del hosting.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-13  
**Sesión:** 006  
**Estado:** DEFINIDO — pendiente de ejecución por el operador (§6)  
**Bloque de origen:** A0_ACCESS_MODEL_NO_SSH (BACKLOG: CMS_API_ACCESS_MODEL_READONLY)  
**Prerequisito para:** B1 Catenaccio Studio (WC REST API), Track 0 (auditoría Elementor)  
**Agente:** Claude Code (Sonnet)

---

## 1. VEREDICTO

El sitio Catenaccio Vintage **puede ser operado por un agente de forma segura y controlada sin SSH**, mediante la combinación de tres canales:

1. **WP REST API + WC REST API** — lectura y escritura controlada (borradores, productos, atributos).
2. **WP Admin manual por Pablo** — configuraciones, ajustes globales, publicación y operaciones de alto riesgo.
3. **cPanel / Raiola Soporte** — exclusivamente para cambios de servidor (OPcache, php.ini, backups).

**El modelo mínimo seguro para Studio es viable sin SSH.** Requiere:

- Un usuario WP limitado (rol: Author o equivalente mínimo con permisos WooCommerce).
- Un Application Password ligado a ese usuario.
- Modo operativo por defecto: **DRAFT_ONLY** — el agente prepara borradores, Pablo revisa y publica.
- El agente **nunca publica directamente**.

**Condición de activación:**  
Pablo crea las credenciales manualmente en WP Admin siguiendo la guía del §6. El agente no crea ni pide credenciales. Las credenciales viven exclusivamente en `.env.local` local — nunca en el repo, nunca en el chat.

---

## 2. Modelo de acceso por capas

### Capa 0 — Sin acceso al servidor (siempre activo para el agente)

El agente opera exclusivamente contra el repo local y las APIs de WordPress/WooCommerce sobre HTTPS. No hay acceso al filesystem del servidor, a la base de datos directamente, ni a cPanel.

```
Agente (local) → HTTPS → WP REST API / WC REST API → WordPress (BD vía WP)
```

El servidor es una caja negra accesible solo a través de las APIs de aplicación.  
**El agente no tiene acceso al filesystem del servidor bajo ninguna circunstancia.**

---

### Capa 1 — WP Admin manual (Pablo)

Para operaciones que no es seguro ni tiene sentido automatizar:

- Configurar ajustes de WooCommerce (zonas de envío, impuestos, pasarelas de pago).
- Cambiar ajustes globales de SEO (RankMath).
- Instalar, activar o desactivar plugins.
- Gestionar usuarios.
- **Revisar y publicar borradores** creados por el agente.
- Ver estado del sistema (Site Health, WooCommerce Status).

---

### Capa 2 — WP REST API + WC REST API (agente con Application Password)

Canal para que el agente opere el catálogo de forma controlada:

- Leer productos, atributos, taxonomías, categorías.
- Leer pedidos (solo lectura).
- Crear borradores de producto (`status: draft`).
- Subir imágenes a la Media Library.
- Actualizar stock y precio de productos existentes (con aprobación explícita del operador sesión por sesión).
- Leer ajustes de WooCommerce (solo lectura).

---

### Capa 3 — cPanel / File Manager / SFTP (Pablo, solo operaciones excepcionales)

Solo para:

- Subir archivos de plugin o tema hijo cuando no existe staging.
- Editar `wp-config.php` bajo instrucción explícita documentada.
- Restaurar backup desde JetBackup 5.
- Cambios urgentes de servidor que no pueden esperar soporte de Raiola.

**El agente no accede a cPanel. Nunca.**

---

### Capa 4 — Raiola Networks Soporte (Pablo, cambios de servidor)

- Aumentar `opcache.memory_consumption` (PROB-09).
- Ajustar `opcache.max_accelerated_files`.
- Cambios en php.ini que no sean editables en `wp-config.php`.
- Cambios de plan o upgrade de hosting.
- Configuración LiteSpeed a nivel de servidor.

---

## 3. Matriz tarea → canal → permisos → riesgo

| Tarea | Canal | Quién ejecuta | Permisos mínimos | Riesgo | Modo |
|-------|-------|---------------|-----------------|--------|------|
| Leer estado del sitio (versiones, plugins, sistema) | WP Admin → Site Health / WC Status | Pablo (manual) | Admin WP | Bajo | READ_ONLY |
| Auditar plantillas Elementor Library (19 items) | WP Admin → Elementor Library | Pablo (captura) | Admin WP | Bajo | READ_ONLY |
| Leer productos / atributos / taxonomías | WC REST API `GET /wc/v3/products` | Agente | Lectura WC API | Bajo | API_READ_ONLY |
| Leer taxonomías (pa_liga, pa_equipo…) | WC REST API `GET /wc/v3/products/attributes` | Agente | Lectura WC API | Bajo | API_READ_ONLY |
| Leer pedidos (diagnóstico) | WC REST API `GET /wc/v3/orders` | Agente | Lectura WC API | Bajo | API_READ_ONLY |
| Crear borrador de producto | WC REST API `POST /wc/v3/products` (`status: draft`) | Agente | Escritura WC API (scope productos) | Medio | DRAFT_ONLY |
| Subir imágenes (Media Library) | WP REST API `POST /wp/v2/media` | Agente | Author/Contributor + App Password | Medio | DRAFT_ONLY |
| Actualizar stock / precio de producto existente | WC REST API `PUT /wc/v3/products/{id}` | Agente | Escritura WC API (aprobación sesión) | Medio-alto | APPLY_WITH_APPROVAL |
| Publicar producto (draft → published) | WP Admin | Pablo (manual) | Admin WP | Alto | MANUAL_BY_PABLO |
| Cambiar ajustes de WooCommerce | WP Admin | Pablo (manual) | Admin WP | Alto | MANUAL_BY_PABLO |
| Instalar / activar / desactivar plugins | WP Admin | Pablo (manual) | Admin WP | Alto | MANUAL_BY_PABLO |
| Cambiar ajustes de pasarela de pago | WP Admin | Pablo (manual) | Admin WP | Muy alto | MANUAL_BY_PABLO |
| Cambiar SEO global (RankMath) | WP Admin | Pablo (manual) | Admin WP | Alto | MANUAL_BY_PABLO |
| Crear / modificar usuarios WP | WP Admin | Pablo (manual) | Admin WP | Alto | MANUAL_BY_PABLO |
| Tocar código PHP / CSS / tema hijo | cPanel / File Manager (solo con backup previo) | Pablo (manual) | cPanel | Muy alto | BLOCKED_WITHOUT_STAGING |
| Editar functions.php | cPanel / SFTP (solo con backup + staging recomendado) | Pablo (manual) | cPanel | Muy alto | BLOCKED_WITHOUT_STAGING |
| Cambiar DNS / hosting / dominio | Panel Raiola / DNS | Pablo (manual) | Panel hosting | Crítico | MANUAL_BY_PABLO |
| Aumentar OPcache | Raiola Soporte (ticket) | Pablo (ticket) | Soporte hosting | Medio | MANUAL_BY_PABLO |
| Cambiar WP_MEMORY_LIMIT | `wp-config.php` vía cPanel o Raiola | Pablo (manual + backup) | cPanel | Medio | MANUAL_BY_PABLO |

---

## 4. Modos de operación

### READ_ONLY

**Qué puede hacer el agente:** Solo operaciones GET. Leer productos, atributos, taxonomías, estado del sistema vía API. Cero escritura.  
**Cuándo:** Discovery, auditoría, diagnóstico, análisis de catálogo.  
**Credencial:** Application Password o WC API key read-only.  
**Reverso en error:** No aplica — solo lectura.

---

### API_READ_ONLY

**Qué puede hacer el agente:** Igual que READ_ONLY, exclusivamente sobre WP/WC REST API (no WP Admin).  
**Cuándo:** Cuando Studio necesita datos del catálogo (precios, atributos existentes, variantes) para asistir al operador.  
**Credencial:** WC API key read-only (Consumer Key + Consumer Secret) o App Password con rol de solo lectura.  
**Reverso:** No aplica.

---

### DRAFT_ONLY

**Qué puede hacer el agente:** Crear y actualizar borradores de productos (`status: draft`). Subir imágenes a la Media Library. **No puede publicar.**  
**Cuándo:** Workflow normal de Catenaccio Studio — el agente prepara el borrador con atributos, precio, descripción e imágenes. Pablo revisa y publica.  
**Credencial:** Application Password de usuario con rol "Author" (o mínimo con capacidades de producto WooCommerce).  
**Reverso:** El borrador puede descartarse en WP Admin sin consecuencias en el catálogo publicado.

---

### APPLY_WITH_APPROVAL

**Qué puede hacer el agente:** Actualizar campos de productos existentes (stock, precio, atributos) después de que Pablo haya aprobado explícitamente la operación en el prompt de la sesión.  
**Cuándo:** Correcciones de stock o precio cuando el operador lo autoriza sesión por sesión. La autorización debe ser explícita en el prompt — no implícita.  
**Credencial:** Application Password con permisos de escritura sobre productos.  
**Límite de seguridad:** Si el cambio afecta más de 5 productos, primero revisar en READ_ONLY. Reversión manual en WP Admin si algo falla.

---

### MANUAL_BY_PABLO

**Qué puede hacer el agente:** Preparar las instrucciones, los datos y el contexto para que Pablo ejecute manualmente en WP Admin o cPanel. **El agente no ejecuta la operación.**  
**Cuándo:** Publicar producto, cambiar ajustes, instalar plugins, configurar pasarelas, cambiar DNS, gestionar usuarios.  
**Credencial:** Credenciales del operador — el agente no las tiene ni las necesita.

---

### BLOCKED_WITHOUT_STAGING

**Qué puede hacer el agente:** Preparar el patch, documentarlo y entregarlo a Pablo para revisión manual. **El agente no aplica el patch a producción.**  
**Cuándo:** Cualquier cambio de código PHP/CSS en el tema hijo, `functions.php`, o plugins custom.  
**Cuándo se desbloquea:** Solo cuando existe un entorno staging donde probar antes de aplicar a producción.  
**Estado actual:** BLOQUEADO — Raiola Inicio SSD 2.0 no tiene staging integrado. Ver §8 para opciones.

**Excepción — Microfix en producción (solo con autorización explícita):** ver §8.

---

## 5. Credenciales permitidas y prohibidas

### Permitidas para Studio / operación del agente

| Tipo | Qué es | Dónde vive | Quién la crea |
|------|--------|-----------|---------------|
| Application Password WP | Contraseña de aplicación de usuario WP limitado | `.env.local` (local, nunca repo) | Pablo en WP Admin |
| WC API Key (Consumer Key + Secret) | API key de WooCommerce para el agente | `.env.local` (local, nunca repo) | Pablo en WP Admin → WooCommerce → Ajustes → Avanzado → API REST |
| `.env.local` | Archivo local con las credenciales anteriores | Solo en el equipo de Pablo | Pablo (manual) |

### Prohibidas

| Tipo | Por qué prohibida |
|------|-------------------|
| Contraseña del usuario administrador WP de Pablo | El agente nunca usa la cuenta admin. Compromiso = acceso total al sitio. |
| `wp-config.php` secrets/keys | El agente no necesita acceso al filesystem del servidor. |
| Credenciales cPanel (`vnvnhzdd` + contraseña) | El agente no accede a cPanel bajo ninguna circunstancia. |
| Credenciales de pasarela de pago (WooPayments, PayPal) | Fuera del scope del agente. Solo Pablo las gestiona. |
| Credenciales de DNS / Cloudflare / Raiola panel | Fuera del scope del agente. |
| Credenciales en mensajes de chat | Si se pegan accidentalmente → revocar inmediatamente. |
| Credenciales en el repo (`.env` commiteado) | `.env` y `.env.local` siempre en `.gitignore`. Verificar antes de cada commit. |

### Regla de oro

> El operador crea la credencial en WP Admin, la pone en `.env.local`, y confirma al agente que está lista. El agente la lee del entorno. **Nunca pegar credenciales en el chat.**

---

## 6. Guía para crear Application Password y WC API Key

**Esta guía es para ejecución futura por Pablo. No ejecutar en esta sesión.**

---

### 6.1 — Crear usuario WP limitado

1. WP Admin → Usuarios → Añadir nuevo.
2. Nombre de usuario: `catenaccio-studio-agent` (o similar).
3. Email: alias privado (p.ej. `info+studio@catenacciovintage.com`).
4. Rol: **Author** como punto de partida.
   - Si WooCommerce requiere capacidades adicionales para crear productos, agregar capacidades mínimas vía código en `functions.php` o plugin auxiliar — no escalar directamente a Shop Manager.
   - **No usar el usuario administrador de Pablo.** Compromiso del agente ≠ compromiso del admin.
5. Contraseña del usuario generada automáticamente — guardar en gestor de contraseñas, no en repo.

---

### 6.2 — Crear Application Password para ese usuario

1. WP Admin → Usuarios → editar `catenaccio-studio-agent`.
2. Bajar al bloque "Contraseñas de aplicación".
3. Nombre de la aplicación: `Catenaccio Studio - Agent` (descriptivo — facilita saber qué revocar).
4. Pulsar "Añadir nueva contraseña de aplicación".
5. **Copiar el valor generado inmediatamente** — WordPress no lo muestra de nuevo.
6. Autenticación: Basic Auth con `Authorization: Basic base64(usuario:application_password)`.
7. Guardar en `.env.local` del repo de Studio (no de este repo):
   ```
   WP_APP_USER=catenaccio-studio-agent
   WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
   WP_SITE_URL=https://catenacciovintage.com
   ```
8. Verificar que `.env.local` está en `.gitignore` antes de cualquier commit.
9. Confirmar al agente que la credencial está lista — el agente la leerá del entorno, no del chat.

---

### 6.3 — Crear WC API Key (alternativa)

Las WC API Keys tienen la ventaja de un scope de permisos configurable directamente (read / read-write).

1. WP Admin → WooCommerce → Ajustes → Avanzado → API REST → Añadir clave.
2. Descripción: `Catenaccio Studio - Agent (read-write productos)`.
3. Usuario: `catenaccio-studio-agent`.
4. Permisos: **Lectura/Escritura**.
5. Pulsar "Generar clave de API".
6. **Copiar Consumer Key y Consumer Secret inmediatamente** — no se muestran de nuevo.
7. Guardar en `.env.local`:
   ```
   WC_CONSUMER_KEY=ck_xxxxxxxxxxxxx
   WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
   WP_SITE_URL=https://catenacciovintage.com
   ```
8. Autenticación: Basic Auth con `Authorization: Basic base64(consumer_key:consumer_secret)`.
9. Verificar `.gitignore` antes de commit.

---

### 6.4 — Application Password vs WC API Key: cuándo usar cuál

| Situación | Recomendación |
|-----------|--------------|
| Acceso solo a WooCommerce (productos, pedidos, atributos) | WC API Key — scope más acotado, no expone la REST API de WP en general |
| Acceso a WP + WC (subir imágenes + crear productos) | Application Password — cubre toda la REST API (WP y WC) con una sola auth |
| Revocar sin afectar al usuario | WC API Key — se revoca la key específica |
| Revocar el usuario completo | Application Password — revocar todas las passwords o eliminar el usuario |

**Para Studio MVP:** usar Application Password — Studio necesita subir imágenes (WP REST API `POST /wp/v2/media`) y crear productos (WC REST API) en el mismo flujo.

---

## 7. Modelo de revocación

### Escenarios de revocación inmediata

1. **Credencial comprometida** (pegada en chat, subida al repo, visible en log): revocar en WP Admin en menos de 10 minutos.
2. **Agente opera fuera del scope esperado**: revocar, investigar eventos en WP Admin → Usuarios → último acceso, restablecer solo tras revisión.
3. **Fin de fase de desarrollo de Studio**: rotar la credencial como medida preventiva.
4. **Usuario limitado deja de ser necesario**: desactivar el usuario (no eliminar — mantener autoría de los borradores).

---

### Cómo revocar Application Password

WP Admin → Usuarios → editar `catenaccio-studio-agent` → Contraseñas de aplicación → Revocar por nombre o "Revocar todas".

---

### Cómo revocar WC API Key

WP Admin → WooCommerce → Ajustes → Avanzado → API REST → columna "Acciones" → icono papelera.

---

### Cómo revocar el usuario completo

WP Admin → Usuarios → `catenaccio-studio-agent` → Eliminar usuario → reasignar sus posts a Pablo para no perder los borradores.

---

### Verificar si el acceso fue usado

WP Admin → Usuarios → columna "Último acceso" del usuario limitado. Acceso en fechas/horas que no coincidan con sesiones de Studio → revocar y auditar.

---

### Rotación periódica

- Rotar la Application Password cada **90 días** como mínimo.
- Rotar al final de cada fase de desarrollo significativa.
- Después de cualquier incidente de seguridad.

---

## 8. Qué queda BLOQUEADO sin staging

### Operaciones bloqueadas para el agente actualmente

| Operación | Por qué bloqueada | Cómo desbloquear |
|-----------|------------------|------------------|
| Modificar `functions.php` | Alto riesgo de romper URLs, carrito, SEO, pagos (62KB de código crítico en producción) | Crear staging o clon de prueba |
| Modificar tema hijo (CSS/PHP) | Riesgo de rotura visual en producción sin rollback rápido | Crear staging o clon |
| Editar plugins custom (Filtro Camisetas Pro, Off-Canvas Menu) | Producción live — cambio sin staging = riesgo directo al carrito y filtros | Crear staging o clon |
| Instalar plugins nuevos | Sin rollback automatizado en plan Raiola básico | Backup manual JetBackup 5 previo + validación Pablo |
| Actualizar plugins existentes | Sin rollback automatizado | Backup manual JetBackup 5 previo |
| Cambiar `wp-config.php` | Nivel de servidor — el agente no tiene acceso | Pablo vía cPanel solo con backup |
| Cambiar `.htaccess` | Nivel de servidor — el agente no tiene acceso | Pablo vía cPanel solo con backup |

---

### Excepción — Microfix autorizado en producción

Si hay un bug crítico en producción (carrito roto, 404 masivo, pago falla) y no existe staging:

1. Pablo hace backup en JetBackup 5 **antes** del cambio.
2. El agente prepara el patch con descripción exacta del cambio y la línea exacta afectada.
3. Pablo revisa el patch línea a línea.
4. Pablo aplica el patch manualmente vía cPanel / File Manager.
5. Pablo verifica el resultado en el navegador.
6. Si falla: restaurar el backup antes de 30 minutos.
7. Registrar el microfix en DECISIONS.md y `agent_events.jsonl`.

**Este procedimiento requiere autorización explícita en el prompt de la sesión.** El agente no propone ni aplica microfixes sin esta autorización.

---

### Opciones para crear un staging en Raiola

Raiola Inicio SSD 2.0 no ofrece staging integrado one-click. Opciones disponibles:

1. **Subdominio manual:** crear `staging.catenacciovintage.com` en cPanel, clonar la BD con phpMyAdmin, copiar archivos con File Manager. Sin coste adicional de plan — solo tiempo.
2. **Plugin WP Duplicator o All-in-One WP Migration:** crear una copia del sitio en el mismo hosting. Más accesible, sin acceso directo a BD.
3. **Upgrade de plan en Raiola:** planes superiores pueden incluir staging o más recursos.
4. **Entorno local:** usar Local by Flywheel o DevKinsta para probar PHP antes de subir. Requiere exportar BD y archivos.

---

## 9. Plan OPcache / Raiola

### Problema activo (PROB-09)

OPcache completamente lleno: 16 bytes libres, `cache_full = true`, hit rate 93.65%. Nuevos archivos PHP no se cachean al actualizar plugins o el tema. Esto degrada el rendimiento en tiempo real y puede ocultar cambios recientes.

---

### Qué puede hacer Pablo en cPanel (sin ticket)

- **Verificar estado actual:** WP Admin → Salud del sitio → Información del sistema → apartado OPcache.
- **Flush manual de OPcache:**
  - LiteSpeed Cache → Herramientas → Purgar OPcache (si está habilitado en el plugin).
  - Desde WP Admin → LiteSpeed Cache → Herramientas → Purgar todo.

---

### Qué debe pedir Pablo a Raiola (ticket de soporte)

Texto recomendado para el ticket:

> "Mi instalación de WordPress muestra OPcache completamente lleno (`cache_full = true`, 16 bytes libres) en Site Health. Necesito aumentar `opcache.memory_consumption` en la configuración de PHP. El plan es Raiola Inicio SSD 2.0. ¿Pueden aumentar este valor? ¿Cuál es el máximo disponible para este plan? También necesito confirmar si es posible ajustar `opcache.max_accelerated_files` para un WordPress con ~19 plugins activos."

Valores a solicitar:

| Parámetro | Valor recomendado | Valor mínimo aceptable |
|-----------|-----------------|----------------------|
| `opcache.memory_consumption` | 128 MB | 64 MB |
| `opcache.max_accelerated_files` | 4000 | 2000 |
| `opcache.revalidate_freq` | 60 segundos | 0 (desactivado, si el hosting lo permite) |

---

### WP_MEMORY_LIMIT (PROB-10)

`WP_MEMORY_LIMIT = 40M` es bajo para 19+ plugins activos. Está en `wp-config.php` y Pablo puede editarlo vía cPanel → File Manager:

```php
define('WP_MEMORY_LIMIT', '128M');
```

(`WP_MAX_MEMORY_LIMIT = 512M` ya está correcto para operaciones admin — no cambiar.)

**Antes de editar `wp-config.php`:** hacer backup en JetBackup 5.

---

### Evidencia requerida antes y después

**Antes:**
- Captura de WP Admin → Salud del sitio → Información del sistema → OPcache: `memory_consumption`, `max_accelerated_files`, `cache_full`, `free_memory`.

**Después:**
- Misma captura.
- Confirmar `cache_full = false` y `free_memory > 20%`.
- Confirmar que el sitio responde: home (`/`), catálogo (`/camisetas/`), checkout (`/finalizar-compra/`).

---

## 10. Siguiente sesión recomendada

### Track 0 — Sesión 007 (urgente, deadline 2026-07-01)

**Objetivo:** Auditoría Elementor Library  
**Tarea:** Listar y clasificar los 19 items de `elementor_library` — identificar cuáles usan widgets Pro exclusivos (Dynamic Tags Pro, Loop Grid Pro, Section deprecated) frente a los que usan widgets Free o que podrían migrarse a Gutenberg/WooCommerce Blocks.  
**Canal:** WP Admin → Elementor Library → captura + análisis  
**Agente recomendado:** Antigravity (requiere browser + capturas) o Sonnet con capturas entregadas por Pablo.  
**Prerequisito:** Pablo abre WP Admin y entrega la lista o capturas del Elementor Library.  
**Output esperado:** Lista de los 19 templates con: nombre, tipo (page/section/global widget), widgets Pro en uso, widget equivalente Free o alternativa WooCommerce Blocks.

---

### Track 1 — Sesión 008 (prerequisito para Studio)

**Objetivo:** Activar acceso API — crear usuario limitado + Application Password + verificar endpoint  
**Tarea:** Pablo crea el usuario `catenaccio-studio-agent` y el Application Password siguiendo la guía §6. El agente prepara un script de verificación para testear `GET /wc/v3/products` y confirmar que las credenciales funcionan.  
**Output esperado:** `.env.local` configurado, endpoint WC API verificado, acceso API listo para Studio.  
**Prerequisito:** Pablo ejecuta los pasos de §6 de forma manual (10–15 minutos).

---

### Acción inmediata sin sesión de agente

Pablo puede abrir el ticket a Raiola siguiendo §9 ahora mismo — no requiere sesión de agente. 10 minutos de gestión, ganancia directa de rendimiento antes del deadline 2026-07-01.

---

## Historial de cambios

| Fecha | Cambio | Quién |
|-------|--------|-------|
| 2026-06-13 | Documento creado — modelo de acceso sin SSH para Catenaccio Vintage | Claude Code (Sonnet), Sesión 006 |
