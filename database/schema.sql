CREATE TABLE IF NOT EXISTS order_code_reservations (
  code TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  code TEXT PRIMARY KEY,
  total_cents INTEGER NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (code) REFERENCES order_code_reservations(code)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_code TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  FOREIGN KEY (order_code) REFERENCES orders(code)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_code ON order_items(order_code);
