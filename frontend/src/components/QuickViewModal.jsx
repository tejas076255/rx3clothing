import { useEffect, useState } from "react";
import { discountPct, formatINR } from "../api.js";
import { useStore } from "../context/StoreContext.jsx";

export default function QuickViewModal() {
  const { quickView: p, setQuickView, addToCart, toggleWishlist, isWishlisted, setCartOpen } =
    useStore();
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (p) {
      setSize(p.sizes[Math.min(1, p.sizes.length - 1)]);
      setQty(1);
    }
  }, [p]);

  if (!p) return null;
  const off = discountPct(p);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={() => setQuickView(null)}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-3xl overflow-hidden animate-fade-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid sm:grid-cols-2">
          <div className="relative">
            <img src={p.image} alt={p.name} className="w-full h-72 sm:h-full object-cover" />
            {off > 0 && (
              <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {off}% OFF
              </span>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  {p.category} · {p.type}
                </p>
                <h2 className="font-display text-2xl font-bold mt-1">{p.name}</h2>
              </div>
              <button
                onClick={() => setQuickView(null)}
                className="w-9 h-9 shrink-0 grid place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-lg"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="bg-ink text-white font-semibold px-2 py-0.5 rounded">
                ★ {p.rating}
              </span>
              <span className="text-neutral-500">
                {p.reviews.toLocaleString("en-IN")} verified ratings
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{formatINR(p.price)}</span>
              {p.mrp > p.price && (
                <>
                  <span className="text-neutral-400 line-through">{formatINR(p.mrp)}</span>
                  <span className="text-ink font-semibold">Save {formatINR(p.mrp - p.price)}</span>
                </>
              )}
            </div>
            <p className="text-xs text-neutral-500">Inclusive of all taxes</p>

            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">{p.description}</p>

            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">
                Colour: <span className="font-normal text-neutral-600">{p.colors.join(" / ")}</span>
              </p>
              <p className="text-sm font-semibold mb-2">Select size</p>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[3rem] px-3 py-2 rounded-full border text-sm font-medium transition ${
                      size === s
                        ? "bg-ink text-white border-ink"
                        : "border-neutral-300 hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <p className="text-sm font-semibold">Quantity</p>
              <div className="flex items-center border border-neutral-300 rounded-full overflow-hidden">
                <button
                  className="w-9 h-9 grid place-items-center hover:bg-neutral-100 text-lg"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button
                  className="w-9 h-9 grid place-items-center hover:bg-neutral-100 text-lg"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  addToCart(p, size, qty);
                  setQuickView(null);
                  setCartOpen(true);
                }}
                className="flex-1 bg-ink text-white font-semibold py-3 rounded-full hover:bg-brand-700 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(p)}
                className={`px-5 py-3 rounded-full border font-semibold transition ${
                  isWishlisted(p.id)
                    ? "bg-ink border-ink text-white"
                    : "border-neutral-300 hover:border-ink hover:text-ink"
                }`}
              >
                ♥
              </button>
            </div>

            <ul className="mt-5 text-xs text-neutral-500 space-y-1">
              <li>✓ Free delivery on orders above ₹999 (else ₹49)</li>
              <li>✓ Cash on Delivery & UPI accepted</li>
              <li>✓ Easy 7-day size exchange</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
