"""
webdav_probe.py — Catenaccio Vintage
Session 010A: SERVER_FILESYSTEM_READONLY_DISCOVERY

Permitted methods: PROPFIND, GET, HEAD only.
Prohibited: PUT, POST, DELETE, MOVE, COPY, MKCOL, PROPPATCH, LOCK, UNLOCK.

Reads credentials from .env.local (never printed, never committed).
"""

from __future__ import annotations

import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urljoin, urlparse, quote, unquote

import requests
from requests.auth import HTTPBasicAuth

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parents[2]
ENV_LOCAL = ROOT / ".env.local"

FORBIDDEN_PATHS = {
    "wp-config.php",
    "backups",
    "backup",
    ".sql",
    "mail",
    "tmp",
    "logs",
    ".log",
    "error_log",
}

# Files we actively want to read (relative to wp-content root)
TARGET_FILES = [
    "themes/hello-elementor-child/style.css",
    "themes/hello-elementor-child/functions.php",
    "themes/hello-elementor-child/header.php",
    "themes/hello-elementor-child/footer.php",
]

# Directories to list (relative to wp-content root)
TARGET_DIRS = [
    "",  # wp-content root itself
    "themes/hello-elementor-child",
    "themes/hello-elementor",
    "plugins",
    "mu-plugins",
    "uploads/elementor",
    "uploads/elementor/css",
]

# Plugin names/prefixes to look for
PLUGIN_KEYWORDS = [
    "filtro",
    "camisetas",
    "off-canvas",
    "offcanvas",
    "catenaccio",
    "cv-",
    "buscador",
    "ajax",
    "filtro-camisetas",
]

# ---------------------------------------------------------------------------
# Load .env.local
# ---------------------------------------------------------------------------

def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        print(f"[ERROR] .env.local not found at {path}", file=sys.stderr)
        sys.exit(1)
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


# ---------------------------------------------------------------------------
# WebDAV client (read-only)
# ---------------------------------------------------------------------------

PROPFIND_BODY = """<?xml version="1.0" encoding="utf-8"?>
<propfind xmlns="DAV:">
  <prop>
    <resourcetype/>
    <getcontentlength/>
    <getlastmodified/>
    <displayname/>
    <getcontenttype/>
  </prop>
</propfind>"""


class WebDAVClient:
    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip("/")
        self.auth = HTTPBasicAuth(username, password)
        self.session = requests.Session()
        self.session.auth = self.auth
        self.session.verify = True
        self.session.headers.update({"User-Agent": "catenaccio-readonly-probe/010A"})

    def _url(self, path: str) -> str:
        """Build full URL for a path relative to base_url."""
        if not path or path == "/":
            return self.base_url + "/"
        # Encode each segment but preserve slashes
        parts = path.strip("/").split("/")
        encoded = "/".join(quote(p, safe="") for p in parts)
        return self.base_url + "/" + encoded + ("/" if not "." in parts[-1] else "")

    def head(self, path: str = "") -> requests.Response:
        return self.session.head(self._url(path), timeout=15)

    def propfind(self, path: str = "", depth: int = 1) -> requests.Response:
        url = self._url(path)
        return self.session.request(
            "PROPFIND",
            url,
            data=PROPFIND_BODY,
            headers={
                "Depth": str(depth),
                "Content-Type": "application/xml; charset=utf-8",
            },
            timeout=20,
        )

    def get(self, path: str, max_bytes: int = 131072) -> tuple[int, str]:
        """GET a file, capped at max_bytes. Returns (status_code, content_str)."""
        url = self._url(path)
        try:
            resp = self.session.get(url, timeout=20, stream=True)
            if resp.status_code == 200:
                chunks = []
                total = 0
                for chunk in resp.iter_content(chunk_size=4096):
                    chunks.append(chunk)
                    total += len(chunk)
                    if total >= max_bytes:
                        break
                raw = b"".join(chunks)[:max_bytes]
                return resp.status_code, raw.decode("utf-8", errors="replace")
            return resp.status_code, ""
        except Exception as e:
            return -1, str(e)


