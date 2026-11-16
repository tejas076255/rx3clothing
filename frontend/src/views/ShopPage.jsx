import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import { useStore } from "../context/StoreContext.jsx";

const CATEGORIES = ["All", "Men", "Boys", "New Born"];
const SORTS = [
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ShopPage({ products }) {
  const { shopCategory } = useStore();
  const [category, setCategory] = useState(shopCategory || "All");
  const [search, setSearch] = useState("");
  const [size, setSize] = useState("All");
  const [sort, setSort] = useState("popular");

  useEffect(() => {
    setCategory(shopCategory || "All");
  }, [shopCategory]);

  const allSizes = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return ["All", ...set];
  }, [products]);

  const filtered = useMemo(() => {
    let items = [...products];
    if (category !== "All") items = items.filter((p) => p.category === category);
    if (size !== "All") items = items.filter((p) => p.sizes.includes(size));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    else if (sort === "rating") items.sort((a, b) => b.rating - a.rating);
    else items.sort((a, b) => b.reviews - a.reviews);
    return items;
  }, [products, category, size, search, sort]);

  const pill = (active) =>
    `px-4 py-2 rounded-full text-sm font-semibold border transition ${
      active ? "bg-ink text-white border-ink" : "bg-white border-neutral-300 hover:border-ink"
    }`;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold">Shop</h1>
      <p className="text-neutral-500 mt-1">
        {filtered.length} of {products.length} products
        {category !== "All" ? ` in ${category}` : ""}
      </p>

      <div className="mt-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} className={pill(category === c)} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shirts — formal, checks, linen…"
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="rounded-full border border-neutral-300 px-4 py-2.5 text-sm bg-white outline-none"
            aria-label="Filter by size"
          >
            {allSizes.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All sizes" : `Size ${s}`}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-neutral-300 px-4 py-2.5 text-sm bg-white outline-none"
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🧺</div>
          <p className="font-semibold text-lg">Nothing matches those filters</p>
          <p className="text-neutral-500 text-sm mt-1">Try a different search, size or category.</p>
          <button
            onClick={() => {
              setSearch("");
              setSize("All");
              setCategory("All");
            }}
            className="mt-4 bg-ink text-white px-6 py-2.5 rounded-full font-semibold hover:bg-brand-700 transition"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-8">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} revealDelay={(i % 4) * 70} />
          ))}
        </div>
      )}
    </main>
  );
}
