import { useStore } from "../context/StoreContext.jsx";

export default function Navbar() {
  const { view, setView, goShop, totals, wishlist, setCartOpen } = useStore();

  const linkCls = (active) =>
    `px-3 py-2 text-sm font-medium rounded-full transition ${
      active ? "bg-ink text-white" : "text-neutral-700 hover:bg-neutral-200"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="bg-ink text-white text-center text-xs sm:text-sm py-1.5 px-3">
        Festive Sale is live — up to 50% off + free delivery on orders above ₹999
      </div>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={() => setView("home")}
          className="font-display text-2xl sm:text-3xl font-bold tracking-[0.2em] text-ink"
        >
          RX3
        </button>

        <nav className="hidden md:flex items-center gap-1">
          <button className={linkCls(view === "home")} onClick={() => setView("home")}>
            Home
          </button>
          <button className={linkCls(view === "shop")} onClick={() => goShop("All")}>
            Shop All
          </button>
          <button className={linkCls(false)} onClick={() => goShop("Men")}>
            Men
          </button>
          <button className={linkCls(false)} onClick={() => goShop("Boys")}>
            Boys
          </button>
          <button className={linkCls(false)} onClick={() => goShop("New Born")}>
            New Born
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("wishlist")}
            className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-neutral-100"
            aria-label="Wishlist"
          >
            <span className="text-xl">♥</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">
                {wishlist.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-neutral-100"
            aria-label="Cart"
          >
            <span className="text-xl">🛍️</span>
            {totals.count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">
                {totals.count}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto no-scrollbar">
        <button className={linkCls(view === "home")} onClick={() => setView("home")}>
          Home
        </button>
        <button className={linkCls(view === "shop")} onClick={() => goShop("All")}>
          Shop All
        </button>
        <button className={linkCls(false)} onClick={() => goShop("Men")}>
          Men
        </button>
        <button className={linkCls(false)} onClick={() => goShop("Boys")}>
          Boys
        </button>
        <button className={linkCls(false)} onClick={() => goShop("New Born")}>
          New Born
        </button>
      </nav>
    </header>
  );
}
