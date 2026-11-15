import { useCallback, useEffect, useState } from "react";
import {
  adminLogin,
  adminLogout,
  adminOrders,
  adminSetStatus,
  adminStats,
  formatINR,
  getAdminToken,
  setAdminToken,
} from "../api.js";

const STATUSES = ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"];
const inputCls =
  "w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500";

function paymentLabel(order) {
  if (order.paymentStatus === "PAID") return `PAID · ${order.payment}`;
  if (order.paymentStatus === "COD") return "COD";
  if (order.paymentStatus === "FAILED") return `FAILED · ${order.payment}`;
  return `UNPAID · ${order.payment}`;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [busyRow, setBusyRow] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginBusy, setLoginBusy] = useState(false);

  const load = useCallback(async () => {
    const [statsData, ordersData] = await Promise.all([adminStats(), adminOrders()]);
    setStats(statsData);
    setOrders(ordersData);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (getAdminToken()) {
        try {
          await load();
          if (alive) setAuthed(true);
        } catch {
          setAdminToken(null);
          if (alive) setAuthed(false);
        }
      }
      if (alive) setChecking(false);
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoginBusy(true);
    try {
      await adminLogin(form.email.trim(), form.password);
      await load();
      setAuthed(true);
    } catch (err) {
      setError(err.message || "Admin login failed.");
    } finally {
      setLoginBusy(false);
    }
  };

  const logout = () => {
    adminLogout();
    setAuthed(false);
    setStats(null);
    setOrders([]);
  };

  const changeStatus = async (orderId, status) => {
    setBusyRow(orderId);
    setError("");
    try {
      await adminSetStatus(orderId, status);
      await load();
    } catch (err) {
      setError(err.message || "Could not update the order status.");
    } finally {
      setBusyRow("");
    }
  };

  if (checking) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500 text-sm">Loading admin…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="max-w-md mx-auto px-4 py-14">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 animate-fade-up">
          <h1 className="font-display text-3xl font-bold">Admin</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Sign in to see orders, revenue and deliveries.
          </p>
          <form onSubmit={submitLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5">Admin email</label>
              <input
                className={inputCls}
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@rx3clothing.com"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Password</label>
              <input
                className={inputCls}
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Admin password"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-ink bg-neutral-100 rounded-xl px-4 py-2.5">{error}</p>
            )}
            <button
              type="submit"
              disabled={loginBusy}
              className="w-full bg-ink text-white font-semibold py-3.5 rounded-full hover:bg-brand-700 transition disabled:opacity-60"
            >
              {loginBusy ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="text-xs text-neutral-400 text-center mt-4">
            Local demo login: admin@rx3clothing.com / rx3admin
          </p>
        </div>
      </main>
    );
  }

  const cards = [
    { label: "Total Orders", value: stats ? stats.orders : "—" },
    { label: "Revenue (paid)", value: stats ? formatINR(stats.revenue) : "—" },
    { label: "Customers", value: stats ? stats.customers : "—" },
    { label: "Products", value: stats ? stats.products : "—" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1">Orders, payments and fulfilment at a glance.</p>
        </div>
        <button
          onClick={logout}
          className="border border-neutral-300 px-5 py-2.5 rounded-full text-sm font-semibold hover:border-ink transition"
        >
          Logout
        </button>
      </div>

      {error && (
        <p className="mt-5 text-sm font-medium bg-neutral-100 rounded-xl px-4 py-3">{error}</p>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-neutral-200 rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {card.label}
            </p>
            <p className="font-display text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border border-neutral-200 rounded-3xl mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Orders</h2>
          <span className="text-xs text-neutral-500">{orders.length} shown · newest first</span>
        </div>
        {orders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[880px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Phone</th>
                  <th className="px-3 py-3 font-semibold">Items</th>
                  <th className="px-3 py-3 font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <tr key={order.orderId} className="align-top">
                    <td className="px-5 py-3 font-semibold whitespace-nowrap">{order.orderId}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-neutral-600">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{order.customer?.name || "—"}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-neutral-600">
                      {order.customer?.phone || "—"}
                    </td>
                    <td className="px-3 py-3 text-neutral-600 max-w-[260px]">
                      {(order.items || [])
                        .map((i) => `${i.name} (${i.size}) ×${i.qty}`)
                        .join(", ")}
                    </td>
                    <td className="px-3 py-3 font-semibold whitespace-nowrap">
                      {formatINR(order.total)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          order.paymentStatus === "PAID"
                            ? "bg-ink text-white"
                            : "bg-neutral-100 border border-neutral-300"
                        }`}
                      >
                        {paymentLabel(order)}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <select
                        value={order.status}
                        disabled={busyRow === order.orderId}
                        onChange={(e) => changeStatus(order.orderId, e.target.value)}
                        className="border border-neutral-300 rounded-full px-3 py-1.5 text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
