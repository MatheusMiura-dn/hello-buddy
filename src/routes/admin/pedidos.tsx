import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { findOrder } from "../../lib/orders.server";

export const Route = createFileRoute("/admin/pedidos")({ component: OrdersAdmin });

function OrdersAdmin() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function searchOrder(event: React.FormEvent) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    setLoading(true);
    setMessage("");
    setOrder(null);
    try {
      const result = await findOrder({ data: { code: normalized } });
      if (!result) setMessage("Nenhum pedido encontrado com esse código.");
      else setOrder(result);
    } catch {
      setMessage("Não foi possível consultar o pedido. Verifique o banco de dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <a className="brand" href="/">THE ARCHIVE<span>.</span></a>
        <div className="admin-heading"><p className="eyebrow">ADMINISTRATIVO</p><h1>Consultar pedido</h1><p>Pesquise pelo código único no formato TA-XXXXXX.</p></div>
        <form className="admin-search" onSubmit={searchOrder}>
          <Search size={18}/><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="TA-8F4K29" maxLength={9} /><button disabled={loading}>{loading ? "Buscando..." : "Pesquisar"}</button>
        </form>
        {message && <div className="admin-message">{message}</div>}
        {order && <section className="order-panel">
          <div className="order-panel-header"><div><p className="eyebrow">CÓDIGO DO PEDIDO</p><h2>{order.code}</h2></div><span>{order.status}</span></div>
          <div className="order-meta"><div><small>Data</small><strong>{new Date(String(order.created_at)).toLocaleString("pt-BR")}</strong></div><div><small>Cliente</small><strong>{String(order.customer_name ?? "Não informado")}</strong></div><div><small>E-mail</small><strong>{String(order.customer_email ?? "Não informado")}</strong></div><div><small>Total</small><strong>R$ {(Number(order.total_cents) / 100).toFixed(2).replace('.', ',')}</strong></div></div>
          <div className="admin-items"><h3>Itens do pedido</h3>{order.items.map((item: any) => <div className="admin-item" key={`${item.product_id}-${item.quantity}`}><span>{String(item.product_name)} × {String(item.quantity)}</span><strong>R$ {((Number(item.unit_price_cents) * Number(item.quantity)) / 100).toFixed(2).replace('.', ',')}</strong></div>)}</div>
        </section>}
      </div>
    </main>
  );
}
