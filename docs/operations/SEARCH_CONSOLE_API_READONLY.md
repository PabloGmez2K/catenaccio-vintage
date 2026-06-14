# SEARCH_CONSOLE_API_READONLY — Catenaccio Vintage

**Proyecto:** Catenaccio Vintage  
**Fecha de validación:** 2026-06-14  
**Sesión:** GSC_API_READONLY_CONNECTOR_CLOSE  
**Estado:** VALIDADO LOCALMENTE — integración operativa en modo read-only  
**Agente:** Claude Code (Sonnet)

---

## 1. VEREDICTO

La integración con Google Search Console API en modo read-only quedó **validada localmente** para Catenaccio Vintage.

- Propiedad detectada: `https://catenacciovintage.com/` | `siteOwner`
- Search Analytics (`searchanalytics.query`) devuelve datos reales: queries, páginas, clicks, impressions, CTR, posición.
- Scope utilizado: `https://www.googleapis.com/auth/webmasters.readonly` (solo lectura, nunca webmasters full).
- Ninguna credencial versionada. `.secrets/` correctamente ignorado.

---

## 2. CONFIGURACIÓN LOCAL

### Estructura de archivos

```
.secrets/google/
  catenaccio_gsc_oauth_client.json   ← OAuth Desktop Client (ignorado por .gitignore)
  catenaccio_gsc_token.json          ← Token generado tras OAuth (ignorado por .gitignore)

.env.local                           ← Variables de entorno locales (ignorado por .gitignore)

scripts/seo/gsc_probe.py             ← Script de prueba (versionado)
requirements-gsc.txt                 ← Dependencias Python (versionado)
```

### Variables de entorno (`.env.local`)

```
GSC_SITE_URL=https://catenacciovintage.com/
```

Opcionales (si se usan rutas no estándar):
```
GSC_CLIENT_SECRET_FILE=/ruta/al/client.json
GSC_TOKEN_FILE=/ruta/al/token.json
```

---

## 3. CÓMO EJECUTAR EL PROBE

```bash
# Activar el entorno virtual
.venv\Scripts\activate          # Windows
# source .venv/bin/activate    # macOS/Linux

# Instalar dependencias (solo la primera vez)
pip install -r requirements-gsc.txt

# Ejecutar el probe
python scripts/seo/gsc_probe.py
```

**Primera ejecución:** abrirá el navegador para completar el flujo OAuth. El token se guarda en `.secrets/google/catenaccio_gsc_token.json` automáticamente.

**Ejecuciones posteriores:** reutiliza el token cacheado (con refresh automático si expiró).

---

## 4. QUÉ DEVUELVE EL PROBE

1. Lista de propiedades disponibles en la cuenta GSC (`sites.list()`).
2. Top 25 filas de Search Analytics para el rango últimos 28 días (sin contar los últimos 3 días):
   - Dimensiones: página + query
   - Campos: clicks, impressions, CTR, posición media

El probe no escribe en ningún sistema externo.

---

## 5. GUARDRAILS DE SEGURIDAD

| Regla | Estado |
|-------|--------|
| `.secrets/` en `.gitignore` | ✅ |
| `**/token*.json` en `.gitignore` | ✅ |
| `**/client_secret*.json` en `.gitignore` | ✅ |
| `**/credentials*.json` en `.gitignore` | ✅ |
| `.env.local` en `.gitignore` | ✅ |
| Scope solo lectura (`webmasters.readonly`) | ✅ |
| Ningún secreto en archivos versionados | ✅ |
| Ningún secreto mostrado en el chat | ✅ |

**Scope prohibido (nunca usar):**  
`https://www.googleapis.com/auth/webmasters` — otorga permisos de escritura sobre Search Console.

---

## 6. ARCHIVOS VERSIONADOS

| Archivo | Contenido | ¿Versionado? |
|---------|-----------|--------------|
| `scripts/seo/gsc_probe.py` | Lógica de conexión y consulta | ✅ Sí |
| `requirements-gsc.txt` | Dependencias Python | ✅ Sí |
| `docs/operations/SEARCH_CONSOLE_API_READONLY.md` | Este documento | ✅ Sí |
| `docs/operations/GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR_PATTERN.md` | Patrón reusable | ✅ Sí |
| `.secrets/google/*.json` | Credenciales OAuth y token | ❌ Nunca |
| `.env.local` | Variables locales | ❌ Nunca |
| `.venv/` | Entorno virtual Python | ❌ Nunca |

---

## 7. PRÓXIMOS USOS POSIBLES

Este conector en modo read-only habilita:

- **Análisis de queries de entrada** — qué buscan los usuarios que llegan a Catenaccio.
- **Identificación de páginas con alto impresión / baja posición** — oportunidades SEO inmediatas.
- **Seguimiento de posición por producto** — entradas tipo `/equipo/liverpool/` o producto individual.
- **Alimentar datos SEO a Catenaccio Studio** — en una iteración futura, Studio podría mostrar posición/impresiones de cada producto.

No es parte del alcance inmediato de A0 ni B1, pero está disponible cuando se necesite.

---

## 8. REFERENCIA AL PATRÓN REUSABLE

Ver [GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR_PATTERN.md](GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR_PATTERN.md) para el patrón completo reutilizable en otros proyectos (especialmente Bijuymoda Suite).

El patrón está registrado como candidato para transferencia a lafabrica como conector estándar:  
`LAFABRICA_TRANSFER_GSC_CONNECTOR_PATTERN`