# ---------------------------------------------------------------------------
# PROPFIND XML parser
# ---------------------------------------------------------------------------

NS = {"d": "DAV:"}


def parse_propfind(xml_text: str, base_url: str) -> list[dict]:
    """Parse a PROPFIND response and return list of resource dicts."""
    results = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError as e:
        return [{"error": str(e), "raw": xml_text[:200]}]

    for response in root.findall("d:response", NS):
        href_el = response.find("d:href", NS)
        href = href_el.text.strip() if href_el is not None else ""

        propstat = response.find("d:propstat", NS)
        if propstat is None:
            continue
        status_el = propstat.find("d:status", NS)
        status = status_el.text if status_el is not None else ""
        if "200" not in status:
            continue

        prop = propstat.find("d:prop", NS)
        if prop is None:
            continue

        rt = prop.find("d:resourcetype", NS)
        is_dir = rt is not None and rt.find("d:collection", NS) is not None

        size_el = prop.find("d:getcontentlength", NS)
        size = int(size_el.text) if size_el is not None and size_el.text else 0

        mtime_el = prop.find("d:getlastmodified", NS)
        mtime = mtime_el.text if mtime_el is not None else ""

        ctype_el = prop.find("d:getcontenttype", NS)
        ctype = ctype_el.text if ctype_el is not None else ""

        # Derive relative name from href
        parsed = urlparse(base_url)
        base_path = parsed.path.rstrip("/")
        href_path = urlparse(href).path
        rel = href_path.replace(base_path, "").strip("/")
        name = unquote(rel.split("/")[-1]) if rel else ""

        results.append(
            {
                "href": href,
                "name": name,
                "rel": unquote(rel),
                "is_dir": is_dir,
                "size": size,
                "mtime": mtime,
                "ctype": ctype,
            }
        )
    return results


# ---------------------------------------------------------------------------
# Safety checks
# ---------------------------------------------------------------------------

def is_forbidden(path: str) -> bool:
    low = path.lower()
    return any(kw in low for kw in FORBIDDEN_PATHS)


# ---------------------------------------------------------------------------
# Discovery routines
# ---------------------------------------------------------------------------

def probe_connection(client: WebDAVClient) -> dict:
    print("\n[1] Testing connection (HEAD)...")
    resp = client.head()
    print(f"    HEAD {client.base_url}/ → {resp.status_code}")
    return {"method": "HEAD", "url": client.base_url, "status": resp.status_code, "headers": dict(resp.headers)}


def probe_propfind_root(client: WebDAVClient) -> dict:
    print("\n[2] PROPFIND root (Depth: 0)...")
    resp = client.propfind("", depth=0)
    print(f"    PROPFIND / depth=0 → {resp.status_code}")
    if resp.status_code in (207,):
        items = parse_propfind(resp.text, client.base_url)
        return {"status": resp.status_code, "items": items}
    return {"status": resp.status_code, "error": resp.text[:300]}


def list_directory(client: WebDAVClient, path: str) -> list[dict]:
    if is_forbidden(path):
        print(f"    [SKIP — forbidden path] {path}")
        return []
    print(f"\n  PROPFIND {path or '/'} (Depth: 1)...")
    resp = client.propfind(path, depth=1)
    print(f"    → {resp.status_code}")
    if resp.status_code == 207:
        items = parse_propfind(resp.text, client.base_url)
        # Exclude self (first item is always the directory itself)
        children = [i for i in items if i.get("rel", "").strip("/") != path.strip("/")]
        for item in children:
            kind = "DIR " if item["is_dir"] else "FILE"
            size_str = f" ({item['size']} B)" if not item["is_dir"] and item["size"] else ""
            print(f"    {kind}  {item['name']}{size_str}")
        return children
    elif resp.status_code == 404:
        print(f"    [NOT FOUND]")
        return []
    elif resp.status_code in (401, 403):
        print(f"    [ACCESS DENIED — {resp.status_code}]")
        return []
    else:
        print(f"    [UNEXPECTED {resp.status_code}]")
        return []


