# SECURITY_REVIEW — Catenaccio Vintage

Revisión de riesgos de seguridad detectados durante el Discovery Intake. Este documento NO contiene credenciales, secretos ni valores sensibles. Su propósito es orientar las acciones manuales que debe ejecutar la persona usuaria fuera del repositorio.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-06  
**Estado:** PENDIENTE DE ACCIÓN — riesgos documentados, resolución no confirmada  
**Relacionado con:** `AS_IS_UNDERSTANDING.md` (PROB-01, PROB-02), `SOURCE_REGISTRY.md` (SRC-BLK-01)

---

## Riesgos detectados

### SEC-001 — Credenciales OAuth de Google (Nextend Social Login) en archivo de texto plano

**Estado:** PENDIENTE DE ACCIÓN  
**Severidad:** Alta  
**Detectado:** 2026-06-06 (discovery inicial, VAL-001)

#### Qué se sabe

- Existe un archivo de texto plano en la carpeta legacy local:  
  `C:\Users\USUARIO\Catenaccio Vintage\Plugins\Nextend Social Login\usuario y clave secreta google.txt`
- El nombre del archivo sugiere que contiene un Google OAuth 2.0 **client ID** y **client secret** para el plugin Nextend Social Login.
- El plugin Nextend Social Login permite el inicio de sesión en WordPress con cuentas de Google, Facebook y otros proveedores OAuth.
- El archivo fue clasificado como CONFIDENCIAL en `SOURCE_REGISTRY.md` (SRC-BLK-01) y **no fue abierto ni leído** durante el discovery.
- La presencia del archivo en una carpeta local indica que estas credenciales fueron obtenidas en Google Cloud Console y guardadas manualmente.

#### Qué no se sabe

- Si las credenciales siguen activas (no revocadas) en Google Cloud Console.
- En qué proyecto de Google Cloud fueron creadas.
- Si el plugin Nextend Social Login está actualmente instalado y activo en la instalación de WordPress en producción (`catenacciovintage.com`).
- Si el archivo de credenciales existe en otras ubicaciones (cloud, drives, chats).
- Cuándo fue la última vez que se usaron estas credenciales.

#### Impacto potencial

- Si el client secret sigue activo y alguien accede al archivo local, podría configurar una aplicación falsa que solicite tokens OAuth haciéndose pasar por la aplicación legítima.
- Si el plugin está activo en producción, un atacante con el secret podría intentar interceptar el flujo OAuth o generar tokens para usuarios existentes dependiendo de la configuración.
- Si el proyecto de Google Cloud asociado tiene otras APIs habilitadas (Google Drive, Gmail, etc.), el impacto puede extenderse más allá del login de WordPress.
- Riesgo residual incluso si el plugin ya no está activo: las credenciales siguen siendo válidas hasta ser revocadas explícitamente.

#### Acción manual recomendada

Ejecutar los siguientes pasos en este orden:

1. **Acceder a Google Cloud Console**: ir a [console.cloud.google.com](https://console.cloud.google.com) con la cuenta de Google asociada a `catenacciovintage.com`.
2. **Localizar el proyecto**: en el selector de proyectos, buscar el proyecto que corresponde a Nextend Social Login / Catenaccio Vintage.
3. **Ir a APIs y servicios → Credenciales** (`APIs & Services > Credentials`).
4. **Identificar el OAuth 2.0 Client ID** correspondiente (probablemente con nombre relacionado con Nextend, WordPress o catenacciovintage.com).
5. **Revocar o eliminar la credencial**: hacer clic en el icono de eliminar o revocar. Si el plugin sigue en uso y se quiere mantener, regenerar el client secret y actualizar la configuración en WordPress.
6. **Verificar si el plugin está activo en WordPress**: en el panel de administración de WordPress → Plugins, confirmar si Nextend Social Login está instalado y activo. Si no se usa, desinstalarlo.
7. **Eliminar o mover el archivo local**: `usuario y clave secreta google.txt` debe eliminarse de la carpeta local o moverse a un gestor de contraseñas. No dejarlo en el sistema de archivos sin protección.

#### Cómo validar que quedó resuelto

- La credencial ya no aparece como activa en Google Cloud Console → APIs & Services → Credentials.
- Si se regeneró el secret: la configuración del plugin en WordPress fue actualizada con el nuevo secret y el login con Google funciona correctamente.
- Si el plugin fue desinstalado: ya no aparece en la lista de plugins de WordPress.
- El archivo de texto plano ya no está en `C:\Users\USUARIO\Catenaccio Vintage\Plugins\Nextend Social Login\`.
- Actualizar el estado de SEC-001 en este documento a `RESUELTO` con fecha.

#### Qué NO hacer

- No abrir el archivo `usuario y clave secreta google.txt` para copiar los valores a ningún sistema de archivos del repositorio.
- No copiar el client ID ni el client secret en chats, documentos o commits.
- No eliminar el archivo del proyecto de Google Cloud sin antes verificar que no haya otras aplicaciones dependiendo de esas credenciales.
- No asumir que las credenciales son inválidas solo porque el plugin parezca inactivo — deben revocarse explícitamente.

---

### SEC-002 — WP secret keys de wp-config.php posiblemente expuestas

**Estado:** PENDIENTE DE ACCIÓN  
**Severidad:** Alta  
**Detectado:** 2026-06-06 (discovery inicial, VAL-001; referenciado en tarea #42 del backlog)

#### Qué se sabe

- Según `CONTEXTO_PROYECTO_CATENACCIO.md` (SRC-02, tarea #42), las claves secretas de `wp-config.php` quedaron expuestas en un chat de sesión el **15/03/2026**.
- Las WP secret keys son constantes de configuración en `wp-config.php` que WordPress usa para firmar y cifrar cookies de autenticación y sesiones de usuario (AUTH_KEY, SECURE_AUTH_KEY, LOGGED_IN_KEY, NONCE_KEY y sus equivalentes SALT).
- La tarea #42 estaba pendiente de renovar en el momento del CONTEXTO (15/03/2026). No hay evidencia documentada de que hayan sido renovadas entre el 15/03/2026 y la fecha actual (06/06/2026).
- El CONTEXTO documenta explícitamente en la sección "Cosas que no deben asumirse": **"No asumir que las WP secret keys fueron renovadas"**.
- El sitio está en producción activa con pagos reales procesados (WooPayments, PayPal).

#### Qué no se sabe

- Si las claves fueron renovadas en algún momento entre el 15/03/2026 y hoy.
- En qué plataforma de chat ocurrió la exposición y si ese chat es accesible públicamente o por terceros.
- Si alguien con acceso a ese chat ha utilizado esas claves maliciosamente.
- Las propias claves (este documento no las contiene ni debe contenerlas).

#### Impacto potencial

- Con las WP secret keys comprometidas, un atacante podría **forjar cookies de autenticación de WordPress** para suplantar a cualquier usuario del sitio, incluyendo administradores.
- Acceso al panel de administración de WordPress sin credenciales válidas.
- Acceso al panel de WooCommerce, incluyendo datos de pedidos y clientes.
- Posibilidad de instalar plugins maliciosos o modificar el sitio.
- Si las claves llevan expuestas desde el 15/03/2026 (~83 días a la fecha de este documento), el riesgo acumulado es significativo para un sitio en producción con transacciones reales.

#### Acción manual recomendada

Ejecutar los siguientes pasos:

1. **Generar nuevas WP secret keys**: acceder a la URL oficial de WordPress para generación de claves:  
   `https://api.wordpress.org/secret-key/1.1/salt/`  
   Esta URL genera un bloque completo de 8 constantes listas para copiar en `wp-config.php`.
2. **Acceder al servidor vía cPanel / File Manager de Raiola Networks** (o vía SFTP/SSH).
3. **Localizar `wp-config.php`** en la raíz de la instalación de WordPress.
4. **Reemplazar las 8 constantes** existentes (AUTH_KEY, SECURE_AUTH_KEY, LOGGED_IN_KEY, NONCE_KEY, AUTH_SALT, SECURE_AUTH_KEY_SALT, LOGGED_IN_SALT, NONCE_SALT) con los nuevos valores generados.
5. **Guardar el archivo** — WordPress invalida automáticamente todas las sesiones activas al cambiar las claves. Los usuarios conectados (incluyendo administradores) deberán volver a iniciar sesión.
6. **Verificar el acceso**: iniciar sesión en el panel de administración de WordPress para confirmar que el sitio funciona correctamente con las nuevas claves.

#### Cómo validar que quedó resuelto

- Se puede iniciar sesión normalmente en el panel de administración de WordPress.
- El sitio frontend funciona sin errores 500 o loops de login.
- La fecha de modificación del `wp-config.php` en el servidor es posterior al 15/03/2026 (confirma que fue actualizado).
- Actualizar el estado de SEC-002 en este documento a `RESUELTO` con fecha.

#### Qué NO hacer

- No copiar las nuevas claves a ningún documento, chat, repo ni sistema de archivos del proyecto.
- No copiar las claves antiguas a ningún lugar.
- No modificar `wp-config.php` directamente desde un editor en el repo local — hacerlo directamente en el servidor.
- No saltarse este paso asumiendo que "nadie tiene el chat" — las claves deben rotarse porque estuvieron expuestas, independientemente de si se detectó explotación.
- No asumir que el cambio de contraseña del usuario admin es suficiente — las secret keys son independientes de las contraseñas de usuario.

---

## Resumen de estado

| ID | Riesgo | Severidad | Estado | Acción requerida |
|----|--------|-----------|--------|-----------------|
| SEC-001 | Credenciales OAuth Google (Nextend Social Login) en texto plano | Alta | PENDIENTE | Revocar en Google Cloud Console + eliminar archivo local |
| SEC-002 | WP secret keys de wp-config.php posiblemente expuestas desde 15/03/2026 | Alta | PENDIENTE | Generar nuevas claves en api.wordpress.org y actualizar wp-config.php en servidor |

---

## Confirmación de no-exposición durante este discovery

- El archivo `usuario y clave secreta google.txt` **no fue abierto** durante el discovery.
- Ningún secreto, clave ni credencial fue copiado a este repositorio.
- El conocimiento de los riesgos proviene exclusivamente de los **nombres de archivo y metadatos** registrados en `SOURCE_REGISTRY.md` y las **referencias textuales** del `CONTEXTO_PROYECTO_CATENACCIO.md` (tareas y anotaciones del backlog).
- Este documento no contiene ningún valor de credencial.

---

## Historial

| Fecha | Acción | Por |
|-------|--------|-----|
| 2026-06-06 | Documento creado — riesgos SEC-001 y SEC-002 documentados a partir del discovery inicial | Claude Code (discovery) |
