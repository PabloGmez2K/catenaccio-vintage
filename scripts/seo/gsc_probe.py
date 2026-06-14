from __future__ import annotations

import os
from datetime import date, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

ROOT = Path(__file__).resolve().parents[2]
SECRETS_DIR = ROOT / ".secrets" / "google"
ENV_LOCAL = ROOT / ".env.local"

CLIENT_FILE = Path(
    os.getenv(
        "GSC_CLIENT_SECRET_FILE",
        SECRETS_DIR / "catenaccio_gsc_oauth_client.json",
    )
)

TOKEN_FILE = Path(
    os.getenv(
        "GSC_TOKEN_FILE",
        SECRETS_DIR / "catenaccio_gsc_token.json",
    )
)


def load_env_local(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        os.environ.setdefault(key, value)


def get_credentials() -> Credentials:
    creds = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())

    if not creds or not creds.valid:
        if not CLIENT_FILE.exists():
            raise FileNotFoundError(
                f"No existe el OAuth client JSON: {CLIENT_FILE}\n"
                "Descárgalo desde Google Cloud y guárdalo en .secrets/google/."
            )

        flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_FILE), SCOPES)
        creds = flow.run_local_server(port=0)

    TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")

    return creds


def main() -> None:
    load_env_local(ENV_LOCAL)

    site_url = os.getenv("GSC_SITE_URL", "").strip()

    creds = get_credentials()
    service = build("searchconsole", "v1", credentials=creds)

    print("\nPropiedades disponibles en Search Console:")
    sites = service.sites().list().execute()
    site_entries = sites.get("siteEntry", [])

    for entry in site_entries:
        print(f"- {entry.get('siteUrl')} | {entry.get('permissionLevel')}")

    if not site_url:
        print("\nNo se ha definido GSC_SITE_URL.")
        print("Añade a .env.local una línea como:")
        print("GSC_SITE_URL=https://catenacciovintage.com/")
        return

    end = date.today() - timedelta(days=3)
    start = end - timedelta(days=28)

    body = {
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
        "dimensions": ["page", "query"],
        "type": "web",
        "rowLimit": 25,
    }

    print(f"\nConsultando Search Analytics para: {site_url}")
    print(f"Rango: {start.isoformat()} -> {end.isoformat()}")

    response = service.searchanalytics().query(siteUrl=site_url, body=body).execute()
    rows = response.get("rows", [])

    if not rows:
        print("\nSin datos para esa propiedad/rango.")
        return

    print("\nTop resultados:")
    for row in rows:
        keys = row.get("keys", [])
        page = keys[0] if len(keys) > 0 else ""
        query = keys[1] if len(keys) > 1 else ""

        print(
            f"- clicks={row.get('clicks', 0):.0f} | "
            f"imp={row.get('impressions', 0):.0f} | "
            f"ctr={row.get('ctr', 0):.2%} | "
            f"pos={row.get('position', 0):.1f} | "
            f"{query} | {page}"
        )


if __name__ == "__main__":
    main()