"""
Session 014-sync helper: cPanel shadow theme sync.

Safety properties:
- Reads cPanel credentials from environment or .env.local without printing values.
- Writes only under public_html/wp-content/themes/catenaccio-a0-child/.
- Never deletes, renames, moves, chmods, or touches active theme files.
- Verifies every uploaded file by SHA256 after reading it back.
"""

from __future__ import annotations

import hashlib
import json
import os
import ssl
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path


EXPECTED = [
    "style.css",
    "functions.php",
    "header.php",
    "footer.php",
    "woocommerce/single-product.php",
    "woocommerce/archive-product.php",
    "woocommerce/content-product.php",
    "assets/css/cv-a0.css",
    "assets/js/cv-a0.js",
]

LOCAL_ROOT = Path("catenaccio-a0-child")
ALLOWED_WRITE_ROOT = "public_html/wp-content/themes/catenaccio-a0-child"
ALLOWED_WRITE_PREFIX = ALLOWED_WRITE_ROOT + "/"


def load_env() -> dict[str, str]:
    env = dict(os.environ)
    env_file = Path(".env.local")
    if not env_file.exists():
        return env

    for raw in env_file.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env.setdefault(key.strip(), value.strip().strip('"').strip("'"))
    return env


ENV = load_env()
BASE_URL = ENV.get("CPANEL_BASE_URL", "").rstrip("/")
CPANEL_USER = ENV.get("CPANEL_USER", "")
CPANEL_API_TOKEN = ENV.get("CPANEL_API_TOKEN", "")
CPANEL_ALLOWED_ROOT = ENV.get("CPANEL_ALLOWED_ROOT", "")


def stop(code: int, message: str) -> None:
    print(message)
    sys.exit(code)


def status_ok(result: object) -> bool:
    if not isinstance(result, dict) or "_error" in result:
        return False
    if result.get("status") == 1 or result.get("result", {}).get("status") == 1:
        return True
    cpanel = result.get("cpanelresult")
    if isinstance(cpanel, dict):
        if cpanel.get("event", {}).get("result") == 1:
            return True
        data = cpanel.get("data")
        if isinstance(data, list) and data and data[0].get("result") == 1:
            return True
    return False


def result_data_list(result: dict) -> list[dict]:
    data = result.get("data")
    if data is None:
        data = result.get("result", {}).get("data")
    return data if isinstance(data, list) else []


def item_name(item: dict) -> str:
    return item.get("file") or item.get("name") or ""


def item_state(items: list[dict]) -> dict[str, dict]:
    state: dict[str, dict] = {}
    for item in items:
        name = item_name(item)
        if name:
            state[name] = {
                "size": item.get("size"),
                "mtime": item.get("mtime") or item.get("modified") or item.get("ctime"),
            }
    return state


