"""Storage layer for RX3 — one async interface, three implementations.

- SqliteDB: local development (stdlib sqlite3). Creates the tables from
  schema.sql on init. Used by local_server.py.
- KVDB: production on Cloudflare Workers — JSON records in a KV namespace
  (see the key layout on the class). The account reached the free-plan limit
  of 10 D1 databases, so no new D1 could be created for this store.
- D1DB: retained, unused by default — wraps a D1 binding (self.env.DB)
  through JS interop, schema in schema.sql. Kept so switching back to D1
  only needs a free database slot plus a worker.py/wrangler.toml change.

SqliteDB/D1DB share the SQL logic in _BaseDB; KVDB implements the same
method contract directly. All rows are returned as plain dicts with the
same keys. Guest orders and admin sessions use user_id 0 instead of NULL
so a value is always bound (avoids None -> undefined conversion surprises
across the Python/JS boundary in the Worker).
"""

import json
import os

_SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

_ORDER_COLUMNS = (
    "order_id, user_id, customer_name, phone, address, items_json, subtotal,"
    " mrp_total, savings, delivery, total, payment_method, payment_id,"
    " payment_status, status, created_at"
)


class _BaseDB:
    """Shared query logic built on three primitives each backend provides:
    _fetchone(sql, params) -> dict|None, _fetchall(sql, params) -> [dict],
    _execute(sql, params) -> last row id (int|None).
    """

    # ---- users ---------------------------------------------------------
    async def create_user(self, name, email, pass_salt, pass_hash, created_at):
        uid = await self._execute(
            "INSERT INTO users (name, email, pass_salt, pass_hash, created_at)"
            " VALUES (?, ?, ?, ?, ?)",
            (name, email, pass_salt, pass_hash, created_at),
        )
        return await self.get_user_by_id(uid)

    async def get_user_by_email(self, email):
        return await self._fetchone(
            "SELECT id, name, email, pass_salt, pass_hash, created_at"
            " FROM users WHERE email = ?",
            (email,),
        )

    async def get_user_by_id(self, user_id):
        if user_id is None:
            return None
        return await self._fetchone(
            "SELECT id, name, email, pass_salt, pass_hash, created_at"
            " FROM users WHERE id = ?",
            (user_id,),
        )

    async def count_users(self):
        row = await self._fetchone("SELECT COUNT(*) AS n FROM users")
        return int(row["n"]) if row else 0

    # ---- sessions ------------------------------------------------------
    async def create_session(self, token, user_id, is_admin, created_at):
        await self._execute(
            "INSERT INTO sessions (token, user_id, is_admin, created_at)"
            " VALUES (?, ?, ?, ?)",
            (token, user_id or 0, 1 if is_admin else 0, created_at),
        )

    async def get_session(self, token):
        if not token:
            return None
        return await self._fetchone(
            "SELECT token, user_id, is_admin, created_at FROM sessions"
            " WHERE token = ?",
            (token,),
        )

    async def delete_session(self, token):
        await self._execute("DELETE FROM sessions WHERE token = ?", (token,))

    # ---- orders --------------------------------------------------------
    async def create_order(self, order):
        await self._execute(
            "INSERT INTO orders (%s) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,"
            " ?, ?, ?, ?, ?)" % _ORDER_COLUMNS,
            (
                order["order_id"],
                order.get("user_id") or 0,
                order["customer_name"],
                order["phone"],
                order["address"],
                order["items_json"],
                order["subtotal"],
                order["mrp_total"],
                order["savings"],
                order["delivery"],
                order["total"],
                order["payment_method"],
                order.get("payment_id") or "",
                order["payment_status"],
                order["status"],
                order["created_at"],
            ),
        )
        return await self.get_order(order["order_id"])

    async def get_order(self, order_id):
        return await self._fetchone(
            "SELECT %s FROM orders WHERE order_id = ?" % _ORDER_COLUMNS,
            (order_id,),
        )

    async def update_order_payment(self, order_id, payment_id, payment_status, status):
        await self._execute(
            "UPDATE orders SET payment_id = ?, payment_status = ?, status = ?"
            " WHERE order_id = ?",
            (payment_id, payment_status, status, order_id),
        )
        return await self.get_order(order_id)

    async def update_order_status(self, order_id, status):
        await self._execute(
            "UPDATE orders SET status = ? WHERE order_id = ?",
            (status, order_id),
        )
        return await self.get_order(order_id)

    async def list_orders(self, limit=100):
        return await self._fetchall(
            "SELECT %s FROM orders ORDER BY created_at DESC, rowid DESC"
            " LIMIT ?" % _ORDER_COLUMNS,
            (int(limit),),
        )

    async def list_orders_for_user(self, user_id):
        return await self._fetchall(
            "SELECT %s FROM orders WHERE user_id = ?"
            " ORDER BY created_at DESC, rowid DESC" % _ORDER_COLUMNS,
            (user_id,),
        )

    async def order_stats(self):
        total = await self._fetchone("SELECT COUNT(*) AS n FROM orders")
        paid = await self._fetchone(
            "SELECT COUNT(*) AS n, COALESCE(SUM(total), 0) AS revenue"
            " FROM orders WHERE payment_status = 'PAID'"
        )
        return {
            "orders": int(total["n"]) if total else 0,
            "paidOrders": int(paid["n"]) if paid else 0,
            "revenue": int(paid["revenue"]) if paid else 0,
        }


