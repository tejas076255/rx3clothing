"""RX3 API — Cloudflare Python Worker entry point.

Deploy:  wrangler deploy          (from this backend/ directory)
Local:   wrangler dev             (or use local_server.py for a no-account local run)

Python Workers are beta. The routing/validation logic lives in app.py, the
catalog in catalog.py and the storage layer in db.py (Cloudflare KV in
production, SQLite locally) so the exact same API also runs under
local_server.py. Production uses KV because the account reached the
free-plan limit of 10 D1 databases; db.py retains a D1DB implementation
behind the same interface if storage ever switches back.

Uses the current `workers` SDK style: Response(body, status=..., headers=...)
and Response.json-style payloads (the older js `Response.new(...)` pattern
throws in the SDK runtime and surfaces as error 1101).

Bindings / secrets expected (see wrangler.toml + README):
  KV            — KV namespace binding (rx3-kv) for users / sessions / orders
  ADMIN_EMAIL   — wrangler secret, admin dashboard login (optional)
  ADMIN_PASSWORD— wrangler secret, admin dashboard login (optional)
"""

import json
import traceback
from urllib.parse import parse_qsl, urlparse

from workers import Response, WorkerEntrypoint

from app import handle
from db import KVDB

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
}

_DEFAULT_ADMIN_EMAIL = "admin@rx3clothing.com"
_DEFAULT_ADMIN_PASSWORD = "rx3admin"


def _respond(status, payload):
    if status == 204:
        return Response(None, status=204, headers=CORS_HEADERS)
    return Response(json.dumps(payload), status=status, headers=CORS_HEADERS)


class JsKV:
    """Minimal async adapter over the JS KV namespace binding (env.KV).

    Cloudflare KV binding API: env.KV.get(key) -> Promise<string|null>,
    env.KV.put(key, value) -> Promise<void>, env.KV.delete(key) ->
    Promise<void>. Awaiting a JS promise from Python (Pyodide) yields the
    resolved value, so these wrappers only normalize types for KVDB:
    get() always returns a Python str or None.
    """

    def __init__(self, js_kv):
        self._kv = js_kv

    async def get(self, key):
        value = await self._kv.get(key)
        return None if value is None else str(value)

    async def put(self, key, value):
        await self._kv.put(key, str(value))

    async def delete(self, key):
        await self._kv.delete(key)


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        try:
            url = urlparse(request.url)
            query = dict(parse_qsl(url.query))

            body = None
            if request.method.upper() == "POST":
                try:
                    body = (await request.text()).encode("utf-8")
                except Exception:
                    body = None

            headers = {}
            try:
                authorization = request.headers.get("authorization")
                if authorization:
                    headers["authorization"] = authorization
                content_type = request.headers.get("content-type")
                if content_type:
                    headers["content-type"] = content_type
            except Exception:
                headers = {}

            config = {
                "admin_email": getattr(self.env, "ADMIN_EMAIL", None) or _DEFAULT_ADMIN_EMAIL,
                "admin_password": getattr(self.env, "ADMIN_PASSWORD", None) or _DEFAULT_ADMIN_PASSWORD,
            }
            db = KVDB(JsKV(self.env.KV))

            status, payload = await handle(
                request.method, url.path, query, body, headers, db, config
            )
            return _respond(status, payload)
        except Exception:
            # Surface the real error in the body instead of a bare 1101,
            # so failures are diagnosable from a plain curl.
            return Response("WORKER ERROR:\n" + traceback.format_exc())
