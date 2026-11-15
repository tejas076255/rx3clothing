import { FALLBACK_PRODUCTS } from "./data/catalog.js";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

async function fetchJSON(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/** Fetch products from the backend; fall back to the bundled catalog copy. */
export async function fetchProducts() {
  try {
    const data = await fetchJSON("/api/products");
    if (data && Array.isArray(data.products) && data.products.length) {
      return { products: data.products, source: "api" };
    }
    throw new Error("Empty catalog from API");
  } catch (err) {
    return { products: FALLBACK_PRODUCTS, source: "fallback" };
  }
}

/**
 * Place an order with the backend. If the API is unreachable, create a local
 * order id so checkout still completes gracefully.
 */
export async function placeOrder(payload) {
  try {
    const data = await fetchJSON("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (data && data.ok && data.order) return { order: data.order, source: "api" };
    throw new Error((data && data.error) || "Order failed");
  } catch (err) {
    if (err.message && /required|valid|must|Unknown|Quantity|Size/.test(err.message)) {
      throw err; // real validation error from the API — surface it
    }
    const subtotal = payload.items.reduce((sum, item) => {
      const p = FALLBACK_PRODUCTS.find((x) => x.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
    const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 49;
    return {
      order: {
        orderId: "RX3-LOCAL-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        total: subtotal + delivery,
        delivery,
        status: "PLACED (offline mode)",
      },
      source: "local",
    };
  }
}

export function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export function discountPct(p) {
  if (!p.mrp || p.mrp <= p.price) return 0;
  return Math.round(((p.mrp - p.price) / p.mrp) * 100);
}
