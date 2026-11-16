import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { getAdminToken } from "../api.js";

export default function Navbar() {
  const { view, setView, goShop, totals, wishlist, setCartOpen } = useStore();
  const { user, logout } = useAuth();

  const [isAdmin, setIsAdmin] = useState(() => !!getAdminToken());
  useEffect(() => {
    const sync = () => setIsAdmin(!!getAdminToken());
    sync();
    window.addEventListener("rx3-admin-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rx3-admin-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, [view]);

  const linkCls = (active) =>
    `px-3 py-2 text-sm font-medium rounded-full transition ${
      active ? "bg-ink text-white" : "text-neutral-700 hover:bg-neutral-200"
    }`;

  const handleLogout = async () => {
    await logout();
    setView("home");
  };

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : "";

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
          {user ? (
            <>
              <span className="hidden lg:block text-sm font-medium text-neutral-700">
                Hi, {firstName}
              </span>
              <button
                onClick={() => setView("myorders")}
                className={`hidden md:inline-flex px-3 py-2 text-sm font-medium rounded-full transition ${
                  view === "myorders" ? "bg-ink text-white" : "text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                My Orders
              </button>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex px-3 py-2 text-sm font-medium rounded-full text-neutral-700 hover:bg-neutral-200 transition"
              >
                Logout
              </button>
            </>
          ) : isAdmin ? (
            <button
              onClick={() => setView("admin")}
              className="bg-ink text-white px-4 py-2 text-sm font-semibold rounded-full hover:bg-brand-700 transition"
            >
              Admin Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => setView("login")}
                className="bg-ink text-white px-4 py-2 text-sm font-semibold rounded-full hover:bg-brand-700 transition"
              >
                Login
              </button>
              <button
                onClick={() => setView("signup")}
                className="hidden md:inline-flex px-3 py-2 text-sm font-medium rounded-full text-neutral-700 hover:bg-neutral-200 transition"
              >
                Sign Up
              </button>
            </>
          )}
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
        {user ? (
          <>
            <button className={linkCls(view === "myorders")} onClick={() => setView("myorders")}>
              My Orders
            </button>
            <button className={linkCls(false)} onClick={handleLogout}>
              Logout ({firstName})
            </button>
          </>
        ) : isAdmin ? (
          <button className={linkCls(view === "admin")} onClick={() => setView("admin")}>
            Admin Dashboard
          </button>
        ) : (
          <>
            <button className={linkCls(view === "login")} onClick={() => setView("login")}>
              Login
            </button>
            <button className={linkCls(view === "signup")} onClick={() => setView("signup")}>
              Sign Up
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
