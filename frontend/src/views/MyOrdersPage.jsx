import { useEffect, useState } from "react";
import { fetchMyOrders, formatINR } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";

function paymentBadge(order) {
  switch (order.paymentStatus) {
    case "PAID":
      return { label: "PAID", cls: "bg-ink text-white" };
    case "COD":
      return { label: "Cash on Delivery", cls: "bg-neutral-100 text-ink border border-neutral-300" };
    case "FAILED":
      return { label: "Payment failed", cls: "bg-white text-ink border border-ink" };
    default:
      return { label: "Payment pending", cls: "bg-neutral-100 text-neutral-600 border border-neutral-300" };
  }
}

export default function MyOrdersPage() {
  const { user, authReady } = useAuth();
  const { setView, goShop } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let alive = true;
    fetchMyOrders()
      .then((items) => {
        if (alive) setOrders(items);
      })
      .catch((err) => {
        if (alive) setError(err.message || "Could not load your orders.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  if (!authReady || loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500 text-sm">Loading your orders…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-3">🔐</div>
        <h1 className="font-display text-3xl font-bold">Log in to see your orders</h1>
        <p className="text-neutral-500 mt-2">
          Your order history lives here once you are logged in.
        </p>
        <button
          onClick={() => setView("login")}
          className="mt-5 bg-ink text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-700 transition"
        >
          Log In
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold">My Orders</h1>
      <p className="text-neutral-500 mt-1">
        Orders placed by {user.name} ({user.email})
      </p>

      {error && (
        <p className="mt-6 text-sm font-medium bg-neutral-100 rounded-xl px-4 py-3">{error}</p>
      )}

      {!error && orders.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🧾</div>
          <p className="font-semibold">No orders yet</p>
          <p className="text-neutral-500 text-sm mt-1">When you buy something, it will show up here.</p>
          <button
            onClick={() => goShop("All")}
            className="mt-5 bg-ink text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-700 transition"
          >
            Start Shopping
          </button>
        </div>
      )}

      <div className="space-y-4 mt-8">
        {orders.map((order) => {
          const badge = paymentBadge(order);
          return (
            <article key={order.orderId} className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{order.orderId}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-300">
                    {order.status}
                  </span>
                </div>
              </div>
              <ul className="mt-4 divide-y divide-neutral-100 text-sm">
                {(order.items || []).map((item, idx) => (
                  <li key={idx} className="py-2 flex justify-between gap-3">
                    <span>
                      {item.name}
                      <span className="text-neutral-500"> · Size {item.size} × {item.qty}</span>
                    </span>
                    <span className="font-semibold">{formatINR(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-dashed border-neutral-200 flex justify-between text-sm">
                <span className="text-neutral-500">
                  {order.payment === "COD"
                    ? "Pay on delivery"
                    : order.paymentStatus === "PAID"
                      ? `Paid via ${order.payment}`
                      : `Payment pending via ${order.payment}`}
                  {order.delivery ? ` · Delivery ${formatINR(order.delivery)}` : " · Free delivery"}
                </span>
                <span className="font-bold">Total {formatINR(order.total)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
