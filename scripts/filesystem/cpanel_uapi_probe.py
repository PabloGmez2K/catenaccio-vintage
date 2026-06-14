"""
cPanel UAPI Filesystem Probe — Catenaccio Vintage
Sesión 010B — READ_ONLY estricto

Usa UAPI Fileman para listar directorios y leer archivos del servidor
sin SSH ni WebDAV. Solo peticiones GET/UAPI read-only.

Endpoints utilizados (todos read-only):
  - Fileman/list_files     — listar contenido de directorio
  - Fileman/get_file_content — leer contenido de archivo

Prohibido en este script:
  save_file_content, upload, mkdir, delete, rename, move,
  copy, chmod, compress, extract, ftp, mysql, database, email, dns
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
import ssl

# ── Credenciales desde entorno (no imprimir) ─────────────────────────────────
CPANEL_BASE_URL = os.environ.get("CPANEL_BASE_URL", "").rstrip("/")
CPANEL_USER = os.environ.get("CPANEL_USER", "")
CPANEL_API_TOKEN = os.environ.get("CPANEL_API_TOKEN", "")
CPANEL_ALLOWED_ROOT = os.environ.get("CPANEL_ALLOWED_ROOT", "public_html/wp-content")

if not all([CPANEL_BASE_URL, CPANEL_USER, CPANEL_API_TOKEN]):
    print("ERROR: faltan variables CPANEL_BASE_URL, CPANEL_USER o CPANEL_API_TOKEN en .env.local")
    sys.exit(1)

# ── TLS — verificación activada por defecto ───────────────────────────────────
# cPanel usa un certificado autofirmado en :2083. Por defecto el script falla
# con CERTIFICATE_VERIFY_FAILED. El operador puede desactivar la verificación
# EXPLÍCITAMENTE poniendo CPANEL_ALLOW_INSECURE_TLS=1 en el entorno (no en
# .env.local por defecto — solo para depuración puntual).
_allow_insecure = os.environ.get("CPANEL_ALLOW_INSECURE_TLS", "").strip() == "1"
if _allow_insecure:
    print("WARNING: insecure TLS verification disabled by explicit operator env var "
          "(CPANEL_ALLOW_INSECURE_TLS=1). Do not use in production flows.", flush=True)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
else:
    ctx = ssl.create_default_context()


def uapi(module: str, func: str, params: dict = None, _retry: int = 2) -> dict:
    """Ejecuta una llamada UAPI read-only. Devuelve el dict de resultado."""
    query = urllib.parse.urlencode(params or {})
    url = f"{CPANEL_BASE_URL}/execute/{module}/{func}"
    if query:
        url += "?" + query
    headers = {
        "Authorization": f"cpanel {CPANEL_USER}:{CPANEL_API_TOKEN}",
        "Accept": "application/json",
    }
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(_retry + 1):
        try:
            time.sleep(0.4)  # evitar rate limiting
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            return {"_error": f"HTTP {e.code}: {e.reason}", "_url": url}
        except Exception as e:
            if attempt < _retry:
                time.sleep(2 + attempt * 2)
                continue
            return {"_error": str(e), "_url": url}
    return {"_error": "max retries exceeded"}


def _assert_within_allowed_root(path: str) -> None:
    """Detiene la ejecución si el path no está dentro de CPANEL_ALLOWED_ROOT."""
    allowed = CPANEL_ALLOWED_ROOT.rstrip("/")
    norm = path.rstrip("/")
    if norm != allowed and not norm.startswith(allowed + "/"):
        print(f"SECURITY STOP: path '{path}' está fuera de CPANEL_ALLOWED_ROOT='{allowed}'. "
              "Ninguna llamada UAPI ejecutada.")
        sys.exit(3)


def list_dir(path: str) -> list:
    """Lista archivos/dirs en un path. Devuelve lista de items o error."""
    _assert_within_allowed_root(path)
    result = uapi("Fileman", "list_files", {"dir": path, "include_mime": 1})
    if "_error" in result:
        return result
    # La UAPI devuelve {"result": {"data": [...], "status": 1}}
    # o {"status": 0, "errors": [...]}
    status = result.get("status", result.get("result", {}).get("status"))
    if status == 0:
        errors = result.get("errors") or result.get("result", {}).get("errors", [])
        return {"_error": f"UAPI status 0 — {errors}"}
    data = result.get("data") or result.get("result", {}).get("data", [])
    return data or []


def read_file(path: str) -> str:
    """Lee contenido de un archivo. Devuelve string o mensaje de error."""
    _assert_within_allowed_root(os.path.dirname(path))
    result = uapi("Fileman", "get_file_content", {
        "dir": os.path.dirname(path),
        "file": os.path.basename(path),
    })
    if "_error" in result:
        return f"[ERROR lectura: {result['_error']}]"
    status = result.get("status", 0)
    if status == 0:
        errors = result.get("errors") or []
        return f"[ERROR UAPI get_file_content: {errors}]"
    # UAPI format: {"status":1, "data":{"content":"..."}}
    data = result.get("data") or {}
    if isinstance(data, dict):
        content = data.get("content", "")
    else:
        content = ""
    if content is None:
        content = ""
    return content


def print_sep(title: str):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print('='*70)


# ── PASO 1: Verificar conectividad básica ────────────────────────────────────
print_sep("PASO 1 — Verificar conectividad UAPI cPanel")
print(f"Base URL: {CPANEL_BASE_URL}")
print(f"Usuario:  {CPANEL_USER}")
print(f"Token:    [REDACTED — longitud {len(CPANEL_API_TOKEN)}]")

# Test con listado del directorio raíz permitido
root_listing = list_dir(CPANEL_ALLOWED_ROOT)
if isinstance(root_listing, dict) and "_error" in root_listing:
    print(f"\n[FALLO] No se puede listar {CPANEL_ALLOWED_ROOT}: {root_listing['_error']}")
    print("\nVeredicto: CPANEL_API_READONLY_BLOCKED")
    sys.exit(2)

print(f"\n[OK] Directorio {CPANEL_ALLOWED_ROOT} listado correctamente.")
print(f"     {len(root_listing)} items encontrados.\n")

items_root = {item.get("file") or item.get("name"): item for item in root_listing}
for name, item in sorted(items_root.items()):
    t = item.get("type", "?")
    size = item.get("size", "")
    print(f"  {'[DIR]' if t == 'dir' else '[FILE]':8s}  {name}  {size}")


# ── PASO 2: Listar plugins ───────────────────────────────────────────────────
print_sep("PASO 2 — Listar directorio plugins/")
plugins_dir = f"{CPANEL_ALLOWED_ROOT}/plugins"
plugins_listing = list_dir(plugins_dir)

if isinstance(plugins_listing, dict) and "_error" in plugins_listing:
    print(f"[ERROR] {plugins_listing['_error']}")
    plugins_listing = []
else:
    print(f"{len(plugins_listing)} plugins/dirs encontrados:\n")
    for item in sorted(plugins_listing, key=lambda x: x.get("file") or x.get("name") or ""):
        name = item.get("file") or item.get("name") or "?"
        t = item.get("type", "?")
        print(f"  {'[DIR]' if t == 'dir' else '[FILE]':8s}  {name}")


# ── PASO 3: Listar child theme ───────────────────────────────────────────────
print_sep("PASO 3 — Listar child theme hello-elementor-child/")
child_dir = f"{CPANEL_ALLOWED_ROOT}/themes/hello-elementor-child"
child_listing = list_dir(child_dir)

if isinstance(child_listing, dict) and "_error" in child_listing:
    print(f"[ERROR] {child_listing['_error']}")
    child_listing = []
else:
    print(f"{len(child_listing)} items en child theme:\n")
    for item in sorted(child_listing, key=lambda x: x.get("file") or x.get("name") or ""):
        name = item.get("file") or item.get("name") or "?"
        t = item.get("type", "?")
        size = item.get("size", "")
        print(f"  {'[DIR]' if t == 'dir' else '[FILE]':8s}  {name}  {size}")


# ── PASO 4: Leer style.css del child theme ──────────────────────────────────
print_sep("PASO 4 — Leer style.css del child theme")
style_path = f"{child_dir}/style.css"
style_content = read_file(style_path)
print(style_content[:3000] if len(style_content) > 3000 else style_content)


# ── PASO 5: Leer functions.php del child theme ──────────────────────────────
print_sep("PASO 5 — Leer functions.php del child theme")
functions_path = f"{child_dir}/functions.php"
functions_content = read_file(functions_path)
print(functions_content[:8000] if len(functions_content) > 8000 else functions_content)


# ── PASO 6: Buscar y listar plugin Filtro Camisetas Pro ─────────────────────
print_sep("PASO 6 — Filtro Camisetas Pro: localizar directorio")
filtro_dir_name = None
FILTRO_CANDIDATES = [
    "filtro-camisetas-pro",
    "filtro-camisetas",
    "filtro_camisetas_pro",
    "filtro_camisetas",
    "camisetas-pro",
]
plugin_names = [item.get("file") or item.get("name") or "" for item in plugins_listing]
for candidate in FILTRO_CANDIDATES:
    if candidate in plugin_names:
        filtro_dir_name = candidate
        break

if not filtro_dir_name:
    # Búsqueda parcial
    for name in plugin_names:
        if "filtro" in name.lower() or "camiseta" in name.lower():
            filtro_dir_name = name
            print(f"Encontrado por búsqueda parcial: {name}")
            break

if filtro_dir_name:
    print(f"Directorio encontrado: {filtro_dir_name}")
    filtro_path = f"{plugins_dir}/{filtro_dir_name}"
    filtro_listing = list_dir(filtro_path)
    print(f"\nContenido de {filtro_dir_name}/:")
    if isinstance(filtro_listing, list):
        for item in sorted(filtro_listing, key=lambda x: x.get("file") or x.get("name") or ""):
            name = item.get("file") or item.get("name") or "?"
            t = item.get("type", "?")
            size = item.get("size", "")
            print(f"  {'[DIR]' if t == 'dir' else '[FILE]':8s}  {name}  {size}")
        # Leer el archivo principal
        print_sep("PASO 6b — Leer archivo principal Filtro Camisetas Pro")
        php_files = [item.get("file") or item.get("name") for item in filtro_listing
                     if (item.get("file") or item.get("name") or "").endswith(".php")]
        main_php = None
        for candidate in [f"{filtro_dir_name}.php", "plugin.php", "index.php", "main.php"]:
            if candidate in php_files:
                main_php = candidate
                break
        if not main_php and php_files:
            main_php = php_files[0]
        if main_php:
            content = read_file(f"{filtro_path}/{main_php}")
            print(f"Archivo: {main_php}\n")
            print(content[:8000] if len(content) > 8000 else content)
        else:
            print("[WARN] No se encontró archivo PHP principal")
    else:
        print(f"[ERROR] {filtro_listing}")
else:
    print("[WARN] No se encontró directorio del plugin Filtro Camisetas Pro")
    print(f"       Plugins disponibles: {plugin_names[:30]}")


# ── PASO 7: Buscar y listar plugin Off-Canvas Menu ──────────────────────────
print_sep("PASO 7 — Off-Canvas Menu: localizar directorio")
offcanvas_dir_name = None
OFFCANVAS_CANDIDATES = [
    "off-canvas-menu",
    "off_canvas_menu",
    "offcanvas-menu",
    "offcanvas_menu",
    "off-canvas",
    "menu-off-canvas",
]
for candidate in OFFCANVAS_CANDIDATES:
    if candidate in plugin_names:
        offcanvas_dir_name = candidate
        break

if not offcanvas_dir_name:
    for name in plugin_names:
        if "canvas" in name.lower() or "offcanvas" in name.lower():
            offcanvas_dir_name = name
            print(f"Encontrado por búsqueda parcial: {name}")
            break

if offcanvas_dir_name:
    print(f"Directorio encontrado: {offcanvas_dir_name}")
    offcanvas_path = f"{plugins_dir}/{offcanvas_dir_name}"
    offcanvas_listing = list_dir(offcanvas_path)
    print(f"\nContenido de {offcanvas_dir_name}/:")
    if isinstance(offcanvas_listing, list):
        for item in sorted(offcanvas_listing, key=lambda x: x.get("file") or x.get("name") or ""):
            name = item.get("file") or item.get("name") or "?"
            t = item.get("type", "?")
            size = item.get("size", "")
            print(f"  {'[DIR]' if t == 'dir' else '[FILE]':8s}  {name}  {size}")
        # Leer el archivo principal
        print_sep("PASO 7b — Leer archivo principal Off-Canvas Menu")
        php_files = [item.get("file") or item.get("name") for item in offcanvas_listing
                     if (item.get("file") or item.get("name") or "").endswith(".php")]
        main_php = None
        for candidate in [f"{offcanvas_dir_name}.php", "plugin.php", "index.php", "main.php"]:
            if candidate in php_files:
                main_php = candidate
                break
        if not main_php and php_files:
            main_php = php_files[0]
        if main_php:
            content = read_file(f"{offcanvas_path}/{main_php}")
            print(f"Archivo: {main_php}\n")
            print(content[:8000] if len(content) > 8000 else content)
        else:
            print("[WARN] No se encontró archivo PHP principal")
    else:
        print(f"[ERROR] {offcanvas_listing}")
else:
    print("[WARN] No se encontró directorio del plugin Off-Canvas Menu")
    print(f"       Plugins disponibles: {plugin_names[:30]}")


# ── PASO 8: Verificar directorio woocommerce/ en child theme ────────────────
print_sep("PASO 8 — Verificar overrides WooCommerce en child theme")
wc_override_dir = f"{child_dir}/woocommerce"
wc_listing = list_dir(wc_override_dir)
if isinstance(wc_listing, dict) and "_error" in wc_listing:
    print(f"[INFO] No existe directorio woocommerce/ en child theme (o no accesible).")
    print(f"       {wc_listing.get('_error', '')}")
else:
    print(f"{len(wc_listing)} items en woocommerce/ override:")
    for item in sorted(wc_listing, key=lambda x: x.get("file") or x.get("name") or ""):
        name = item.get("file") or item.get("name") or "?"
        t = item.get("type", "?")
        print(f"  {'[DIR]' if t == 'dir' else '[FILE]':8s}  {name}")


# ── PASO 9: Listar mu-plugins ─────────────────────────────────────────────────
print_sep("PASO 9 — Listar mu-plugins/")
mu_dir = "public_html/wp-content/mu-plugins"
mu_listing = list_dir(mu_dir)
if isinstance(mu_listing, dict) and "_error" in mu_listing:
    print(f"[INFO] mu-plugins/ no accesible: {mu_listing.get('_error', '')}")
else:
    print(f"{len(mu_listing)} items en mu-plugins/:")
    for item in sorted(mu_listing, key=lambda x: x.get("file") or x.get("name") or ""):
        name = item.get("file") or item.get("name") or "?"
        t = item.get("type", "?")
        print(f"  {'[DIR]' if t == 'dir' else '[FILE]':8s}  {name}")


print_sep("PROBE COMPLETADO")
print("Veredicto: revisar output arriba para determinar CPANEL_API_READONLY_DISCOVERY_COMPLETED")
print("           o CPANEL_API_READONLY_BLOCKED")
