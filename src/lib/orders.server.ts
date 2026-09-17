import { createClient } from "@libsql/client/web";
import { randomInt } from "node:crypto";
import { z } from "zod";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ORDER_CODE_LENGTH = 6;
const orderStatuses = ["pending", "processing", "shipped", "completed", "cancelled"] as const;

export const itemInput = z.object({ productId: z.string().min(1), productName: z.string().min(1), quantity: z.number().int().positive().max(99), unitPriceCents: z.number().int().nonnegative() });
export const createOrderInput = z.object({ items: z.array(itemInput).min(1).max(50), totalCents: z.number().int().positive(), customerName: z.string().trim().min(1).max(120).optional(), customerEmail: z.string().email().max(180).optional() });
export const adminInput = z.object({ adminToken: z.string().min(1) });
export const codeInput = z.object({ code: z.string().regex(/^TA-[A-Z0-9]{6}$/), adminToken: z.string().min(1) });
export const publicCodeInput = z.object({ code: z.string().regex(/^TA-[A-Z0-9]{6}$/) });
export const updateOrderInput = z.object({ code: z.string().regex(/^TA-[A-Z0-9]{6}$/), status: z.enum(orderStatuses), adminToken: z.string().min(1) });

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

export async function createOrderServer(data: z.infer<typeof createOrderInput>) {
  const calculatedTotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
  if (calculatedTotal !== data.totalCents) throw new Error("Total do pedido inválido.");
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
}

function assertAdmin(token: string) {
  if (!process.env.ADMIN_PANEL_TOKEN || token !== process.env.ADMIN_PANEL_TOKEN) throw new Error("Não autorizado.");
}

async function getOrder(db: ReturnType<typeof createClient>, code: string) {
  const order = await db.execute({ sql: "SELECT code, total_cents, customer_name, customer_email, status, created_at FROM orders WHERE code = ?", args: [code] });
  if (!order.rows[0]) return null;
  const items = await db.execute({ sql: "SELECT product_id, product_name, quantity, unit_price_cents FROM order_items WHERE order_code = ? ORDER BY id", args: [code] });
  return { ...order.rows[0], items: items.rows };
}

export async function listOrdersServer(data: z.infer<typeof adminInput>) {
  assertAdmin(data.adminToken);
  const db = await ensureSchema();
  const result = await db.execute({ sql: `SELECT code, total_cents, customer_name, customer_email, status, created_at FROM orders ORDER BY datetime(created_at) DESC`, args: [] });
  return result.rows;
}

export async function findOrderServer(data: z.infer<typeof codeInput>) {
  assertAdmin(data.adminToken);
  return getOrder(await ensureSchema(), data.code);
}

export async function findPublicOrderServer(data: z.infer<typeof publicCodeInput>) {
  const order = await getOrder(await ensureSchema(), data.code);
  if (!order) return null;
  return { ...order, customer_email: order.customer_email ? String(order.customer_email).replace(/(^.).*(@.*$)/, "$1••••$2") : null };
}

export async function updateOrderStatusServer(data: z.infer<typeof updateOrderInput>) {
  assertAdmin(data.adminToken);
  const db = await ensureSchema();
  await db.execute({ sql: "UPDATE orders SET status = ? WHERE code = ?", args: [data.status, data.code] });
  return { ok: true };
}
