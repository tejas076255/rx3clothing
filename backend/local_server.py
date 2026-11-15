"""RX3 API — local development server (Python standard library only, no pip installs).

Run:  python3 local_server.py            # serves on http://localhost:8787
      PORT=9000 python3 local_server.py  # custom port

Serves the exact same API as the Cloudflare Python Worker (worker.py) by
delegating to app.handle(). Storage is a local SQLite file (rx3-local.db,
auto-created from schema.sql); on Cloudflare the same code uses D1.
Admin login defaults to admin@rx3clothing.com / rx3admin and can be
overridden with the ADMIN_EMAIL / ADMIN_PASSWORD environment variables.
"""

import asyncio
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qsl, urlparse

from app import handle
from db import SqliteDB

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = SqliteDB(os.path.join(BASE_DIR, "rx3-local.db"))
CONFIG = {
    "admin_email": os.environ.get("ADMIN_EMAIL", "admin@rx3clothing.com"),
    "admin_password": os.environ.get("ADMIN_PASSWORD", "rx3admin"),
}

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _dispatch(self, method):
        parsed = urlparse(self.path)
        query = dict(parse_qsl(parsed.query))
        headers = {key.lower(): value for key, value in self.headers.items()}
        body = None
        length = int(self.headers.get("Content-Length") or 0)
        if length:
            body = self.rfile.read(length)
        status, payload = asyncio.run(
            handle(method, parsed.path, query, body, headers, DB, CONFIG)
        )

        data = b"" if status == 204 else json.dumps(payload).encode("utf-8")
        self.send_response(status)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        if data:
            self.wfile.write(data)

    def do_GET(self):
        self._dispatch("GET")

    def do_POST(self):
        self._dispatch("POST")

    def do_OPTIONS(self):
        self._dispatch("OPTIONS")

    def log_message(self, fmt, *args):  # keep the console tidy but visible
        print("[api] %s" % (fmt % args))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8787"))
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print("RX3 API listening on http://localhost:%d" % port)
    server.serve_forever()
