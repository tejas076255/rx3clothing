-- RX3 database schema — shared by local SQLite (auto-applied by db.py)
-- and Cloudflare D1 (apply with: wrangler d1 execute rx3-db --remote --file=backend/schema.sql)

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    pass_salt TEXT,
    pass_hash TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    user_id INTEGER,
    customer_name TEXT,
    phone TEXT,
    address TEXT,
    items_json TEXT,
    subtotal INTEGER,
    mrp_total INTEGER,
    savings INTEGER,
    delivery INTEGER,
    total INTEGER,
    payment_method TEXT,
    payment_id TEXT,
    payment_status TEXT,
    status TEXT,
    created_at TEXT
);
