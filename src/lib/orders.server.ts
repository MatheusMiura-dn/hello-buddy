import { createClient } from "@libsql/client/web";
import { randomInt } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ORDER_CODE_LENGTH = 6;

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error("Banco de pedidos não configurado. Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN.");
  return createClient({ url, authToken });
}

async function ensureSchema() {
  const db = getDb();
  await db.batch([
    { sql: `CREATE TABLE IF NOT EXISTS order_code_reservations (code TEXT PRIMARY KEY, created_at TEXT NOT NULL)`, args: [] },
    { sql: `CREATE TABLE IF NOT EXISTS orders (code TEXT PRIMARY KEY, total_cents INTEGER NOT NULL, customer_name TEXT, customer_email TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, FOREIGN KEY (code) REFERENCES order_code_reservations(code))`, args: [] },
    { sql: `CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_code TEXT NOT NULL, product_id TEXT NOT NULL, product_name TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price_cents INTEGER NOT NULL, FOREIGN KEY (order_code) REFERENCES orders(code))`, args: [] },
  ]);
  return db;
}

function randomOrderCode() {
  let code = "TA-";
  for (let i = 0; i < ORDER_CODE_LENGTH; i += 1) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

const createOrderInput = z.object({
  items: z.array(z.object({ productId: z.string().min(1), productName: z.string().min(1), quantity: z.number().int().positive(), unitPriceCents: z.number().int().nonnegative() })).min(1),
  totalCents: z.number().int().positive(),
  customerName: z.string().trim().min(1).max(120).optional(),
  customerEmail: z.string().email().max(180).optional(),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator(createOrderInput)
  .handler(async ({ data }) => {
    const db = await ensureSchema();
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = randomOrderCode();
      const now = new Date().toISOString();
      try {
        await db.execute({ sql: "INSERT INTO order_code_reservations (code, created_at) VALUES (?, ?)", args: [code, now] });
        await db.batch([
          { sql: `INSERT INTO orders (code, total_cents, customer_name, customer_email, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)`, args: [code, data.totalCents, data.customerName ?? null, data.customerEmail ?? null, now] },
          ...data.items.map((item) => ({ sql: `INSERT INTO order_items (order_code, product_id, product_name, quantity, unit_price_cents) VALUES (?, ?, ?, ?, ?)`, args: [code, item.productId, item.productName, item.quantity, item.unitPriceCents] })),
        ]);
        return { code };
      } catch (error) {
        if (String(error).toLowerCase().includes("unique") || String(error).toLowerCase().includes("constraint")) continue;
        throw error;
      }
    }
    throw new Error("Não foi possível gerar um código único para o pedido.");
  });

export const findOrder = createServerFn({ method: "GET" })
  .inputValidator(z.object({ code: z.string().regex(/^TA-[A-Z0-9]{6}$/), adminToken: z.string().min(1) }))
  .handler(async ({ data }) => {
    if (!process.env.ADMIN_PANEL_TOKEN || data.adminToken !== process.env.ADMIN_PANEL_TOKEN) throw new Error("Não autorizado.");
    const db = await ensureSchema();
    const order = await db.execute({ sql: "SELECT code, total_cents, customer_name, customer_email, status, created_at FROM orders WHERE code = ?", args: [data.code] });
    if (!order.rows[0]) return null;
    const items = await db.execute({ sql: "SELECT product_id, product_name, quantity, unit_price_cents FROM order_items WHERE order_code = ? ORDER BY id", args: [data.code] });
    return { ...order.rows[0], items: items.rows };
  });