def request_json(path: str, params: dict | None = None, *, post: bool = False) -> dict:
    params = params or {}
    url = BASE_URL + path
    data = None
    headers = {
        "Authorization": "cpanel " + CPANEL_USER + ":" + CPANEL_API_TOKEN,
        "Accept": "application/json",
    }
    if post:
        data = urllib.parse.urlencode(params).encode("utf-8")
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    elif params:
        url += "?" + urllib.parse.urlencode(params)

    request = urllib.request.Request(
        url,
        data=data,
        headers=headers,
        method="POST" if post else "GET",
    )
    with urllib.request.urlopen(request, context=SSL_CONTEXT, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def request_multipart(path: str, fields: dict[str, str], file_field: str, filename: str, content: bytes) -> dict:
    boundary = "----codex-cpanel-shadow-sync-boundary"
    body = bytearray()
    for key, value in fields.items():
        body.extend(f"--{boundary}\r\n".encode("ascii"))
        body.extend(f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode("ascii"))
        body.extend(value.encode("utf-8"))
        body.extend(b"\r\n")
    body.extend(f"--{boundary}\r\n".encode("ascii"))
    body.extend(
        (
            f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'
            "Content-Type: application/octet-stream\r\n\r\n"
        ).encode("utf-8")
    )
    body.extend(content)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("ascii"))

    request = urllib.request.Request(
        BASE_URL + path,
        data=bytes(body),
        headers={
            "Authorization": "cpanel " + CPANEL_USER + ":" + CPANEL_API_TOKEN,
            "Accept": "application/json",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, context=SSL_CONTEXT, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def uapi(module: str, func: str, params: dict | None = None, *, post: bool = False) -> dict:
    for attempt in range(3):
        try:
            time.sleep(0.25)
            return request_json(f"/execute/{module}/{func}", params, post=post)
        except Exception as exc:  # deliberately redacted: never include URL or env.
            if attempt == 2:
                return {"_error": f"{type(exc).__name__}: {exc}"}
            time.sleep(1 + attempt)
    return {"_error": "max retries exceeded"}


def upload_file(directory: str, filename: str, content: bytes) -> dict:
    for attempt in range(3):
        try:
            time.sleep(0.25)
            return request_multipart(
                "/execute/Fileman/upload_files",
                {"dir": directory},
                "file-1",
                filename,
                content,
            )
        except Exception as exc:
            if attempt == 2:
                return {"_error": f"{type(exc).__name__}: {exc}"}
            time.sleep(1 + attempt)
    return {"_error": "max retries exceeded"}


def save_file_api2(directory: str, filename: str, content: str) -> dict:
    return api2("Fileman", "savefile", {"dir": directory, "filename": filename, "content": content})


def api2(module: str, func: str, params: dict | None = None) -> dict:
    payload = dict(params or {})
    payload.update(
        {
            "cpanel_jsonapi_user": CPANEL_USER,
            "cpanel_jsonapi_apiversion": "2",
            "cpanel_jsonapi_module": module,
            "cpanel_jsonapi_func": func,
        }
    )
    for attempt in range(3):
        try:
            time.sleep(0.25)
            return request_json("/json-api/cpanel", payload, post=True)
        except Exception as exc:
            if attempt == 2:
                return {"_error": f"{type(exc).__name__}: {exc}"}
            time.sleep(1 + attempt)
    return {"_error": "max retries exceeded"}


def list_dir(path: str) -> list[dict] | dict:
    normalized = path.strip("/").replace("\\", "/")
    if not (
        normalized == "public_html/wp-content/themes"
        or normalized.startswith("public_html/wp-content/themes/")
    ):
        raise RuntimeError("read path outside allowed themes subtree")

    result = uapi("Fileman", "list_files", {"dir": normalized, "include_mime": 1})
    if not status_ok(result):
        return result
    return result_data_list(result)


def read_file(remote_path: str) -> str:
    normalized = remote_path.strip("/").replace("\\", "/")
    if not (
        normalized.startswith(ALLOWED_WRITE_PREFIX)
        or normalized.startswith("public_html/wp-content/themes/hello-elementor-child/")
    ):
        raise RuntimeError("read file outside allowed paths")

    directory, filename = normalized.rsplit("/", 1)
    result = uapi("Fileman", "get_file_content", {"dir": directory, "file": filename})
    if not status_ok(result):
        raise RuntimeError("read failed")
    data = result.get("data") or result.get("result", {}).get("data") or {}
    return data.get("content") or "" if isinstance(data, dict) else ""


def ensure_dir(target: str) -> str:
    normalized = target.strip("/").replace("\\", "/")
    if not (normalized == ALLOWED_WRITE_ROOT or normalized.startswith(ALLOWED_WRITE_PREFIX)):
        raise RuntimeError("mkdir target outside shadow root")

    parent, name = normalized.rsplit("/", 1)
    listing = list_dir(parent)
    if isinstance(listing, list) and name in [item_name(item) for item in listing]:
        return "exists"

    api2("Fileman", "mkdir", {"path": parent, "name": name})
    after = list_dir(parent)
    if isinstance(after, list) and name in [item_name(item) for item in after]:
        return "created"
    return "failed"


def precheck_local_package() -> None:
    local_files = sorted(p.relative_to(LOCAL_ROOT).as_posix() for p in LOCAL_ROOT.rglob("*") if p.is_file())
    if local_files != sorted(EXPECTED):
        print("LOCAL_FILES " + json.dumps(local_files, ensure_ascii=False))
        stop(12, "STOP package_file_mismatch")

    style = (LOCAL_ROOT / "style.css").read_text(encoding="utf-8")
    if "Theme Name: Catenaccio A0 Child" not in style or "Template: hello-elementor" not in style:
        stop(13, "STOP style_header_mismatch")

    patterns = [
        "CPANEL_API_TOKEN",
        "Authorization:",
        "password",
        "passwd",
        "secret",
        "client_secret",
        "access_token",
        "BEGIN RSA",
        "BEGIN PRIVATE KEY",
        "api_key",
    ]
    hits = []
    for rel in EXPECTED:
        text = (LOCAL_ROOT / rel).read_text(encoding="utf-8", errors="replace").lower()
        for pattern in patterns:
            if pattern.lower() in text:
                hits.append((rel, pattern))
    if hits:
        print("SECRET_PATTERN_HITS " + json.dumps(hits, ensure_ascii=False))
        stop(14, "STOP secret_pattern_hit")

    print("LOCAL_PACKAGE_OK files=9 secrets=0 style=OK")


def main() -> int:
    print("ENV_PRESENCE CPANEL_BASE_URL=" + ("PRESENTE" if BASE_URL else "FALTANTE"))
    print("ENV_PRESENCE CPANEL_USER=" + ("PRESENTE" if CPANEL_USER else "FALTANTE"))
    print("ENV_PRESENCE CPANEL_API_TOKEN=" + ("PRESENTE" if CPANEL_API_TOKEN else "FALTANTE"))
    print("ENV_PRESENCE CPANEL_ALLOWED_ROOT=" + ("PRESENTE" if CPANEL_ALLOWED_ROOT else "FALTANTE"))
    if not (BASE_URL and CPANEL_USER and CPANEL_API_TOKEN and CPANEL_ALLOWED_ROOT):
        stop(10, "STOP missing_env")
    if CPANEL_ALLOWED_ROOT.rstrip("/") != "public_html/wp-content":
        stop(11, "STOP allowed_root_unexpected")

    precheck_local_package()

    for path in [
        "public_html/wp-content/themes",
        "public_html/wp-content/themes/hello-elementor-child",
        ALLOWED_WRITE_ROOT,
    ]:
        listed = list_dir(path)
        if isinstance(listed, dict) and not status_ok(listed):
            if path == ALLOWED_WRITE_ROOT:
                print("READ_LIST shadow items=0 exists=NO")
                continue
            label = path.rsplit("/", 1)[-1]
            stop(20, "CPANEL_API_BLOCKED list_failed path_key=" + label)

        assert isinstance(listed, list)
        names = sorted(item_name(item) for item in listed if item_name(item))
        label = "themes" if path.endswith("/themes") else path.rsplit("/", 1)[-1]
        print(f"READ_LIST {label} items={len(listed)} names={','.join(names)}")
        if path.endswith("hello-elementor-child"):
            hello_before = item_state(listed)

    print("CPANEL_API_READY")

    for directory in [
        ALLOWED_WRITE_ROOT,
        ALLOWED_WRITE_ROOT + "/woocommerce",
        ALLOWED_WRITE_ROOT + "/assets",
        ALLOWED_WRITE_ROOT + "/assets/css",
        ALLOWED_WRITE_ROOT + "/assets/js",
    ]:
        result = ensure_dir(directory)
        print(f"MKDIR {directory.replace(ALLOWED_WRITE_ROOT, 'shadow')} {result}")
        if result == "failed":
            stop(30, "FIX_BLOCKER_FIRST mkdir_failed")

    hash_rows = []
    written = []
    for rel in EXPECTED:
        remote_path = ALLOWED_WRITE_PREFIX + rel
        if not remote_path.startswith(ALLOWED_WRITE_PREFIX):
            stop(31, "STOP write_path_outside_shadow")

        local_text = (LOCAL_ROOT / rel).read_text(encoding="utf-8")
        local_hash = hashlib.sha256(local_text.encode("utf-8")).hexdigest()
        directory, filename = remote_path.rsplit("/", 1)
        result = save_file_api2(directory, filename, local_text)
        if not status_ok(result):
            print(
                "SAVE_ERROR "
                + json.dumps(
                    {
                        "keys": sorted(result.keys()) if isinstance(result, dict) else [],
                        "status": result.get("status") if isinstance(result, dict) else None,
                        "errors": result.get("errors") if isinstance(result, dict) else None,
                        "result_status": result.get("result", {}).get("status") if isinstance(result, dict) else None,
                        "result_errors": result.get("result", {}).get("errors") if isinstance(result, dict) else None,
                        "cpanel_event": result.get("cpanelresult", {}).get("event") if isinstance(result, dict) else None,
                        "cpanel_errors": result.get("cpanelresult", {}).get("error") if isinstance(result, dict) else None,
                        "error": result.get("_error") if isinstance(result, dict) else None,
                    },
                    ensure_ascii=False,
                )
            )
            print("WRITTEN_SO_FAR " + json.dumps(written, ensure_ascii=False))
            stop(32, "FIX_BLOCKER_FIRST save_failed file=" + rel)
        written.append(rel)

        remote_text = read_file(remote_path)
        remote_hash = hashlib.sha256(remote_text.encode("utf-8")).hexdigest()
        match = local_hash == remote_hash
        hash_rows.append({"file": rel, "local": local_hash[:12], "remote": remote_hash[:12], "match": match})
        print(f"HASH {rel} local={local_hash[:12]} remote={remote_hash[:12]} match={'YES' if match else 'NO'}")
        if not match:
            stop(33, "FIX_BLOCKER_FIRST hash_mismatch file=" + rel)

    shadow_after = list_dir(ALLOWED_WRITE_ROOT)
    if isinstance(shadow_after, dict) and not status_ok(shadow_after):
        stop(34, "FIX_BLOCKER_FIRST shadow_after_list_failed")
    assert isinstance(shadow_after, list)
    shadow_names = sorted(item_name(item) for item in shadow_after if item_name(item))
    print(f"POST_LIST shadow_root items={len(shadow_after)} names={','.join(shadow_names)}")

    remote_style = read_file(ALLOWED_WRITE_PREFIX + "style.css")
    remote_style_ok = "Theme Name: Catenaccio A0 Child" in remote_style and "Template: hello-elementor" in remote_style
    print("REMOTE_STYLE_HEADER " + ("OK" if remote_style_ok else "FAIL"))
    if not remote_style_ok:
        stop(35, "FIX_BLOCKER_FIRST remote_style_header_mismatch")

    hello_after_list = list_dir("public_html/wp-content/themes/hello-elementor-child")
    if isinstance(hello_after_list, dict) and not status_ok(hello_after_list):
        stop(36, "FIX_BLOCKER_FIRST hello_after_list_failed")
    assert isinstance(hello_after_list, list)
    hello_after = item_state(hello_after_list)

    hello_same_names = sorted(hello_before.keys()) == sorted(hello_after.keys())
    hello_same_size = all(hello_before[key].get("size") == hello_after.get(key, {}).get("size") for key in hello_before)
    hello_same_mtime = all(hello_before[key].get("mtime") == hello_after.get(key, {}).get("mtime") for key in hello_before)
    print(
        "HELLO_BEFORE_AFTER names=%s size=%s mtime=%s"
        % (
            "SAME" if hello_same_names else "DIFF",
            "SAME" if hello_same_size else "DIFF",
            "SAME" if hello_same_mtime else "DIFF",
        )
    )
    if not (hello_same_names and hello_same_size and hello_same_mtime):
        stop(37, "FIX_BLOCKER_FIRST hello_elementor_child_changed_or_unconfirmed")

    Path(".tmp").mkdir(exist_ok=True)
    Path(".tmp/session014_shadow_sync_result.json").write_text(
        json.dumps(
            {
                "verdict": "APPROVE_READY_FOR_VISUAL_VALIDATION_PRE_DOCS",
                "files_uploaded": EXPECTED,
                "hash_rows": hash_rows,
                "hello_before": hello_before,
                "hello_after": hello_after,
                "shadow_root_names": shadow_names,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    print("SYNC_RESULT APPROVE_READY_FOR_VISUAL_VALIDATION_PRE_DOCS files=9 hash=OK")
    return 0


SSL_CONTEXT = ssl.create_default_context()
if ENV.get("CPANEL_ALLOW_INSECURE_TLS", "").strip() == "1":
    SSL_CONTEXT.check_hostname = False
    SSL_CONTEXT.verify_mode = ssl.CERT_NONE
    print("TLS_VERIFY DISABLED_BY_ENV")
else:
    print("TLS_VERIFY DEFAULT")


if __name__ == "__main__":
    raise SystemExit(main())
