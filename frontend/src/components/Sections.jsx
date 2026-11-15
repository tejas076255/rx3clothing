import { useState } from "react";
import { useStore } from "../context/StoreContext.jsx";

export function Hero() {
  const { goShop } = useStore();
  return (
    <section className="relative bg-ink text-white overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1600&auto=format&fit=crop"
        alt="RX3 shirts on the rack — mens, boys and new born shirts"
        className="absolute inset-0 w-full h-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-32">
        <p className="uppercase tracking-[0.3em] text-neutral-300 text-xs sm:text-sm font-semibold">
          RX3 Clothing · Ahmedabad
        </p>
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mt-4 max-w-2xl">
          Shirts for Men, Boys
          <span className="text-neutral-300"> & New Borns.</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-neutral-200 max-w-xl">
          One craft, three generations. RX3 makes shirts in Ahmedabad — formal, casual, party
          and festive shirts for men, sharp little shirts for boys, and feather-soft shirts for
          new borns. Honest prices from ₹299, delivered across India.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => goShop("All")}
            className="bg-white hover:bg-neutral-200 text-ink font-semibold px-8 py-3.5 rounded-full transition shadow-lg"
          >
            Shop All Shirts
          </button>
          <button
            onClick={() => goShop("Men")}
            className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/40 text-white font-semibold px-8 py-3.5 rounded-full transition"
          >
            Explore Men’s Shirts
          </button>
        </div>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-neutral-200">
          <span>★ 4.6 average rating</span>
          <span>✓ Shirt specialists since day one</span>
          <span>✓ COD available</span>
        </div>
      </div>
    </section>
  );
}

const TILES = [
  {
    category: "Men",
    title: "Men",
    tagline: "Formal, casual, linen, denim & party shirts",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
  },
  {
    category: "Boys",
    title: "Boys",
    tagline: "School, party & festive shirts for young gentlemen",
    image:
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800&auto=format&fit=crop",
  },
  {
    category: "New Born",
    title: "New Born",
    tagline: "Feather-soft cotton shirts & sets for delicate skin",
    image:
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800&auto=format&fit=crop",
  },
];