def read_file(client: WebDAVClient, path: str, max_bytes: int = 65536) -> dict:
    if is_forbidden(path):
        return {"path": path, "status": "SKIPPED", "reason": "forbidden"}
    print(f"\n  GET {path}...")
    status, content = client.get(path, max_bytes=max_bytes)
    print(f"    → {status} ({len(content)} chars)")
    return {"path": path, "status": status, "content": content, "truncated": len(content) >= max_bytes}


def find_custom_plugins(plugin_listing: list[dict]) -> list[dict]:
    """Identify likely custom plugins from the listing."""
    custom = []
    for item in plugin_listing:
        if not item.get("is_dir"):
            continue
        name_lower = item["name"].lower()
        if any(kw in name_lower for kw in PLUGIN_KEYWORDS):
            custom.append(item)
    return custom


def get_plugin_main_file(client: WebDAVClient, plugin_dir: str) -> dict | None:
    """Try to read the main plugin file (plugin-name/plugin-name.php or plugin-name/index.php)."""
    dir_name = plugin_dir.split("/")[-1]
    candidates = [
        f"{plugin_dir}/{dir_name}.php",
        f"{plugin_dir}/index.php",
        f"{plugin_dir}/plugin.php",
        f"{plugin_dir}/main.php",
    ]
    for candidate in candidates:
        status, content = client.get(candidate, max_bytes=32768)
        if status == 200 and content:
            return {"path": candidate, "status": status, "content": content}
    return None


# ---------------------------------------------------------------------------
# Analysis helpers
# ---------------------------------------------------------------------------

def extract_php_plugin_header(content: str) -> dict:
    """Extract WordPress plugin header comments."""
    headers = {}
    for line in content.split("\n")[:30]:
        for key in ["Plugin Name", "Version", "Description", "Author", "Plugin URI"]:
            if line.strip().startswith(f" * {key}:") or line.strip().startswith(f"* {key}:"):
                val = line.split(":", 1)[-1].strip()
                headers[key] = val
    return headers


def extract_shortcodes(content: str) -> list[str]:
    """Find add_shortcode calls."""
    import re
    return re.findall(r"add_shortcode\s*\(\s*['\"]([^'\"]+)['\"]", content)


def extract_hooks(content: str) -> list[str]:
    """Find add_action / add_filter calls."""
    import re
    actions = re.findall(r"add_action\s*\(\s*['\"]([^'\"]+)['\"]", content)
    filters = re.findall(r"add_filter\s*\(\s*['\"]([^'\"]+)['\"]", content)
    return sorted(set(actions + filters))


def extract_ajax_endpoints(content: str) -> list[str]:
    """Find wp_ajax_ hooks."""
    import re
    return re.findall(r"add_action\s*\(\s*['\"]wp_ajax(?:_nopriv)?_([^'\"]+)['\"]", content)


def extract_rest_endpoints(content: str) -> list[str]:
    """Find register_rest_route calls."""
    import re
    return re.findall(r"register_rest_route\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]", content)


def extract_elementor_deps(content: str) -> list[str]:
    """Find Elementor widget/extension references."""
    import re
    deps = []
    if "elementor" in content.lower():
        deps.append("Elementor referenced")
    if "Plugin::instance()" in content or "\\Elementor\\" in content:
        deps.append("Elementor API used")
    widgets = re.findall(r"register_widget_type\s*\(\s*new\s+(\w+)", content)
    deps.extend([f"Widget: {w}" for w in widgets])
    return deps


