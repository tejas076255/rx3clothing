import { FALLBACK_PRODUCTS } from "./data/catalog.js";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

const TOKEN_KEY = "rx3-token";
const ADMIN_TOKEN_KEY = "rx3-admin-token";

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token) {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
    else localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

async function fetchJSON(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/**
 * JSON API call with proper error surfacing. `token` defaults to the stored
 * customer token; pass `token: null` for public calls or an explicit token
 * (e.g. the admin token).
 */
export async function apiCall(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const tok = token === undefined ? getToken() : token;
  if (tok) headers.Authorization = `Bearer ${tok}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Customer auth
// ---------------------------------------------------------------------------

export async function signup(name, email, password) {
  const data = await apiCall("/api/auth/signup", {
    method: "POST",
    body: { name, email, password },
    token: null,
  });
  setToken(data.token);
  return data;
}

export async function login(email, password) {
  const data = await apiCall("/api/auth/login", {
    method: "POST",
    body: { email, password },
    token: null,
  });
  setToken(data.token);
  return data;
}

export async function fetchMe() {
  return apiCall("/api/auth/me");
}

export async function logout() {
  try {
    await apiCall("/api/auth/logout", { method: "POST" });
  } catch {
    /* session may already be gone — clearing locally is enough */
  }
  setToken(null);
}

// ---------------------------------------------------------------------------
// Orders + fake payment
// ---------------------------------------------------------------------------

/**
 * Place an order with the backend (attaches the login token when present).
 * If the API is unreachable, create a local order id so checkout still
 * completes gracefully.
 */
export async function placeOrder(payload) {
  try {
    const headers = { "Content-Type": "application/json" };
    const tok = getToken();
    if (tok) headers.Authorization = `Bearer ${tok}`;
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data && data.ok && data.order) return { order: data.order, source: "api" };
    throw new Error((data && data.error) || `Order failed (${res.status})`);
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

export async function fetchMyOrders() {
  const data = await apiCall("/api/orders/mine");
  return data.orders || [];
}

/** Run the demo payment gateway for an order awaiting payment. */
export async function fakePay({ orderId, method, upiId, cardNumber }) {
  return apiCall("/api/payments/fake", {
    method: "POST",
    body: { orderId, method, upiId, cardNumber },
  });
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function adminLogin(email, password) {
  const data = await apiCall("/api/admin/login", {
    method: "POST",
    body: { email, password },
    token: null,
  });
  setAdminToken(data.token);
  return data;
}

export async function adminStats() {
  return apiCall("/api/admin/stats", { token: getAdminToken() });
}

export async function adminOrders() {
  const data = await apiCall("/api/admin/orders", { token: getAdminToken() });
  return data.orders || [];
}

export async function adminSetStatus(orderId, status) {
  return apiCall(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: "POST",
    body: { status },
    token: getAdminToken(),
  });
}

export function adminLogout() {
  setAdminToken(null);
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export function discountPct(p) {
  if (!p.mrp || p.mrp <= p.price) return 0;
  return Math.round(((p.mrp - p.price) / p.mrp) * 100);
}
