import { discountPct, formatINR } from "../api.js";
import { useStore } from "../context/StoreContext.jsx";
import { useReveal } from "./Reveal.jsx";

export default function ProductCard({ product, revealDelay = 0 }) {
  const { addToCart, toggleWishlist, isWishlisted, setQuickView } = useStore();
  const wished = isWishlisted(product.id);
  const off = discountPct(product);
  const { ref, style } = useReveal(revealDelay);

  return (
    <div
      ref={ref}
      style={style}
      className="reveal group bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:shadow-xl hover:-translate-y-0.5 transition duration-300"
    >
      <div className="relative cursor-pointer" onClick={() => setQuickView(product)}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-52 sm:h-64 lg:h-72 object-cover group-hover:scale-105 transition duration-500"
        />
        {off > 0 && (
          <span className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {off}% OFF
          </span>
        )}
        {product.bestseller && (
          <span className="absolute bottom-3 left-3 bg-ink/85 text-white text-[11px] font-semibold px-2 py-1 rounded-full">
            Bestseller
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Toggle wishlist"
          className={`absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center text-lg shadow transition ${
            wished ? "bg-ink text-white" : "bg-white/95 text-neutral-600 hover:text-ink"
          }`}
        >
          ♥
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="uppercase tracking-wide">
            {product.category} · {product.type}
          </span>
          <span className="flex items-center gap-1 font-semibold text-neutral-700">
            ★ {product.rating}
            <span className="font-normal text-neutral-400">({product.reviews.toLocaleString("en-IN")})</span>
          </span>
        </div>
        <h3
          className="mt-1.5 font-semibold text-ink leading-snug cursor-pointer hover:text-brand-700"
          onClick={() => setQuickView(product)}
        >
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-sm text-neutral-400 line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setQuickView(product)}
            className="flex-1 border border-ink text-ink text-sm font-semibold py-2 rounded-full hover:bg-neutral-100 transition"
          >
            Quick View
          </button>
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-ink text-white text-sm font-semibold py-2 rounded-full hover:bg-brand-700 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