def extract_woo_deps(content: str) -> list[str]:
    """Find WooCommerce hooks/functions."""
    import re
    deps = []
    woo_hooks = re.findall(r"add_(?:action|filter)\s*\(\s*['\"](?:woocommerce|wc)_([^'\"]+)['\"]", content)
    if woo_hooks:
        deps.extend([f"woocommerce_{h}" for h in woo_hooks[:10]])
    if "WC()" in content or "WC_Product" in content or "wc_get_product" in content:
        deps.append("WC functions used")
    return deps


def extract_acf_deps(content: str) -> list[str]:
    """Find ACF function calls."""
    deps = []
    for fn in ["get_field", "update_field", "acf_add_options_page", "get_sub_field", "the_field"]:
        if fn in content:
            deps.append(f"{fn}()")
    return deps


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("Catenaccio Vintage — WebDAV READ-ONLY PROBE")
    print("Session 010A: SERVER_FILESYSTEM_READONLY_DISCOVERY")
    print("Permitted: PROPFIND, GET, HEAD")
    print("=" * 60)

    env = load_env(ENV_LOCAL)

    webdav_url = env.get("CV_WEBDAV_URL", "").rstrip("/")
    webdav_user = env.get("CV_WEBDAV_USER", "")
    webdav_password = env.get("CV_WEBDAV_PASSWORD", "")
    webdav_base = env.get("CV_WEBDAV_BASE", "")
    allowed_root = env.get("CV_WEBDAV_ALLOWED_ROOT", "")

    if not webdav_url or not webdav_user or not webdav_password:
        print("[ERROR] Missing CV_WEBDAV_URL, CV_WEBDAV_USER or CV_WEBDAV_PASSWORD in .env.local")
        sys.exit(1)

    print(f"\nWebDAV URL: {webdav_url}")
    print(f"WebDAV User: {webdav_user}")
    print(f"Allowed root: {allowed_root}")
    print(f"Base path hint: {webdav_base}")
    print("[Credentials loaded — not printed]")

    client = WebDAVClient(webdav_url, webdav_user, webdav_password)

    # -----------------------------------------------------------------------
    # Phase 1: Connection
    # -----------------------------------------------------------------------
    conn = probe_connection(client)
    if conn["status"] not in (200, 207):
        print(f"\n[BLOCKED] Connection failed: HTTP {conn['status']}")
        print("Possible causes: wrong URL, wrong port, credentials error, server down.")
        print("\nStatus: BLOCKED_WEBDAV_CONNECTION")
        return

    # -----------------------------------------------------------------------
    # Phase 2: PROPFIND root
    # -----------------------------------------------------------------------
    root_pf = probe_propfind_root(client)

    # -----------------------------------------------------------------------
    # Phase 3: Directory listings
    # -----------------------------------------------------------------------
    print("\n[3] Directory listings...")
    listings: dict[str, list[dict]] = {}
    for d in TARGET_DIRS:
        listings[d] = list_directory(client, d)

    # -----------------------------------------------------------------------
    # Phase 4: Plugin analysis
    # -----------------------------------------------------------------------
    print("\n[4] Analyzing plugins...")
    all_plugins = listings.get("plugins", [])
    custom_plugins = find_custom_plugins(all_plugins)
    print(f"    Total plugin dirs: {len([p for p in all_plugins if p.get('is_dir')])}")
    print(f"    Custom/keyword match: {len(custom_plugins)} → {[p['name'] for p in custom_plugins]}")

    mu_plugins = listings.get("mu-plugins", [])

    # -----------------------------------------------------------------------
    # Phase 5: Read child theme files
    # -----------------------------------------------------------------------
    print("\n[5] Reading child theme files...")
    child_theme_files: dict[str, dict] = {}
    # First list the child theme to know what's there
    child_listing = listings.get("themes/hello-elementor-child", [])

    for tf in TARGET_FILES:
        child_theme_files[tf] = read_file(client, tf)

    # Also look for woocommerce override dir
    woo_override_listing = list_directory(client, "themes/hello-elementor-child/woocommerce")
    # And shortcodes/inc dirs
    for subdir in ["inc", "includes", "shortcodes", "templates"]:
        subpath = f"themes/hello-elementor-child/{subdir}"
        sub_result = list_directory(client, subpath)
        if sub_result:
            listings[subpath] = sub_result

    # -----------------------------------------------------------------------
    # Phase 6: Read custom plugin files
    # -----------------------------------------------------------------------
    print("\n[6] Reading custom plugin files...")
    plugin_data: dict[str, dict] = {}
    for plugin in custom_plugins:
        plugin_path = f"plugins/{plugin['name']}"
        plugin_listing = list_directory(client, plugin_path)
        main_file = get_plugin_main_file(client, plugin_path)
        plugin_data[plugin["name"]] = {
            "listing": plugin_listing,
            "main_file": main_file,
        }

    # Also try to read all-in-one plugin mains if listing is small
    if len(all_plugins) < 40:
        for p in all_plugins:
            if p.get("is_dir") and p["name"] not in plugin_data:
                # Quick check: just list (don't read all files)
                pass  # Already have listing from earlier

    # -----------------------------------------------------------------------
    # Phase 7: Elementor CSS/uploads check
    # -----------------------------------------------------------------------
    print("\n[7] Checking Elementor uploads/CSS...")
    elementor_css = listings.get("uploads/elementor/css", [])
    elementor_dir = listings.get("uploads/elementor", [])

    # -----------------------------------------------------------------------
    # Phase 8: Read-only verification note
    # -----------------------------------------------------------------------
    # Per protocol: we do NOT attempt a write. cPanel Web Disk configured as
    # read-only is the authoritative source. We note it as assumed.
    readonly_status = "READ_ONLY_ASSUMED_BY_CPANEL_CONFIG — not verified by write attempt (prohibited by protocol)"

    # -----------------------------------------------------------------------
    # Analysis
    # -----------------------------------------------------------------------
    print("\n[8] Analysing collected data...")

    # --- Child theme analysis ---
    functions_php = child_theme_files.get("themes/hello-elementor-child/functions.php", {})
    style_css = child_theme_files.get("themes/hello-elementor-child/style.css", {})
    fp_content = functions_php.get("content", "") if functions_php.get("status") == 200 else ""
    sc_content = style_css.get("content", "") if style_css.get("status") == 200 else ""

    child_shortcodes = extract_shortcodes(fp_content)
    child_hooks = extract_hooks(fp_content)[:30]
    child_ajax = extract_ajax_endpoints(fp_content)
    child_rest = extract_rest_endpoints(fp_content)
    child_elementor = extract_elementor_deps(fp_content)
    child_woo = extract_woo_deps(fp_content)
    child_acf = extract_acf_deps(fp_content)

    has_url_rewrites = any(k in fp_content for k in ["flush_rewrite", "add_rewrite_rule", "rewrite", "transient"])
    has_cdncache = any(k in fp_content for k in ["quic_cloud", "lscwp", "LiteSpeed", "cache_flush", "cdn_", "CDN"])
    has_opcache = "opcache" in fp_content.lower()

    # --- Plugin analysis ---
    plugin_summaries: list[dict] = []
    for plugin_name, pdata in plugin_data.items():
        main = pdata.get("main_file")
        if main and main.get("content"):
            c = main["content"]
            header = extract_php_plugin_header(c)
            plugin_summaries.append({
                "name": plugin_name,
                "header": header,
                "shortcodes": extract_shortcodes(c),
                "ajax": extract_ajax_endpoints(c),
                "rest": extract_rest_endpoints(c),
                "elementor": extract_elementor_deps(c),
                "woo": extract_woo_deps(c),
                "acf": extract_acf_deps(c),
                "hooks_count": len(extract_hooks(c)),
                "file": main["path"],
            })
        else:
            plugin_summaries.append({
                "name": plugin_name,
                "header": {},
                "shortcodes": [],
                "ajax": [],
                "rest": [],
                "elementor": [],
                "woo": [],
                "acf": [],
                "hooks_count": 0,
                "file": "NOT_FOUND",
            })

    # -----------------------------------------------------------------------
    # Output collection (for doc generation)
    # -----------------------------------------------------------------------
    return {
        "conn": conn,
        "root_pf": root_pf,
        "listings": listings,
        "child_listing": child_listing,
        "woo_override_listing": woo_override_listing,
        "child_theme_files": child_theme_files,
        "fp_content": fp_content,
        "sc_content": sc_content,
        "child_shortcodes": child_shortcodes,
        "child_hooks": child_hooks,
        "child_ajax": child_ajax,
        "child_rest": child_rest,
        "child_elementor": child_elementor,
        "child_woo": child_woo,
        "child_acf": child_acf,
        "has_url_rewrites": has_url_rewrites,
        "has_cdncache": has_cdncache,
        "has_opcache": has_opcache,
        "all_plugins": all_plugins,
        "custom_plugins": custom_plugins,
        "mu_plugins": mu_plugins,
        "plugin_data": plugin_data,
        "plugin_summaries": plugin_summaries,
        "elementor_css": elementor_css,
        "elementor_dir": elementor_dir,
        "readonly_status": readonly_status,
        "allowed_root": allowed_root,
        "webdav_url": webdav_url,
    }


