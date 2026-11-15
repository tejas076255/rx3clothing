import ProductCard from "../components/ProductCard.jsx";
import { CategoryTiles, Hero, Newsletter, OfferBanner, Testimonials } from "../components/Sections.jsx";
import { useStore } from "../context/StoreContext.jsx";

function ProductRow({ title, subtitle, items, actionLabel, onAction }) {
  if (!items.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        {onAction && (
          <button
            onClick={onAction}
            className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-600 underline underline-offset-4"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage({ products }) {
  const { goShop } = useStore();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);
  const fresh = [...products].sort((a, b) => b.id - a.id).slice(0, 4);

  return (
    <main>
      <Hero />
      <CategoryTiles />
      <ProductRow
        title="Featured This Season"
        subtitle="Handpicked shirts our customers can’t stop wearing."
        items={featured}
        actionLabel="View all products →"
        onAction={() => goShop("All")}
      />
      <OfferBanner />
      <ProductRow
        title="Bestsellers"
        subtitle="The shirts India keeps reordering."
        items={bestsellers}
        actionLabel="Shop bestsellers →"
        onAction={() => goShop("All")}
      />
      <Testimonials />
      <ProductRow
        title="Just Landed"
        subtitle="Fresh additions to the RX3 rack."
        items={fresh}
        actionLabel="See everything →"
        onAction={() => goShop("All")}
      />
      <Newsletter />
    </main>
  );
}
