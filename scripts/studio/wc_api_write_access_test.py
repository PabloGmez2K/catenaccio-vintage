#!/usr/bin/env python3
"""Controlled WooCommerce API write access test for Catenaccio Studio.

This script intentionally prints only presence/status signals. It never prints
environment variable values, Authorization headers, base64 payloads, cookies, or
raw credential-bearing exceptions.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


REQUIRED_ENV = ("WP_SITE_URL", "WP_APP_USER", "WP_APP_PASSWORD")
EXPECTED_USER = "catenaccio-studio-agent"
TEST_NAME = "[STUDIO TEST] Catenaccio Bridge Draft - DELETE ME"
META_KEYS = {
    "liga",
    "equipo",
    "ano_temporada",
    "talla",
    "condicion",
    "jugador",
    "descripcion_del_producto",
}


class StopTest(Exception):
    def __init__(self, verdict: str, message: str, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.verdict = verdict
        self.message = message
        self.details = details or {}


def load_env_local(path: Path) -> None:
    if not path.exists():
        raise StopTest("STOP_CREDENTIALS_MISSING", ".env.local: MISSING")

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        os.environ.setdefault(key, value)


def env_presence() -> dict[str, str]:
    return {key: ("PRESENT" if os.environ.get(key) else "MISSING") for key in REQUIRED_ENV}


def require_env() -> None:
    missing = [key for key, state in env_presence().items() if state != "PRESENT"]
    if missing:
        raise StopTest(
            "STOP_CREDENTIALS_MISSING",
            "Required environment variable missing.",
            {"missing": missing},
        )


def sanitize(value: str) -> str:
    redacted = value
    for key in REQUIRED_ENV:
        secret = os.environ.get(key)
        if secret:
            redacted = redacted.replace(secret, "[REDACTED]")
    if "Authorization" in redacted or "Basic " in redacted:
        redacted = "[REDACTED_AUTH_ERROR]"
    return redacted[:500]


def site_url() -> str:
    return os.environ["WP_SITE_URL"].rstrip("/")


def auth_header() -> str:
    raw = f"{os.environ['WP_APP_USER']}:{os.environ['WP_APP_PASSWORD']}".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("ascii")


def request_json(
    method: str,
    path: str,
    payload: dict[str, Any] | None = None,
    expected: set[int] | None = None,
) -> tuple[int, Any]:
    expected = expected or {200}
    url = site_url() + path
    data = None
    headers = {
        "Authorization": auth_header(),
        "Accept": "application/json",
        "User-Agent": "catenaccio-studio-write-access-test/1.0",
    }
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            status = response.getcode()
            body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        status = exc.code
        body = exc.read().decode("utf-8", errors="replace")
    except (urllib.error.URLError, TimeoutError) as exc:
        raise StopTest("FIX_BLOCKER_FIRST", f"Network error: {sanitize(str(exc))}")

    parsed: Any
    try:
        parsed = json.loads(body) if body else None
    except json.JSONDecodeError:
        parsed = {"raw": sanitize(body)}

    if status not in expected:
        code = parsed.get("code") if isinstance(parsed, dict) else None
        msg = parsed.get("message") if isinstance(parsed, dict) else None
        if status == 401:
            verdict = "STOP_CREDENTIALS_INVALID"
        elif status == 403:
            verdict = "STOP_CREDENTIALS_INSUFFICIENT_PERMISSIONS"
        else:
            verdict = "FIX_BLOCKER_FIRST"
        raise StopTest(
            verdict,
            f"HTTP {status}: {sanitize(str(code or 'unknown'))}: {sanitize(str(msg or 'no message'))}",
            {"http_status": status, "error_code": sanitize(str(code or ""))},
        )

    return status, parsed


def print_env_presence() -> None:
    states = env_presence()
    for key in REQUIRED_ENV:
        print(f"{key}: {states[key]}")


def precheck_auth() -> dict[str, Any]:
    print("READ_ONLY_AUTH_ENDPOINT: GET /wp-json/wp/v2/users/me?context=edit")
    status, user = request_json("GET", "/wp-json/wp/v2/users/me?context=edit", expected={200})
    slug = user.get("slug") or user.get("username") or user.get("name") if isinstance(user, dict) else None
    roles = user.get("roles", []) if isinstance(user, dict) else []
    capabilities = user.get("capabilities", {}) if isinstance(user, dict) else {}
    manage_wc = bool(capabilities.get("manage_woocommerce")) if isinstance(capabilities, dict) else False

    if slug != EXPECTED_USER:
        raise StopTest(
            "STOP_CREDENTIALS_INSUFFICIENT_PERMISSIONS",
            "Authenticated user is not the expected studio agent.",
            {"username": slug or "UNKNOWN"},
        )
    if "shop_manager" not in roles and not manage_wc:
        raise StopTest(
            "STOP_CREDENTIALS_INSUFFICIENT_PERMISSIONS",
            "Authenticated user lacks expected WooCommerce permissions.",
            {"username": slug, "roles": roles},
        )

    print(f"AUTH_RESULT: HTTP {status} VALID username={slug} role=shop_manager")
    return {"endpoint": "GET /wp-json/wp/v2/users/me?context=edit", "username": slug, "roles": roles}


def terms_by_id(attribute_id: int, query: str = "") -> dict[int, dict[str, Any]]:
    path = f"/wp-json/wc/v3/products/attributes/{attribute_id}/terms"
    if query:
        path += f"?{query}"
    status, terms = request_json("GET", path, expected={200})
    if not isinstance(terms, list):
        raise StopTest("STOP_TERM_IDS_MISMATCH", f"Terms endpoint returned non-list for {attribute_id}.")
    print(f"TERMS_ENDPOINT: GET /attributes/{attribute_id}/terms -> HTTP {status}")
    return {int(term["id"]): term for term in terms if isinstance(term, dict) and "id" in term}


def validate_term_ids() -> dict[str, Any]:
    status, attrs = request_json("GET", "/wp-json/wc/v3/products/attributes", expected={200})
    if not isinstance(attrs, list):
        raise StopTest("STOP_TERM_IDS_MISMATCH", "Attributes endpoint returned non-list.")
    print(f"ATTRIBUTES_ENDPOINT: GET /attributes -> HTTP {status}")
    attrs_by_id = {int(attr["id"]): attr for attr in attrs if isinstance(attr, dict) and "id" in attr}

    expected_attrs = {
        5: "pa_liga",
        4: "pa_equipo",
        7: "pa_ano",
    }
    missing_attrs = []
    for attr_id, expected_slug in expected_attrs.items():
        attr = attrs_by_id.get(attr_id)
        slug = attr.get("slug") if isinstance(attr, dict) else None
        if slug != expected_slug:
            missing_attrs.append({"id": attr_id, "expected": expected_slug, "actual": slug or "MISSING"})
    if missing_attrs:
        raise StopTest("STOP_TERM_IDS_MISMATCH", "Attribute IDs do not match expected slugs.", {"attributes": missing_attrs})

    liga_terms = terms_by_id(5)
    equipo_terms = terms_by_id(4, "per_page=100")
    ano_terms = terms_by_id(7, "per_page=100")

    liga_value = "72" if 72 in liga_terms else ""
    if 129 not in equipo_terms or 139 not in ano_terms:
        raise StopTest(
            "STOP_TERM_IDS_MISMATCH",
            "Required team or season term ID missing.",
            {
                "equipo_129": "PRESENT" if 129 in equipo_terms else "MISSING",
                "ano_139": "PRESENT" if 139 in ano_terms else "MISSING",
            },
        )

    print(f"TERM_ID pa_liga id=5: PRESENT; LaLiga=72: {'PRESENT' if liga_value == '72' else 'MISSING'}")
    print("TERM_ID pa_equipo id=4: PRESENT; Francia=129: PRESENT")
    print("TERM_ID pa_ano id=7: PRESENT; 2014-15=139: PRESENT")
    print(f"PAYLOAD_FINAL_LIGA: {liga_value!r}")
    return {"liga": liga_value, "equipo": "129", "ano_temporada": "139"}


def build_payload(term_values: dict[str, str]) -> dict[str, Any]:
    return {
        "name": TEST_NAME,
        "type": "simple",
        "status": "draft",
        "regular_price": "1",
        "description": (
            "<p>[STUDIO TEST] Este producto es una prueba de integracion del puente "
            "Catenaccio Studio -> WooCommerce. Fue creado automaticamente en la sesion "
            "WC_API_WRITE_ACCESS_TEST. BORRAR despues de verificar. No publicar.</p>"
        ),
        "short_description": "",
        "stock_status": "instock",
        "manage_stock": False,
        "meta_data": [
            {"key": "liga", "value": term_values["liga"]},
            {"key": "equipo", "value": term_values["equipo"]},
            {"key": "ano_temporada", "value": term_values["ano_temporada"]},
            {"key": "talla", "value": "L"},
            {"key": "condicion", "value": "Excelente"},
            {"key": "jugador", "value": ""},
            {"key": "descripcion_del_producto", "value": "<p>[STUDIO TEST] Prueba de integracion. BORRAR.</p>"},
        ],
    }


def existing_test_drafts() -> list[dict[str, Any]]:
    query = urllib.parse.urlencode({"search": "[STUDIO TEST]", "status": "draft", "per_page": 10})
    _status, products = request_json("GET", f"/wp-json/wc/v3/products?{query}", expected={200})
    if not isinstance(products, list):
        return []
    return [
        product
        for product in products
        if isinstance(product, dict)
        and str(product.get("name", "")).startswith("[STUDIO TEST]")
        and product.get("status") == "draft"
    ]


def validate_product_response(product: dict[str, Any], expected_http: int) -> dict[str, Any]:
    product_id = product.get("id")
    status = product.get("status")
    name = product.get("name", "")
    regular_price = product.get("regular_price")
    meta_data = product.get("meta_data", [])
    if not isinstance(product_id, int) or product_id <= 0:
        raise StopTest("FIX_BLOCKER_FIRST", "Product response did not include a positive integer ID.")
    if status != "draft":
        raise StopTest("STOP_CRITICAL", f"Product status is not draft: {sanitize(str(status))}", {"product_id": product_id})
    if not str(name).startswith("[STUDIO TEST]"):
        raise StopTest("FIX_BLOCKER_FIRST", "Product name does not start with [STUDIO TEST].", {"product_id": product_id})
    if regular_price != "1":
        raise StopTest("FIX_BLOCKER_FIRST", "Product regular_price mismatch.", {"product_id": product_id})
    found_meta = {entry.get("key"): entry.get("value") for entry in meta_data if isinstance(entry, dict)}
    missing_meta = sorted(META_KEYS - set(found_meta))
    if missing_meta:
        raise StopTest("FIX_BLOCKER_FIRST", "Product meta_data missing required keys.", {"product_id": product_id, "missing_meta": missing_meta})
    print(f"HTTP_STATUS: {expected_http}")
    print(f"PRODUCT_ID: {product_id}")
    print("PRODUCT_STATUS: draft")
    print("META_DATA_CHECK: PASS")
    return {"product_id": product_id, "status": status, "meta_keys": sorted(found_meta)}


def execute_write(term_values: dict[str, str]) -> dict[str, Any]:
    existing = existing_test_drafts()
    if existing:
        ids = [product.get("id") for product in existing]
        raise StopTest("FIX_BLOCKER_FIRST", "Existing [STUDIO TEST] draft detected; refusing to create a duplicate.", {"existing_ids": ids})

    payload = build_payload(term_values)
    if payload["status"] != "draft":
        raise StopTest("STOP_CRITICAL", "Internal payload status is not draft.")

    print("POST_EXECUTED: YES")
    status, product = request_json("POST", "/wp-json/wc/v3/products", payload=payload, expected={201})
    if not isinstance(product, dict):
        raise StopTest("FIX_BLOCKER_FIRST", "POST response was not a JSON object.")
    result = validate_product_response(product, status)

    product_id = result["product_id"]
    get_status, fetched = request_json("GET", f"/wp-json/wc/v3/products/{product_id}", expected={200})
    if not isinstance(fetched, dict):
        raise StopTest("FIX_BLOCKER_FIRST", "GET product response was not a JSON object.", {"product_id": product_id})
    validate_product_response(fetched, get_status)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Catenaccio WC API write access test.")
    parser.add_argument("--precheck-only", action="store_true", help="Stop after credential and term read-only checks.")
    args = parser.parse_args()

    try:
        load_env_local(Path(".env.local"))
        print_env_presence()
        require_env()
        auth = precheck_auth()
        terms = validate_term_ids()
        if args.precheck_only:
            print("POST_EXECUTED: NO")
            print("VERDICT: PRECHECK_READONLY_PASSED")
            return 0
        result = execute_write(terms)
        print("VISIBLE_PUBLIC: NO_BY_API_STATUS_DRAFT")
        print("PABLO_VERIFICATION: PENDING")
        print("CLEANUP: PENDING_MANUAL")
        print("VERDICT: APPROVE_WC_API_WRITE_ACCESS_TEST_PASSED_API_SIDE")
        print(
            "PABLO_ACTION: Verifica en WP Admin -> Productos -> Borradores; "
            f"producto ID {result['product_id']}; despues elimina manualmente el producto test."
        )
        _ = auth
        return 0
    except StopTest as exc:
        print(f"POST_EXECUTED: {'NO' if exc.verdict.startswith('STOP_CREDENTIALS') or exc.verdict == 'STOP_TERM_IDS_MISMATCH' else 'UNKNOWN'}")
        print(f"VERDICT: {exc.verdict}")
        print(f"ERROR: {sanitize(exc.message)}")
        if exc.details:
            print("DETAILS: " + json.dumps(exc.details, ensure_ascii=False, sort_keys=True))
        return 2


if __name__ == "__main__":
    sys.exit(main())
