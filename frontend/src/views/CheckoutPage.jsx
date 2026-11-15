import { useState } from "react";
import { formatINR, placeOrder } from "../api.js";
import { useStore } from "../context/StoreContext.jsx";

export default function CheckoutPage() {
  const { cart, totals, updateQty, removeFromCart, clearCart, setView, goShop } = useStore();
  const [form, setForm] = useState({ name: "", phone: "", address: "", payment: "COD" });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [orderNote, setOrderNote] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your full name.";
    if (!/^[+]?[\d\s]{10,15}$/.test(form.phone.trim()))
      errs.phone = "Enter a valid phone number (10+ digits).";
    if (form.address.trim().length < 12)
      errs.address = "Please enter your complete delivery address with pincode.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate() || cart.length === 0) return;
    setPlacing(true);
    try {
      const payload = {
        customer: { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() },
        payment: form.payment,
        items: cart.map((i) => ({ id: i.id, size: i.size, qty: i.qty })),
      };
      const { order: placed, source } = await placeOrder(payload);
      setOrder(placed);
      setOrderNote(
        source === "api"
          ? "Your order was confirmed by the RX3 server."
          : "The store server could not be reached, so this order was recorded on this device only."
      );
      clearCart();
      window.scrollTo({ top: 0 });
    } catch (err) {
      setErrors({ form: err.message || "Could not place the order. Please try again." });
    } finally {
      setPlacing(false);
    }
  };

  if (order) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 animate-fade-up">
          <div className="w-16 h-16 mx-auto bg-ink text-white rounded-full grid place-items-center text-3xl">
            ✓
          </div>
          <h1 className="font-display text-3xl font-bold mt-4">Order placed — thank you!</h1>
          <p className="text-neutral-500 mt-2">{orderNote}</p>
          <div className="mt-6 bg-neutral-50 rounded-2xl p-5 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Order ID</span>
              <span className="font-bold">{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment</span>
              <span className="font-semibold">
                {form.payment === "COD" ? "Cash on Delivery" : "UPI (pay on confirmation call)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Amount payable</span>
              <span className="font-bold">{formatINR(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Delivery to</span>
              <span className="font-semibold text-right max-w-[60%]">{form.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Expected delivery</span>
              <span className="font-semibold">2–5 working days</span>
            </div>
          </div>
          <button
            onClick={() => goShop("All")}
            className="mt-6 bg-ink text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-3">🛍️</div>
        <h1 className="font-display text-3xl font-bold">Your bag is empty</h1>
        <p className="text-neutral-500 mt-2">Add a few pieces first, then come back to check out.</p>
        <button
          onClick={() => goShop("All")}
          className="mt-5 bg-ink text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-700 transition"
        >
          Start Shopping
        </button>
      </main>
    );
  }

  const inputCls = (bad) =>
    `w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 ${
      bad ? "border-neutral-900" : "border-neutral-300"
    }`;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold">Checkout</h1>
      <p className="text-neutral-500 mt-1">Almost there — where should we deliver?</p>

      <div className="grid lg:grid-cols-5 gap-8 mt-8">
        <form onSubmit={submit} className="lg:col-span-3 bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 h-fit">
          <div>
            <label className="text-sm font-semibold block mb-1.5">Full name</label>
            <input className={inputCls(errors.name)} value={form.name} onChange={set("name")} placeholder="e.g. Aarav Patel" />
            {errors.name && <p className="text-ink text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5">Phone number</label>
            <input className={inputCls(errors.phone)} value={form.phone} onChange={set("phone")} placeholder="10-digit mobile number" inputMode="tel" />
            {errors.phone && <p className="text-ink text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5">Delivery address</label>
            <textarea className={inputCls(errors.address)} value={form.address} onChange={set("address")} rows={3} placeholder="House no, street, area, city, state — pincode" />
            {errors.address && <p className="text-ink text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Payment method</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { value: "COD", title: "Cash on Delivery", sub: "Pay at your doorstep" },
                { value: "UPI", title: "UPI", sub: "GPay / PhonePe / Paytm on confirmation call" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm((f) => ({ ...f, payment: opt.value }))}
                  className={`text-left border rounded-2xl px-4 py-3 transition ${
                    form.payment === opt.value
                      ? "border-ink bg-neutral-50 ring-1 ring-ink"
                      : "border-neutral-300 hover:border-ink"
                  }`}
                >
                  <span className="font-semibold text-sm block">{opt.title}</span>
                  <span className="text-xs text-neutral-500">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {errors.form && <p className="text-ink text-sm">{errors.form}</p>}

          <button
            type="submit"
            disabled={placing}
            className="w-full bg-ink text-white font-semibold py-3.5 rounded-full hover:bg-brand-700 transition disabled:opacity-60"
          >
            {placing ? "Placing your order…" : `Place Order · ${formatINR(totals.total)}`}
          </button>
          <p className="text-xs text-neutral-400 text-center">
            Demo checkout — no real payment is charged.
          </p>
        </form>

        <aside className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-6 h-fit">
          <h2 className="font-display text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug">{item.name}</p>
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="text-neutral-400 hover:text-ink text-sm"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500">Size {item.size}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center border border-neutral-300 rounded-full overflow-hidden">
                      <button className="w-6 h-6 grid place-items-center hover:bg-neutral-100 text-sm" onClick={() => updateQty(item.id, item.size, -1)}>
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                      <button className="w-6 h-6 grid place-items-center hover:bg-neutral-100 text-sm" onClick={() => updateQty(item.id, item.size, 1)}>
                        +
                      </button>
                    </div>
                    <span className="text-sm font-bold">{formatINR(item.price * item.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-neutral-200 mt-5 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-semibold">{formatINR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink">
              <span>You save vs MRP</span>
              <span className="font-semibold">− {formatINR(totals.savings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Delivery</span>
              <span className="font-semibold">{totals.delivery === 0 ? "FREE" : formatINR(totals.delivery)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-neutral-200">
              <span>Total</span>
              <span>{formatINR(totals.total)}</span>
            </div>
          </div>
          <button onClick={() => setView("shop")} className="mt-4 text-sm font-semibold text-brand-700 underline underline-offset-4">
            ← Continue shopping
          </button>
        </aside>
      </div>
    </main>
  );
}
