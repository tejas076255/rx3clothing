import { formatINR } from "../api.js";
import { useStore } from "../context/StoreContext.jsx";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cart, updateQty, removeFromCart, totals, setView } = useStore();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-in flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="font-display text-xl font-bold">
            Your Bag {totals.count > 0 && <span className="text-brand-600">({totals.count})</span>}
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="w-9 h-9 grid place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 grid place-items-center px-6 text-center">
            <div>
              <div className="text-5xl mb-3">🛍️</div>
              <p className="font-semibold text-lg">Your bag is empty</p>
              <p className="text-sm text-neutral-500 mt-1">
                Add something you love — new drops land every week.
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-4 bg-ink text-white px-6 py-2.5 rounded-full font-semibold hover:bg-brand-700 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-sm leading-snug">{item.name}</p>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-neutral-400 hover:text-ink text-sm"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">Size: {item.size}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-neutral-300 rounded-full overflow-hidden">
                        <button
                          className="w-7 h-7 grid place-items-center hover:bg-neutral-100"
                          onClick={() => updateQty(item.id, item.size, -1)}
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          className="w-7 h-7 grid place-items-center hover:bg-neutral-100"
                          onClick={() => updateQty(item.id, item.size, 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{formatINR(item.price * item.qty)}</span>
                        {item.mrp > item.price && (
                          <span className="block text-xs text-neutral-400 line-through">
                            {formatINR(item.mrp * item.qty)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 px-5 py-4 space-y-1.5 text-sm">
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
                <span className="font-semibold">
                  {totals.delivery === 0 ? "FREE" : formatINR(totals.delivery)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1.5 border-t border-dashed border-neutral-200">
                <span>Total</span>
                <span>{formatINR(totals.total)}</span>
              </div>
              <button
                onClick={() => {
                  setCartOpen(false);
                  setView("checkout");
                  window.scrollTo({ top: 0 });
                }}
                className="w-full mt-3 bg-ink text-white font-semibold py-3 rounded-full hover:bg-brand-700 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
