"""Shared API logic for RX3 — used by both the Cloudflare Python Worker (worker.py)
and the local development server (local_server.py).

handle(method, path, query, body, headers, db, config) -> (status_code, response_dict)
  method:  "GET" / "POST" / "OPTIONS" ...
  path:    "/api/products" (no query string)
  query:   dict of str -> str (already parsed)
  body:    bytes or None (raw request body)
  headers: dict with lowercase keys (we read "authorization")
  db:      a db.py storage instance (SqliteDB locally, D1DB on Cloudflare)
  config:  {"admin_email": ..., "admin_password": ...}
"""

import hashlib
import hmac
import json
import random
import re
import secrets
import time
from datetime import datetime, timezone

from catalog import PRODUCTS, get_product, list_products

ORDER_STATUSES = ("PLACED", "SHIPPED", "DELIVERED", "CANCELLED")
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _err(status, message):
    return status, {"ok": False, "error": message}


def _now():
    return datetime.now(timezone.utc).isoformat()


def _parse_body(body):
    """Returns (payload_dict, error_response)."""
    try:
        payload = json.loads(
            body.decode("utf-8") if isinstance(body, (bytes, bytearray)) else body or "{}"
        )
    except (ValueError, UnicodeDecodeError):
        return None, _err(400, "Request body must be valid JSON.")
    if not isinstance(payload, dict):
        return None, _err(400, "Request body must be a JSON object.")
    return payload, None


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def _hash_password(password, salt_hex):
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), 100_000
    ).hex()


def _bearer_token(headers):
    raw = (headers or {}).get("authorization") or ""
    if raw.lower().startswith("bearer "):
        return raw[7:].strip()
    return None


async def _session(headers, db):
    token = _bearer_token(headers)
    if not token:
        return None, None
    session = await db.get_session(token)
    return token, session


async def _current_user(headers, db):
    """(user_dict|None, session|None) for a valid customer session."""
    _token, session = await _session(headers, db)
    if not session or session.get("is_admin"):
        return None, session
    user = await db.get_user_by_id(session.get("user_id"))
    return user, session


def _public_user(user):
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


async def _new_session(db, user_id, is_admin=False):
    token = secrets.token_urlsafe(32)
    await db.create_session(token, user_id, is_admin, _now())
    return token


async def _require_admin(headers, db):
    """Returns an error response tuple, or None when the caller is an admin."""
    _token, session = await _session(headers, db)
    if not session:
        return _err(401, "Admin login required.")
    if not session.get("is_admin"):
        return _err(403, "Admin access only.")
    return None


# ---------------------------------------------------------------------------
# Order validation (unchanged pricing rules) + serialization
# ---------------------------------------------------------------------------

def _validate_order(payload):
    """Returns (clean_order_dict, error_message)."""
    if not isinstance(payload, dict):
        return None, "Request body must be a JSON object."

    customer = payload.get("customer") or {}
    name = str(customer.get("name", "")).strip()
    phone = str(customer.get("phone", "")).strip()
    address = str(customer.get("address", "")).strip()
    payment = str(payload.get("payment", "COD")).strip().upper()
    if not name:
        return None, "Customer name is required."
    if len(phone) < 10 or not phone.replace("+", "").replace(" ", "").isdigit():
        return None, "A valid phone number (10+ digits) is required."
    if not address:
        return None, "Delivery address is required."
    if payment not in ("COD", "UPI", "CARD"):
        return None, "Payment must be COD, UPI or CARD."

    items = payload.get("items")
    if not isinstance(items, list) or not items:
        return None, "Order must contain at least one item."

    clean_items = []
    total = 0
    mrp_total = 0
    for raw in items:
        if not isinstance(raw, dict):
            return None, "Each item must be an object."
        product = get_product(raw.get("id"))
        if product is None:
            return None, "Unknown product id: %s" % raw.get("id")
        qty = raw.get("qty", 1)
        if not isinstance(qty, int) or qty < 1 or qty > 10:
            return None, "Quantity for '%s' must be between 1 and 10." % product["name"]
        size = str(raw.get("size", "")).strip()
        if size and size not in product["sizes"]:
            return None, "Size '%s' is not available for '%s'." % (size, product["name"])
        clean_items.append(
            {
                "id": product["id"],
                "name": product["name"],
                "size": size or product["sizes"][0],
                "qty": qty,
                "price": product["price"],
            }
        )
        total += product["price"] * qty
        mrp_total += product["mrp"] * qty

    delivery = 0 if total >= 999 else 49
    order = {
        "customer": {"name": name, "phone": phone, "address": address},
        "payment": payment,
        "items": clean_items,
        "subtotal": total,
        "mrpTotal": mrp_total,
        "savings": mrp_total - total,
        "delivery": delivery,
        "total": total + delivery,
    }
    return order, None


