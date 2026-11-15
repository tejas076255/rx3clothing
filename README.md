# RX3 — Shirts E-Commerce Store (Mens, Boys & New Born)

A complete clothing e-commerce website: **React + Tailwind CSS** frontend, **Python**
backend built for **Cloudflare Workers (Python)**, deployable to **Cloudflare Pages +
Workers**.

- 18-product shirts-only catalog (Men / Boys / New Born), prices in ₹ with MRP discounts
- Landing page: hero, category tiles, featured + bestseller rows, offer banner,
  testimonials, newsletter signup, footer
- Shop with live search, category filter, size filter and price/rating sorting
- Product quick-view with size + quantity selection
- Cart drawer + wishlist, both persisted in `localStorage`
- Checkout (COD / UPI mock) that places real orders against the Python API,
  with a graceful on-device fallback if the API is unreachable

## Project layout

```
clothing-store/
├── frontend/                 # Vite + React + Tailwind SPA
│   ├── src/
│   │   ├── api.js            # API client + bundled-catalog fallback
│   │   ├── context/          # cart / wishlist store (localStorage)
│   │   ├── components/       # Navbar, ProductCard, QuickView, CartDrawer, sections
│   │   ├── views/            # Home, Shop, Wishlist, Checkout
│   │   └── data/catalog.js   # fallback copy of the catalog
│   └── dist/                 # production build output (npm run build)
└── backend/                  # Python API
    ├── catalog.py            # the product catalog (single source of truth)
    ├── app.py                # shared routing + order validation logic
    ├── worker.py             # Cloudflare Python Worker entry point
    ├── local_server.py       # stdlib-only local server (same API, no pip installs)
    └── wrangler.toml         # Worker config (python_workers flag)
```

## Run locally

### 1. Backend API (port 8787)

```bash
cd backend
python3 local_server.py
# → RX3 API listening on http://localhost:8787
```

Check it:

```bash
curl http://localhost:8787/api/health
curl "http://localhost:8787/api/products?category=Boys&sort=price-asc"
curl -X POST http://localhost:8787/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer":{"name":"Test","phone":"9876543210","address":"MG Road, Ahmedabad"},
       "payment":"COD","items":[{"id":1,"size":"M","qty":2}]}'
```

API endpoints: `GET /api/health`, `GET /api/products` (`?category=`, `?search=`,
`?sort=price-asc|price-desc|rating`), `GET /api/products/<id>`, `POST /api/orders`.
Orders are validated (name, 10+ digit phone, address, known product ids, valid
sizes, qty 1–10, payment COD/UPI) and priced server-side; delivery is free above
₹999, otherwise ₹49. Orders are stored in memory (demo-grade; add D1/KV for
production persistence).

### 2. Frontend (port 5173 dev / 4173 preview)

```bash
cd frontend
npm install
npm run dev        # development server → http://localhost:5173
# or
npm run build && npm run preview   # production build → http://localhost:4173
```

The frontend reads `VITE_API_BASE` (see `frontend/.env.example`, default
`http://localhost:8787`). If the API is down it automatically falls back to the
bundled catalog copy, so the storefront never looks broken.

## Deploy to Cloudflare

> **Note:** Python Workers are in **beta**. The deploy itself needs the account
> owner's own Cloudflare login — run these commands after `wrangler login`.

### Backend → Cloudflare Workers (Python)

```bash
cd backend
npx wrangler login     # one-time, opens the browser
npx wrangler deploy    # → https://vastra-api.<your-subdomain>.workers.dev
```

`wrangler.toml` already sets `main = "worker.py"` and the `python_workers`
compatibility flag; `worker.py` + `app.py` + `catalog.py` are bundled together.

### Frontend → Cloudflare Pages

```bash
cd frontend
# point the app at the deployed Worker first:
echo "VITE_API_BASE=https://vastra-api.<your-subdomain>.workers.dev" > .env.production
npm run build
npx wrangler pages deploy dist --project-name vastra
# → https://vastra.pages.dev (custom domain can be attached in the Pages dashboard)
```

## Notes / limits

- Checkout is a **mock payment flow** (COD / UPI intent) — no real payment
  gateway is wired up.
- Order storage is in-memory in both the local server and the Worker; for
  production, persist orders to Cloudflare D1 or KV and read the catalog from
  there too if it needs to be editable without redeploying.
- Product photos are served from Unsplash CDN URLs.
