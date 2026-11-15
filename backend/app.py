"""Shared API logic for RX3 — used by both the Cloudflare Python Worker (worker.py)
and the local development server (local_server.py).

handle(method, path, query, body) -> (status_code, response_dict)
  method: "GET" / "POST" / "OPTIONS" ...
  path:   "/api/products" (no query string)
  query:  dict of str -> str (already parsed)
  body:   bytes or None (raw request body)
"""

import json
import random
import time

from catalog import PRODUCTS, get_product, list_products

ORDERS = []  # in-memory order store (per-process; fine for demo/local dev)


def _err(status, message):
    return status, {"ok": False, "error": message}


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
    if payment not in ("COD", "UPI"):
        return None, "Payment must be COD or UPI."

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


def handle(method, path, query, body):
    method = (method or "GET").upper()
    path = (path or "/").rstrip("/") or "/"
    query = query or {}

    if method == "OPTIONS":
        return 204, {}

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

    if path == "/api/orders" and method == "POST":
        try:
            payload = json.loads(body.decode("utf-8") if isinstance(body, (bytes, bytearray)) else body or "{}")
        except (ValueError, UnicodeDecodeError):
            return _err(400, "Request body must be valid JSON.")
        order, error = _validate_order(payload)
        if error:
            return _err(400, error)
        order_id = "RX3%d%04d" % (int(time.time()) % 100000000, random.randint(0, 9999))
        order["orderId"] = order_id
        order["status"] = "PLACED"
        ORDERS.append(order)
        return 201, {"ok": True, "order": order}

    if path == "/api/orders" and method == "GET":
        return 200, {"ok": True, "count": len(ORDERS), "orders": ORDERS}

    return _err(404, "Route not found: %s %s" % (method, path))