if __name__ == "__main__":
    result = main()
    if result is None:
        sys.exit(1)

    print("\n" + "=" * 60)
    print("PROBE COMPLETE — printing summary")
    print("=" * 60)

    print(f"\n[CONNECTION] HTTP {result['conn']['status']}")
    print(f"[READ_ONLY]  {result['readonly_status']}")

    print(f"\n[CHILD THEME — hello-elementor-child]")
    print(f"  Files in dir: {len(result['child_listing'])}")
    print(f"  functions.php: {'OK' if result['fp_content'] else 'NOT READ'} ({len(result['fp_content'])} chars)")
    print(f"  style.css: {'OK' if result['sc_content'] else 'NOT READ'}")
    print(f"  Shortcodes: {result['child_shortcodes']}")
    print(f"  AJAX endpoints: {result['child_ajax']}")
    print(f"  WooCommerce hooks: {result['child_woo']}")
    print(f"  Elementor deps: {result['child_elementor']}")
    print(f"  ACF deps: {result['child_acf']}")
    print(f"  URL rewrite logic: {result['has_url_rewrites']}")
    print(f"  CDN/cache logic: {result['has_cdncache']}")
    print(f"  WooCommerce overrides dir: {len(result['woo_override_listing'])} files")

    print(f"\n[PLUGINS]")
    print(f"  Total plugin dirs: {len([p for p in result['all_plugins'] if p.get('is_dir')])}")
    print(f"  Custom plugins found: {[p['name'] for p in result['custom_plugins']]}")
    for ps in result['plugin_summaries']:
        print(f"\n  Plugin: {ps['name']}")
        if ps['header']:
            print(f"    Name: {ps['header'].get('Plugin Name', '?')}")
            print(f"    Version: {ps['header'].get('Version', '?')}")
        print(f"    Shortcodes: {ps['shortcodes']}")
        print(f"    AJAX: {ps['ajax']}")
        print(f"    WooCommerce: {ps['woo']}")
        print(f"    Elementor: {ps['elementor']}")
        print(f"    ACF: {ps['acf']}")

    print(f"\n[MU-PLUGINS]")
    print(f"  Items: {[p['name'] for p in result['mu_plugins']]}")

    print(f"\n[ELEMENTOR UPLOADS]")
    css_files = [f['name'] for f in result['elementor_css'] if not f.get('is_dir')]
    print(f"  CSS files: {len(css_files)} (first 5: {css_files[:5]})")

    print("\n" + "=" * 60)
    print("END OF PROBE OUTPUT")
    print("=" * 60)
