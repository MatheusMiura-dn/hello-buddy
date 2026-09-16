import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { findOrder } from "../../lib/orders.server";

export const Route = createFileRoute("/admin/pedidos")({ component: OrdersAdmin });

type OrderResult = { code: string; total_cents: number; customer_name: string | null; customer_email: string | null; status: string; created_at: string; items: Array<{ product_id: string; product_name: string; quantity: number; unit_price_cents: number }> };

function OrdersAdmin() {
  const [code, setCode] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function searchOrder(event: FormEvent) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    setLoading(true);
    setMessage("");
    setOrder(null);
    try {
      const result = await findOrder({ data: { code: normalized, adminToken } });
      if (!result) setMessage("Nenhum pedido encontrado com esse código.");
      else setOrder(result as OrderResult);
    } catch {
      setMessage("Não autorizado ou não foi possível consultar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "70px 6vw", background: "#f7f5f0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <a className="brand" href="/">THE ARCHIVE<span>.</span></a>
        <div style={{ margin: "70px 0 35px" }}><p className="eyebrow">ADMINISTRATIVO</p><h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 500, margin: 0 }}>Consultar pedido</h1><p style={{ color: "#77736d" }}>Pesquise pelo código único no formato TA-XXXXXX.</p></div>
        <form onSubmit={searchOrder} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 25 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #d9d5ce", padding: "0 14px", background: "#fff" }}><Search size={18}/><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="TA-8F4K29" maxLength={9} style={{ border: 0, outline: 0, width: "100%", padding: 15, background: "transparent" }} /></label>
          <input value={adminToken} onChange={(e) => setAdminToken(e.target.value)} type="password" placeholder="Token administrativo" style={{ border: "1px solid #d9d5ce", padding: 15, outline: 0 }} />
          <button disabled={loading} style={{ border: 0, background: "#171717", color: "#fff", padding: "0 24px" }}>{loading ? "Buscando..." : "Pesquisar"}</button>
        </form>
        {message && <div style={{ padding: 18, border: "1px solid #d9d5ce", background: "#fff", marginBottom: 20 }}>{message}</div>}
        {order && <section style={{ border: "1px solid #d9d5ce", background: "#fff", padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "start", borderBottom: "1px solid #d9d5ce", paddingBottom: 20 }}><div><p className="eyebrow">CÓDIGO DO PEDIDO</p><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, margin: 0 }}>{order.code}</h2></div><span>{order.status}</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, padding: "25px 0", borderBottom: "1px solid #d9d5ce" }}>{[["Data", new Date(order.created_at).toLocaleString("pt-BR")],["Cliente", order.customer_name ?? "Não informado"],["E-mail", order.customer_email ?? "Não informado"],["Total", `R$ ${(Number(order.total_cents) / 100).toFixed(2).replace('.', ',')}`]].map(([label, value]) => <div key={label}><small style={{ color: "#77736d" }}>{label}</small><strong style={{ display: "block", marginTop: 6 }}>{value}</strong></div>)}</div>
          <h3>Itens do pedido</h3>{order.items.map((item) => <div key={`${item.product_id}-${item.quantity}`} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid #eee" }}><span>{item.product_name} × {item.quantity}</span><strong>R$ {((Number(item.unit_price_cents) * Number(item.quantity)) / 100).toFixed(2).replace('.', ',')}</strong></div>)}
        </section>}
      </div>
    </main>
  );
}