def _serialize_order(row):
    """DB row -> API order shape (keeps the original frontend fields)."""
    try:
        items = json.loads(row.get("items_json") or "[]")
    except ValueError:
        items = []
    return {
        "orderId": row["order_id"],
        "userId": row.get("user_id") or None,
        "customer": {
            "name": row.get("customer_name"),
            "phone": row.get("phone"),
            "address": row.get("address"),
        },
        "payment": row.get("payment_method"),
        "paymentId": row.get("payment_id") or None,
        "paymentStatus": row.get("payment_status"),
        "items": items,
        "subtotal": row.get("subtotal"),
        "mrpTotal": row.get("mrp_total"),
        "savings": row.get("savings"),
        "delivery": row.get("delivery"),
        "total": row.get("total"),
        "status": row.get("status"),
        "createdAt": row.get("created_at"),
    }


def _new_order_id():
    return "RX3%d%04d" % (int(time.time()) % 100000000, random.randint(0, 9999))


# ---------------------------------------------------------------------------
# Main router
# ---------------------------------------------------------------------------

async def handle(method, path, query, body, headers, db, config):
    method = (method or "GET").upper()
    path = (path or "/").rstrip("/") or "/"
    query = query or {}
    headers = headers or {}
    config = config or {}

    if method == "OPTIONS":
        return 204, {}

    # ---- public catalog -------------------------------------------------
    if path == "/api/health" and method == "GET":
        return 200, {"ok": True, "service": "rx3-api", "products": len(PRODUCTS)}

    if path == "/api/products" and method == "GET":
        items = list_products(
            category=query.get("category"),
            search=query.get("search"),
            sort=query.get("sort"),
        )
        return 200, {"ok": True, "count": len(items), "products": items}

    if path.startswith("/api/products/") and method == "GET":
        tail = path[len("/api/products/"):]
        try:
            product_id = int(tail)
        except ValueError:
            return _err(400, "Product id must be a number.")
        product = get_product(product_id)
        if product is None:
            return _err(404, "Product not found.")
        return 200, {"ok": True, "product": product}

    # ---- customer auth --------------------------------------------------
    if path == "/api/auth/signup" and method == "POST":
        payload, error = _parse_body(body)
        if error:
            return error
        name = str(payload.get("name", "")).strip()
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        if not name:
            return _err(400, "Name is required.")
        if not _EMAIL_RE.match(email):
            return _err(400, "A valid email address is required.")
        if len(password) < 6:
            return _err(400, "Password must be at least 6 characters.")
        if await db.get_user_by_email(email) is not None:
            return _err(400, "An account with this email already exists. Please log in.")
        salt = secrets.token_hex(16)
        user = await db.create_user(name, email, salt, _hash_password(password, salt), _now())
        token = await _new_session(db, user["id"])
        return 201, {"ok": True, "token": token, "user": _public_user(user)}

    if path == "/api/auth/login" and method == "POST":
        payload, error = _parse_body(body)
        if error:
            return error
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        user = await db.get_user_by_email(email)
        if user is None or not hmac.compare_digest(
            _hash_password(password, user["pass_salt"]), user["pass_hash"]
        ):
            return _err(401, "Invalid email or password.")
        token = await _new_session(db, user["id"])
        return 200, {"ok": True, "token": token, "user": _public_user(user)}

    if path == "/api/auth/me" and method == "GET":
        user, _session_row = await _current_user(headers, db)
        if user is None:
            return _err(401, "Not logged in.")
        return 200, {"ok": True, "user": _public_user(user)}

    if path == "/api/auth/logout" and method == "POST":
        token = _bearer_token(headers)
        if token:
            await db.delete_session(token)
        return 200, {"ok": True}

    # ---- orders ---------------------------------------------------------
    if path == "/api/orders/mine" and method == "GET":
        user, _session_row = await _current_user(headers, db)
        if user is None:
            return _err(401, "Please log in to see your orders.")
        rows = await db.list_orders_for_user(user["id"])
        orders = [_serialize_order(r) for r in rows]
        return 200, {"ok": True, "count": len(orders), "orders": orders}

    if path == "/api/orders" and method == "POST":
        payload, error = _parse_body(body)
        if error:
            return error
        order, validation_error = _validate_order(payload)
        if validation_error:
            return _err(400, validation_error)

        user, _session_row = await _current_user(headers, db)
        payment = order["payment"]
        if payment == "COD":
            payment_status, status = "COD", "PLACED"
        else:  # UPI / CARD go through the demo gateway first
            payment_status, status = "UNPAID", "PENDING_PAYMENT"

        row = None
        for _attempt in range(5):  # regenerate on the (unlikely) id collision
            candidate = {
                "order_id": _new_order_id(),
                "user_id": user["id"] if user else 0,
                "customer_name": order["customer"]["name"],
                "phone": order["customer"]["phone"],
                "address": order["customer"]["address"],
                "items_json": json.dumps(order["items"]),
                "subtotal": order["subtotal"],
                "mrp_total": order["mrpTotal"],
                "savings": order["savings"],
                "delivery": order["delivery"],
                "total": order["total"],
                "payment_method": payment,
                "payment_id": "",
                "payment_status": payment_status,
                "status": status,
                "created_at": _now(),
            }
            try:
                row = await db.create_order(candidate)
                break
            except Exception:
                if await db.get_order(candidate["order_id"]) is None:
                    raise
        return 201, {"ok": True, "order": _serialize_order(row)}

    if path == "/api/orders" and method == "GET":
        rows = await db.list_orders(100)
        orders = [_serialize_order(r) for r in rows]
        return 200, {"ok": True, "count": len(orders), "orders": orders}

    # ---- fake payment gateway ------------------------------------------
    if path == "/api/payments/fake" and method == "POST":
        payload, error = _parse_body(body)
        if error:
            return error
        order_id = str(payload.get("orderId", "")).strip()
        pay_method = str(payload.get("method", "")).strip().upper()
        row = await db.get_order(order_id) if order_id else None
        if row is None:
            return _err(404, "Order not found.")
        if row["payment_status"] not in ("UNPAID", "FAILED"):
            return _err(400, "This order is not awaiting payment.")

        if pay_method == "UPI":
            upi_id = str(payload.get("upiId", "")).strip()
            if "@" not in upi_id or len(upi_id) < 6:
                return _err(400, "Enter a valid UPI ID (e.g. name@okhdfc).")
        elif pay_method == "CARD":
            digits = re.sub(r"\D", "", str(payload.get("cardNumber", "")))
            if len(digits) != 16:
                return _err(400, "Enter a valid 16-digit card number.")
            if digits == "4000000000000002":
                await db.update_order_payment(order_id, "", "FAILED", row["status"])
                return _err(402, "Payment failed (demo decline). Try another card.")
        else:
            return _err(400, "Payment method must be UPI or CARD.")

        payment_id = "pay_" + secrets.token_hex(8)
        updated = await db.update_order_payment(order_id, payment_id, "PAID", "PLACED")
        return 200, {
            "ok": True,
            "paymentId": payment_id,
            "status": "SUCCESS",
            "orderId": order_id,
            "order": _serialize_order(updated),
        }

    # ---- admin ----------------------------------------------------------
    if path == "/api/admin/login" and method == "POST":
        payload, error = _parse_body(body)
        if error:
            return error
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        admin_email = str(config.get("admin_email", "")).strip().lower()
        admin_password = str(config.get("admin_password", ""))
        if not admin_email or not hmac.compare_digest(email, admin_email) or not hmac.compare_digest(
            password, admin_password
        ):
            return _err(401, "Invalid admin credentials.")
        token = await _new_session(db, 0, is_admin=True)
        return 200, {"ok": True, "token": token}

    if path == "/api/admin/stats" and method == "GET":
        guard = await _require_admin(headers, db)
        if guard:
            return guard
        stats = await db.order_stats()
        rows = await db.list_orders(5)
        return 200, {
            "ok": True,
            "orders": stats["orders"],
            "paidOrders": stats["paidOrders"],
            "revenue": stats["revenue"],
            "customers": await db.count_users(),
            "products": len(PRODUCTS),
            "recentOrders": [_serialize_order(r) for r in rows],
        }

    if path == "/api/admin/orders" and method == "GET":
        guard = await _require_admin(headers, db)
        if guard:
            return guard
        rows = await db.list_orders(100)
        orders = [_serialize_order(r) for r in rows]
        return 200, {"ok": True, "count": len(orders), "orders": orders}

    if path.startswith("/api/admin/orders/") and path.endswith("/status") and method == "POST":
        guard = await _require_admin(headers, db)
        if guard:
            return guard
        order_id = path[len("/api/admin/orders/"):-len("/status")]
        payload, error = _parse_body(body)
        if error:
            return error
        new_status = str(payload.get("status", "")).strip().upper()
        if new_status not in ORDER_STATUSES:
            return _err(400, "Status must be one of: %s." % ", ".join(ORDER_STATUSES))
        if await db.get_order(order_id) is None:
            return _err(404, "Order not found.")
        updated = await db.update_order_status(order_id, new_status)
        return 200, {"ok": True, "order": _serialize_order(updated)}

    return _err(404, "Route not found: %s %s" % (method, path))