export function CategoryTiles() {
  const { goShop } = useStore();
  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-3xl font-bold">Shop by Category</h2>
          <p className="text-neutral-500 mt-1">Mens Shirts · Boys Shirts · New Born Shirts.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {TILES.map((t) => (
          <button
            key={t.category}
            onClick={() => goShop(t.category)}
            className="relative h-64 rounded-3xl overflow-hidden group text-left"
          >
            <img
              src={t.image}
              alt={t.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white">
              <h3 className="font-display text-2xl font-bold">{t.title}</h3>
              <p className="text-sm text-neutral-200">{t.tagline}</p>
              <span className="inline-block mt-2 text-sm font-semibold underline underline-offset-4">
                Shop now →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function OfferBanner() {
  const { goShop } = useStore();
  return (
    <section className="max-w-7xl mx-auto px-4 pb-14">
      <div className="relative rounded-3xl overflow-hidden bg-ink text-white">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1400&auto=format&fit=crop"
          alt="Festive sale rack"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative px-6 py-12 sm:px-12 text-center sm:text-left">
          <p className="uppercase tracking-[0.25em] text-xs font-bold text-neutral-400">
            Limited period
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mt-2">
            Festive Sale — up to 50% off
          </h2>
          <p className="mt-3 text-neutral-300 max-w-lg">
            Plus free delivery on orders above ₹999 and easy 7-day size exchange. No codes, no
            catch — prices already slashed.
          </p>
          <button
            onClick={() => goShop("All")}
            className="mt-6 bg-white text-ink font-semibold px-8 py-3 rounded-full hover:bg-neutral-200 transition"
          >
            Grab the Deals
          </button>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Ahmedabad",
    text: "Bought the new born shirt set for my nephew. The cotton is genuinely soft, the snaps are gentle, and it reached us in two days.",
    stars: 5,
  },
  {
    name: "Rohan Mehta",
    city: "Mumbai",
    text: "The Oxford formal shirt fits exactly like the size chart says — collar, sleeves, everything. I have ordered three more for office.",
    stars: 5,
  },
  {
    name: "Ananya Iyer",
    city: "Bengaluru",
    text: "My son wears his RX3 checked party shirt everywhere. Colours have survived a dozen washes and the stitching still looks new.",
    stars: 4,
  },
];

export function Testimonials() {
  return (
    <section className="bg-white border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="font-display text-3xl font-bold text-center">Loved Across India</h2>
        <p className="text-neutral-500 text-center mt-1">Real words from real wardrobes.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200">
              <div className="text-ink text-lg" aria-label={`${t.stars} star rating`}>
                {"★".repeat(t.stars)}
                <span className="text-neutral-300">{"★".repeat(5 - t.stars)}</span>
              </div>
              <blockquote className="mt-3 text-neutral-700 leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-4 font-semibold">
                {t.name}
                <span className="block text-sm font-normal text-neutral-500">{t.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setDone(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="bg-ink text-white rounded-3xl px-6 py-12 sm:px-12 text-center">
        <h2 className="font-display text-3xl font-bold">Get ₹200 off your first order</h2>
        <p className="text-neutral-300 mt-2 max-w-md mx-auto">
          Join the RX3 list for early drops, members-only prices and your welcome treat. One
          email a week, no spam.
        </p>
        {done ? (
          <div className="mt-6 inline-block bg-white/10 border border-white/60 text-white font-semibold px-6 py-3 rounded-full animate-fade-up">
            ✓ You’re on the list! Your ₹200 welcome code is on its way to {email.trim()}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-full px-5 py-3 text-ink outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="bg-white hover:bg-neutral-200 text-ink font-semibold px-8 py-3 rounded-full transition"
            >
              Claim ₹200 Off
            </button>
          </form>
        )}
        {error && <p className="mt-3 text-neutral-200 font-medium text-sm">{error}</p>}
      </div>
    </section>
  );
}

export function Footer() {
  const { goShop, setView } = useStore();
  return (
    <footer className="bg-ink text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold tracking-[0.2em] text-white">RX3</p>
          <p className="mt-3 text-sm leading-relaxed">
            RX3 Clothing Private Limited — Ahmedabad-based shirt makers crafting Mens Shirts,
            Boys Shirts and New Born Shirts in breathable Indian fabrics, priced honestly.
          </p>
          <p className="mt-3 text-sm">Made with care in Ahmedabad, India.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button className="hover:text-white" onClick={() => goShop("Men")}>
                Mens Shirts
              </button>
            </li>
            <li>
              <button className="hover:text-white" onClick={() => goShop("Boys")}>
                Boys Shirts
              </button>
            </li>
            <li>
              <button className="hover:text-white" onClick={() => goShop("New Born")}>
                New Born Shirts
              </button>
            </li>
            <li>
              <button className="hover:text-white" onClick={() => goShop("All")}>
                All Products
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Good to Know</h4>
          <ul className="space-y-2 text-sm">
            <li>Free delivery above ₹999</li>
            <li>Cash on Delivery & UPI accepted</li>
            <li>7-day easy size exchange</li>
            <li>Delivery in 2–5 working days</li>
            <li>
              <button className="hover:text-white" onClick={() => setView("admin")}>
                Admin
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Talk to Us</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="text-neutral-500">Owner:</span> Yogesh Darji
            </li>
            <li>
              <span className="text-neutral-500">Phone:</span>{" "}
              <a href="tel:+919825033855" className="hover:text-white">
                +91 98250 33855
              </a>
            </li>
            <li>
              <span className="text-neutral-500">Email:</span>{" "}
              <a href="mailto:RX3clothing95@gmail.com" className="hover:text-white">
                RX3clothing95@gmail.com
              </a>
            </li>
            <li>Mon–Sat, 10 am – 7 pm IST</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-neutral-500 space-y-1">
          <p>
            RX3 CLOTHING PRIVATE LIMITED · A5, A6, A7, A8, Samet Business Park, Near Parishkaar
            II, Khokhra Circle, Maninagar (East), Ahmedabad - 380008
          </p>
          <p>GSTIN: 24AAHCR7720C1ZN</p>
          <p>
            © 2026 RX3 Clothing Private Limited. All prices include GST. Demo storefront —
            checkout is a mock flow.
          </p>
        </div>
      </div>
    </footer>
  );
}
