import { useEffect, useState } from "react";
import { fetchProducts } from "./api.js";
import CartDrawer from "./components/CartDrawer.jsx";
import Navbar from "./components/Navbar.jsx";
import QuickViewModal from "./components/QuickViewModal.jsx";
import { Footer } from "./components/Sections.jsx";
import { useStore } from "./context/StoreContext.jsx";
import CheckoutPage from "./views/CheckoutPage.jsx";
import HomePage from "./views/HomePage.jsx";
import LoginPage from "./views/LoginPage.jsx";
import MyOrdersPage from "./views/MyOrdersPage.jsx";
import ShopPage from "./views/ShopPage.jsx";
import SignupPage from "./views/SignupPage.jsx";
import AdminPage from "./views/AdminPage.jsx";
import WishlistPage from "./views/WishlistPage.jsx";

export default function App() {
  const { view, toast } = useStore();
  const [products, setProducts] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchProducts().then(({ products: items, source: src }) => {
      if (!alive) return;
      setProducts(items);
      setSource(src);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">
        {loading ? (
          <div className="animate-pulse" aria-label="Loading RX3">
            <div className="bg-neutral-200 h-64 sm:h-80" />
            <div className="max-w-7xl mx-auto px-4 py-10">
              <div className="h-7 w-56 bg-neutral-200 rounded-full" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                    <div className="h-52 sm:h-64 lg:h-72 bg-neutral-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-2/3 bg-neutral-200 rounded-full" />
                      <div className="h-4 w-1/2 bg-neutral-200 rounded-full" />
                      <div className="h-8 w-full bg-neutral-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-neutral-400 mt-8 text-sm text-center">Loading the new collection…</p>
            </div>
          </div>
        ) : (
          <>
            {view === "home" && <HomePage products={products} />}
            {view === "shop" && <ShopPage products={products} />}
            {view === "wishlist" && <WishlistPage />}
            {view === "checkout" && <CheckoutPage />}
            {view === "login" && <LoginPage />}
            {view === "signup" && <SignupPage />}
            {view === "myorders" && <MyOrdersPage />}
            {view === "admin" && <AdminPage />}
          </>
        )}
      </div>

      {source === "fallback" && !loading && (
        <div className="bg-neutral-100 border-t border-neutral-300 text-neutral-800 text-xs text-center py-2 px-3">
          Live API not reachable — showing the built-in catalog. Start the backend
          (<code>backend/local_server.py</code>) to go live.
        </div>
      )}

      <Footer />
      <CartDrawer />
      <QuickViewModal />

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl animate-fade-up max-w-[92vw] text-center">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
