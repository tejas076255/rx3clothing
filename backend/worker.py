"""RX3 API — Cloudflare Python Worker entry point.

Deploy:  wrangler deploy          (from this backend/ directory)
Local:   wrangler dev             (or use local_server.py for a no-account local run)

Python Workers are beta. The routing/validation logic lives in app.py and the
catalog in catalog.py so the exact same code also runs under local_server.py.

Uses the current `workers` SDK style: Response(body, status=..., headers=...)
and Response.json-style payloads (the older js `Response.new(...)` pattern
throws in the SDK runtime and surfaces as error 1101).
"""

import json
import traceback
from urllib.parse import parse_qsl, urlparse

from workers import Response, WorkerEntrypoint

from app import handle

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def _respond(status, payload):
    if status == 204:
        return Response(None, status=204, headers=CORS_HEADERS)
    return Response(json.dumps(payload), status=status, headers=CORS_HEADERS)


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

            status, payload = handle(request.method, url.path, query, body)
            return _respond(status, payload)
        except Exception:
            # Surface the real error in the body instead of a bare 1101,
            # so failures are diagnosable from a plain curl.
            return Response("WORKER ERROR:\n" + traceback.format_exc())
