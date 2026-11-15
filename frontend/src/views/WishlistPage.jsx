import ProductCard from "../components/ProductCard.jsx";
import { useStore } from "../context/StoreContext.jsx";

export default function WishlistPage() {
  const { wishlist, goShop } = useStore();

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold">Your Wishlist</h1>
      <p className="text-neutral-500 mt-1">
        {wishlist.length === 0
          ? "Pieces you save will wait for you here."
          : `${wishlist.length} piece${wishlist.length > 1 ? "s" : ""} saved for later.`}
      </p>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">♥</div>
          <p className="font-semibold text-lg">Nothing saved yet</p>
          <p className="text-neutral-500 text-sm mt-1">
            Tap the heart on any product and it will show up here.
          </p>
          <button
            onClick={() => goShop("All")}
            className="mt-4 bg-ink text-white px-6 py-2.5 rounded-full font-semibold hover:bg-brand-700 transition"
          >
            Discover Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-8">
          {wishlist.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
