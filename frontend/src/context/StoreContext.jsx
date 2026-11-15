import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [view, setView] = useState("home"); // home | shop | wishlist | checkout
  const [shopCategory, setShopCategory] = useState("All");
  const [cart, setCart] = useState(() => load("rx3-cart", []));
  const [wishlist, setWishlist] = useState(() => load("rx3-wishlist", []));
  const [quickView, setQuickView] = useState(null); // product or null
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("rx3-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("rx3-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const goShop = (category = "All") => {
    setShopCategory(category);
    setView("shop");
    window.scrollTo({ top: 0 });
  };

  const addToCart = (product, size, qty = 1) => {
    const chosenSize = size || product.sizes[0];
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id && i.size === chosenSize);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(10, next[idx].qty + qty) };
        return next;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          mrp: product.mrp,
          size: chosenSize,
          qty,
        },
      ];
    });
    setToast(`${product.name} added to cart`);
  };

  const updateQty = (id, size, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id && i.size === size ? { ...i, qty: i.qty + delta } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const removeFromCart = (id, size) =>
    setCart((prev) => prev.filter((i) => !(i.id === id && i.size === size)));

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.some((i) => i.id === product.id)) {
        setToast(`${product.name} removed from wishlist`);
        return prev.filter((i) => i.id !== product.id);
      }
      setToast(`${product.name} saved to wishlist`);
      return [...prev, product];
    });
  };

  const isWishlisted = (id) => wishlist.some((i) => i.id === id);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const mrpTotal = cart.reduce((s, i) => s + i.mrp * i.qty, 0);
    const delivery = cart.length === 0 || subtotal >= 999 ? 0 : 49;
    return {
      subtotal,
      mrpTotal,
      savings: mrpTotal - subtotal,
      delivery,
      total: subtotal + delivery,
      count: cart.reduce((s, i) => s + i.qty, 0),
    };
  }, [cart]);

  const value = {
    view,
    setView,
    shopCategory,
    goShop,
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    totals,
    wishlist,
    toggleWishlist,
    isWishlisted,
    quickView,
    setQuickView,
    cartOpen,
    setCartOpen,
    toast,
    setToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
