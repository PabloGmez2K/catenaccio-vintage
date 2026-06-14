# GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR — Patrón reusable

**Origen:** Catenaccio Vintage — validado 2026-06-14  
**Candidato a transferencia a lafabrica:** `LAFABRICA_TRANSFER_GSC_CONNECTOR_PATTERN`  
**Proyectos objetivo:** Bijuymoda Suite, cualquier proyecto lafabrica con presencia web en GSC  
**Scope:** `https://www.googleapis.com/auth/webmasters.readonly` (nunca full)

---

## 1. QUÉ ES ESTE PATRÓN

Conector de solo lectura a la Google Search Console API para cualquier proyecto lafabrica que tenga una propiedad verificada en GSC. Permite consultar:

- Propiedades disponibles en la cuenta (`sites.list`)
- Search Analytics: queries, páginas, clicks, impressions, CTR, posición (`searchanalytics.query`)

El patrón incluye: configuración de Google Cloud, OAuth Desktop, script Python, estructura de archivos ignorados, y checklist de seguridad.

**No incluye:** escritura en GSC, indexing API, sitemaps via API, permisos de administración.

---

## 2. PASOS PARA REPETIR EN UN PROYECTO NUEVO

### Paso 1 — Crear proyecto en Google Cloud

1. Ir a [console.cloud.google.com](https://console.cloud.google.com).
2. Crear un proyecto nuevo con nombre descriptivo (ej. `bijuymoda-search-console`).
3. Seleccionar el proyecto recién creado.

### Paso 2 — Habilitar la Search Console API

1. Menú → APIs y servicios → Biblioteca.
2. Buscar "Google Search Console API".
3. Clic en Habilitar.

### Paso 3 — Configurar OAuth Consent Screen

1. Menú → APIs y servicios → Pantalla de consentimiento de OAuth.
2. Tipo de usuario: **Externo** (salvo que tengas Google Workspace).
3. Estado: **En prueba** (Testing) — no hace falta publicar para uso personal/interno.
4. Completar: nombre de la app, email de soporte, email del desarrollador.
5. Scopes: añadir `https://www.googleapis.com/auth/webmasters.readonly`.
6. Usuarios de prueba: añadir el email de Google que tiene acceso a GSC.

> En estado "En prueba", el token de refresh expira en 7 días. Para uso continuo, considera pasar a producción o re-autenticar cada semana.

### Paso 4 — Crear OAuth Client (Desktop)

1. Menú → APIs y servicios → Credenciales.
2. Clic en "Crear credenciales" → "ID de cliente de OAuth".
3. Tipo: **Aplicación de escritorio** (Desktop app).
4. Nombre: algo como `<proyecto>-desktop-local`.
5. Descargar el JSON generado.

### Paso 5 — Guardar el JSON en el repo (carpeta ignorada)

```
.secrets/google/
  <proyecto>_gsc_oauth_client.json   ← JSON descargado en el paso anterior
```

Verificar que `.secrets/` está en `.gitignore` antes de guardar:
```
.secrets/
**/credentials*.json
**/client_secret*.json
**/token*.json
```

### Paso 6 — Configurar `.env.local`

Añadir al `.env.local` del proyecto (ignorado por `.gitignore`):

```
GSC_SITE_URL=https://tu-dominio.com/
```

La URL debe ser **exactamente la propiedad registrada en Search Console**, incluyendo trailing slash si la propiedad la tiene. Si no sabes cuál es exactamente, ejecutar el probe sin `GSC_SITE_URL` — listará todas las propiedades disponibles.

### Paso 7 — Copiar el script y las dependencias

```
scripts/seo/gsc_probe.py
requirements-gsc.txt
```

Ajustar en `gsc_probe.py` las rutas de los archivos secret si el nombre del proyecto es diferente:

```python
CLIENT_FILE = Path(
    os.getenv(
        "GSC_CLIENT_SECRET_FILE",
        SECRETS_DIR / "<proyecto>_gsc_oauth_client.json",  # ← cambiar aquí
    )
)
```

O bien definir `GSC_CLIENT_SECRET_FILE` en `.env.local` para no tocar el script.

### Paso 8 — Instalar dependencias y ejecutar

```bash
# Crear entorno virtual
python -m venv .venv

# Activar
.venv\Scripts\activate          # Windows
# source .venv/bin/activate    # macOS/Linux

# Instalar
pip install -r requirements-gsc.txt

# Primera ejecución — abrirá el navegador para OAuth
python scripts/seo/gsc_probe.py
```

La primera ejecución abrirá el navegador. Completar el flujo OAuth con la cuenta de Google que tiene acceso a la propiedad en Search Console. El token se guarda en `.secrets/google/` automáticamente.

### Paso 9 — Verificar la propiedad detectada

El probe listará las propiedades disponibles:

```
Propiedades disponibles en Search Console:
- https://tu-dominio.com/ | siteOwner
```

Copiar la URL exacta mostrada y usarla como `GSC_SITE_URL` en `.env.local`.

### Paso 10 — Confirmar datos reales

Si todo está correcto, verás algo como:

```
Consultando Search Analytics para: https://tu-dominio.com/
Rango: 2026-05-14 -> 2026-06-11

Top resultados:
- clicks=X | imp=Y | ctr=Z% | pos=W | query | página
```

---

## 3. ESTRUCTURA DE ARCHIVOS ESPERADA

```
proyecto/
├── .secrets/google/                         ← ignorado por .gitignore
│   ├── <proyecto>_gsc_oauth_client.json     ← OAuth Desktop Client
│   └── <proyecto>_gsc_token.json            ← Token (generado en primera ejecución)
├── .env.local                               ← ignorado por .gitignore
│   └── GSC_SITE_URL=https://...
├── .venv/                                   ← ignorado por .gitignore
├── scripts/
│   └── seo/
│       └── gsc_probe.py                     ← versionado
└── requirements-gsc.txt                     ← versionado
```

---

## 4. CHECKLIST DE SEGURIDAD

Verificar antes de cualquier commit:

```bash
git status --short --ignored
```

Resultado esperado:
- `.env.local` → `!!` (ignorado)
- `.secrets/` → `!!` (ignorado)
- `.venv/` → `!!` (ignorado)
- `scripts/seo/gsc_probe.py` → puede ser `??` o limpio (nunca `M` con secretos)
- `requirements-gsc.txt` → puede ser `??` o limpio

Buscar señales de secretos en archivos versionables antes de commit:
```bash
grep -r "client_secret\|refresh_token\|access_token\|client_id" scripts/ requirements-gsc.txt
```
Si hay resultados, NO commitear.

---

## 5. SCOPE PERMITIDO Y PROHIBIDO

| Scope | Estado | Para qué |
|-------|--------|----------|
| `webmasters.readonly` | ✅ PERMITIDO | Leer propiedades y search analytics |
| `webmasters` | ❌ PROHIBIDO | Escribe en Search Console — nunca usar |
| `indexing` | Fuera de alcance | Solicitar indexación — no parte de este patrón |

---

## 6. VARIABLES DE ENTORNO DISPONIBLES

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `GSC_SITE_URL` | Sí (para analytics) | URL exacta de la propiedad en GSC |
| `GSC_CLIENT_SECRET_FILE` | No | Override de ruta al OAuth client JSON |
| `GSC_TOKEN_FILE` | No | Override de ruta al token JSON |

---

## 7. VALIDADO EN

| Proyecto | Fecha | Propiedad | Datos reales |
|----------|-------|-----------|--------------|
| Catenaccio Vintage | 2026-06-14 | `https://catenacciovintage.com/` | ✅ |

---

## 8. CANDIDATO A TRANSFERENCIA A LAFABRICA

**Nombre del conector:** `GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR`  
**Estado:** candidato — validado en 1 proyecto  
**Prerequisito para activar transferencia:** validar en Bijuymoda Suite o un segundo proyecto  
**Tarea de transferencia en Catenaccio:** `LAFABRICA_TRANSFER_GSC_CONNECTOR_PATTERN` (ver BACKLOG.md → LATER)

Una vez validado en un segundo proyecto, el conector puede empaquetarse como asset reutilizable en lafabrica, con:
- `scripts/seo/gsc_probe.py` como plantilla
- `requirements-gsc.txt` como dependencias base
- Este documento como guía de instalación
- Sección `.gitignore` recomendada como snippet

---

## 9. PARA BIJUYMODA SUITE — INSTRUCCIONES ESPECÍFICAS

Al repetir este patrón en Bijuymoda Suite:

1. Crear proyecto Google Cloud **separado** (no reutilizar el de Catenaccio).
2. Activar Search Console API en el nuevo proyecto.
3. OAuth Consent Screen en Testing (mismo flujo que Catenaccio).
4. OAuth Client Desktop — descargar JSON.
5. Guardar como `.secrets/google/bijuymoda_gsc_oauth_client.json`.
6. Verificar que `.secrets/` está en el `.gitignore` del repo de Bijuymoda.
7. Añadir a `.env.local`: `GSC_SITE_URL=<URL exacta de la propiedad en GSC>`.
8. Ejecutar `sites.list()` primero para confirmar la URL exacta.
9. Copiar la propiedad devuelta a `GSC_SITE_URL` (incluir trailing slash si aparece).
10. Ejecutar `searchanalytics.query` para confirmar datos reales.
11. Versionar solo: script, docs, requirements. Nunca `.secrets/`, `.env.local`, token ni venv.