class SqliteDB(_BaseDB):
    """Local dev storage backed by a SQLite file (stdlib sqlite3)."""

    def __init__(self, path):
        import sqlite3  # lazy: the Worker never imports sqlite3
        import threading

        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._lock = threading.Lock()
        with open(_SCHEMA_PATH, "r", encoding="utf-8") as fh:
            self._conn.executescript(fh.read())
        self._conn.commit()

    async def _fetchone(self, sql, params=()):
        with self._lock:
            cur = self._conn.execute(sql, tuple(params))
            row = cur.fetchone()
            return dict(row) if row is not None else None

    async def _fetchall(self, sql, params=()):
        with self._lock:
            cur = self._conn.execute(sql, tuple(params))
            return [dict(r) for r in cur.fetchall()]

    async def _execute(self, sql, params=()):
        with self._lock:
            cur = self._conn.execute(sql, tuple(params))
            self._conn.commit()
            return cur.lastrowid


class D1DB(_BaseDB):
    """Production storage: Cloudflare D1 through JS interop (Pyodide).

    D1 API used here:
      stmt = db.prepare(sql); stmt = stmt.bind(*params)
      await stmt.all()  -> { results: [ {col: value, ...}, ... ], meta: {...} }
      await stmt.first() -> {col: value, ...} | null
      await stmt.run()  -> { meta: { last_row_id: ... } }
    JsProxy results are converted to plain Python with .to_py().
    """

    def __init__(self, js_db):
        self._db = js_db

    def _prepare(self, sql, params):
        stmt = self._db.prepare(sql)
        if params:
            stmt = stmt.bind(*params)
        return stmt

    @staticmethod
    def _plain(value):
        if value is None:
            return None
        try:
            return value.to_py()
        except Exception:
            return value

    async def _fetchone(self, sql, params=()):
        row = await self._prepare(sql, params).first()
        row = self._plain(row)
        return dict(row) if row is not None else None

    async def _fetchall(self, sql, params=()):
        res = await self._prepare(sql, params).all()
        rows = self._plain(res.results)
        return [dict(r) for r in rows] if rows else []

    async def _execute(self, sql, params=()):
        res = await self._prepare(sql, params).run()
        try:
            return int(res.meta.last_row_id)
        except Exception:
            return None


