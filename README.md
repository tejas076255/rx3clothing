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
- **Customer accounts** — signup / login (PBKDF2-hashed passwords, token sessions),
  "My Orders" history, checkout prefill
- **Demo payment gateway** ("RX3 SecurePay") — UPI / card checkout with a fake-pay
  endpoint, success + decline test values, orders move UNPAID → PAID
- **Admin dashboard** (`/admin` via the footer link) — order / revenue / customer /
  product stats, full orders table, fulfilment status updates
- **Real persistence** — users, sessions and orders are stored, not kept in
  memory (SQLite locally, Cloudflare KV in production)

## Project layout

```
clothing-store/
├── frontend/                 # Vite + React + Tailwind SPA
│   ├── src/
│   │   ├── api.js            # API client (auth tokens, orders, payments, admin)
│   │   ├── context/          # cart / wishlist store + auth session (localStorage)
│   │   ├── components/       # Navbar, ProductCard, QuickView, CartDrawer,
│   │   │                     # PaymentModal, sections/footer
│   │   ├── views/            # Home, Shop, Wishlist, Checkout, Login, Signup,
│   │   │                     # MyOrders, Admin
│   │   └── data/catalog.js   # fallback copy of the catalog
│   └── dist/                 # production build output (npm run build)
└── backend/                  # Python API
    ├── catalog.py            # the product catalog (single source of truth)
    ├── app.py                # shared routing: catalog, auth, orders, payments, admin
    ├── db.py                 # storage layer — SqliteDB (local) / KVDB (Cloudflare) / D1DB (retained)
    ├── schema.sql            # users / sessions / orders tables (local SQLite)
    ├── worker.py             # Cloudflare Python Worker entry point
    ├── local_server.py       # stdlib-only local server (same API, no pip installs)
    └── wrangler.toml         # Worker config (python_workers flag + KV binding)
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
       "payment":"COD","items":[{"id":1,"size":"40","qty":2}]}'
```

API endpoints: `GET /api/health`, `GET /api/products` (`?category=`, `?search=`,
`?sort=price-asc|price-desc|rating`), `GET /api/products/<id>`, `POST /api/orders`,
`GET /api/orders/mine`, `POST /api/payments/fake`, `POST /api/auth/signup`,
`POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`,
`POST /api/admin/login`, `GET /api/admin/stats`, `GET /api/admin/orders`,
`POST /api/admin/orders/<id>/status`.
Orders are validated (name, 10+ digit phone, address, known product ids, valid
sizes, qty 1–10, payment COD/UPI/CARD) and priced server-side; delivery is free
above ₹999, otherwise ₹49.

**Local storage:** the local server auto-creates `backend/rx3-local.db`
(SQLite, schema applied from `schema.sql`) on first run — delete the file to
reset all users/orders. Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars to
override the demo admin login.

**Demo credentials & test payments:**

- Admin dashboard (footer → Admin): `admin@rx3clothing.com` / `rx3admin`
- Fake gateway success card: `4111 1111 1111 1111` (any name / expiry / CVV)
- Fake gateway decline card: `4000 0000 0000 0002` (payment fails, order stays
  payable — retry with the success card)
- UPI: any ID containing `@`, e.g. `test@okhdfc`

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

# 1. Storage: a Cloudflare KV namespace ("rx3-kv") is already created and its
#    id is wired into wrangler.toml ([[kv_namespaces]], binding "KV") — no
#    database creation or schema step is needed. Production uses KV because
#    the account reached the free-plan limit of 10 D1 databases; db.py
#    retains a D1DB implementation (same interface) if you switch back.

# 2. Set the admin dashboard credentials as secrets (recommended —
#    without them the local demo defaults admin@rx3clothing.com / rx3admin apply)
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD

# 3. Deploy
npx wrangler deploy    # → https://vastra-api.<your-subdomain>.workers.dev
```

`wrangler.toml` already sets `main = "worker.py"`, the `python_workers`
compatibility flag and the `KV` namespace binding; `worker.py` + `app.py` +
`db.py` + `catalog.py` are bundled together.

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

- Payments are a **demo gateway** ("RX3 SecurePay") — UPI/card flows, success
  and decline paths are simulated by `POST /api/payments/fake`; no real payment
  gateway is wired up and no real money moves.
- Users, sessions and orders **persist** — SQLite (`rx3-local.db`, schema
  from `schema.sql`) locally, Cloudflare KV in production (records stored as
  JSON under `user:` / `session:` / `order:` keys, with `users:index` /
  `orders:index` lists). Production uses KV because the account hit the
  free-plan limit of 10 D1 databases; `db.py` keeps the `D1DB` implementation
  behind the same interface, so switching back only needs a free D1 slot,
  the schema applied, and the binding/worker change. Passwords are stored as
  PBKDF2-HMAC-SHA256 hashes with per-user salts; sessions are opaque tokens
  (admin sessions are flagged `is_admin`).
- The catalog itself still ships in code (`catalog.py`); move it into the
  database too if it needs to be editable without redeploying.
- Product photos are served from Unsplash CDN URLs.