class KVDB:
    """Production storage: Cloudflare KV through a minimal async client.

    The client protocol (JsKV in worker.py provides it over the JS binding):
        await kv.get(key)         -> str | None
        await kv.put(key, value)  (value is a str)
        await kv.delete(key)

    Key layout (JSON string values unless noted):
        "user:<email>"       user record (same dict shape as the SQL row)
        "users:index"        JSON list of user emails (drives count_users)
        "meta:next_user_id"  next user id, as a plain integer string
        "session:<token>"    session record {token, user_id, is_admin, created_at}
        "order:<order_id>"   order record (same dict shape as the SQL row)
        "orders:index"       JSON list of order ids, newest first (cap 1000)

    KV is eventually consistent and has no transactions, so the index and
    counter updates are best-effort read-modify-write — fine at this store's
    scale. create_order raises on a duplicate id, mirroring the SQL primary
    key, because app.py's order-id retry loop depends on that signal.
    """

    _INDEX_CAP = 1000

    def __init__(self, kv):
        self._kv = kv

    # ---- raw helpers ------------------------------------------------------
    async def _get_json(self, key):
        raw = await self._kv.get(key)
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except ValueError:
            return None

    async def _put_json(self, key, value):
        await self._kv.put(key, json.dumps(value))

    async def _get_index(self, key):
        index = await self._get_json(key)
        return index if isinstance(index, list) else []

    # ---- users ------------------------------------------------------------
    async def create_user(self, name, email, pass_salt, pass_hash, created_at):
        if await self.get_user_by_email(email) is not None:
            raise ValueError("email already registered: %s" % email)
        raw = await self._kv.get("meta:next_user_id")
        try:
            user_id = int(raw) if raw is not None else 1
        except (TypeError, ValueError):
            user_id = 1
        user = {
            "id": user_id,
            "name": name,
            "email": email,
            "pass_salt": pass_salt,
            "pass_hash": pass_hash,
            "created_at": created_at,
        }
        await self._put_json("user:" + email, user)
        await self._kv.put("meta:next_user_id", str(user_id + 1))
        index = await self._get_index("users:index")
        if email not in index:
            index.append(email)
            await self._put_json("users:index", index)
        return dict(user)

    async def get_user_by_email(self, email):
        if not email:
            return None
        return await self._get_json("user:" + email)

    async def get_user_by_id(self, user_id):
        if user_id is None:
            return None
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return None
        if user_id <= 0:  # 0 is the guest/admin pseudo-user, never a customer
            return None
        for email in await self._get_index("users:index"):
            user = await self.get_user_by_email(email)
            if user is not None and int(user.get("id") or 0) == user_id:
                return user
        return None

    async def count_users(self):
        return len(await self._get_index("users:index"))

    # ---- sessions -----------------------------------------------------------
    async def create_session(self, token, user_id, is_admin, created_at):
        await self._put_json(
            "session:" + token,
            {
                "token": token,
                "user_id": user_id or 0,
                "is_admin": 1 if is_admin else 0,
                "created_at": created_at,
            },
        )

    async def get_session(self, token):
        if not token:
            return None
        return await self._get_json("session:" + token)

    async def delete_session(self, token):
        await self._kv.delete("session:" + token)

    # ---- orders -------------------------------------------------------------
    @staticmethod
    def _order_row(order):
        """Normalize an app.py order dict to the stored row shape."""
        return {
            "order_id": order["order_id"],
            "user_id": order.get("user_id") or 0,
            "customer_name": order["customer_name"],
            "phone": order["phone"],
            "address": order["address"],
            "items_json": order["items_json"],
            "subtotal": order["subtotal"],
            "mrp_total": order["mrp_total"],
            "savings": order["savings"],
            "delivery": order["delivery"],
            "total": order["total"],
            "payment_method": order["payment_method"],
            "payment_id": order.get("payment_id") or "",
            "payment_status": order["payment_status"],
            "status": order["status"],
            "created_at": order["created_at"],
        }

    async def create_order(self, order):
        order_id = order["order_id"]
        if await self.get_order(order_id) is not None:
            raise ValueError("duplicate order_id: %s" % order_id)
        row = self._order_row(order)
        await self._put_json("order:" + order_id, row)
        index = await self._get_index("orders:index")
        index = [order_id] + [oid for oid in index if oid != order_id]
        await self._put_json("orders:index", index[: self._INDEX_CAP])
        return dict(row)

    async def get_order(self, order_id):
        if not order_id:
            return None
        return await self._get_json("order:" + order_id)

    async def update_order_payment(self, order_id, payment_id, payment_status, status):
        row = await self.get_order(order_id)
        if row is None:
            return None
        row["payment_id"] = payment_id
        row["payment_status"] = payment_status
        row["status"] = status
        await self._put_json("order:" + order_id, row)
        return dict(row)

    async def update_order_status(self, order_id, status):
        row = await self.get_order(order_id)
        if row is None:
            return None
        row["status"] = status
        await self._put_json("order:" + order_id, row)
        return dict(row)

    async def list_orders(self, limit=100):
        rows = []
        for order_id in (await self._get_index("orders:index"))[: int(limit)]:
            row = await self.get_order(order_id)
            if row is not None:
                rows.append(row)
        return rows

    async def list_orders_for_user(self, user_id):
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return []
        rows = []
        for order_id in await self._get_index("orders:index"):
            row = await self.get_order(order_id)
            if row is not None and int(row.get("user_id") or 0) == user_id:
                rows.append(row)
        return rows

    async def order_stats(self):
        orders = 0
        paid_orders = 0
        revenue = 0
        for order_id in await self._get_index("orders:index"):
            row = await self.get_order(order_id)
            if row is None:
                continue
            orders += 1
            if row.get("payment_status") == "PAID":
                paid_orders += 1
                revenue += int(row.get("total") or 0)
        return {"orders": orders, "paidOrders": paid_orders, "revenue": revenue}
