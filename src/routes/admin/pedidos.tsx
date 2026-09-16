import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clipboard, Package, Search, ShoppingBag, Truck, XCircle } from "lucide-react";
import { findOrder, listOrders, updateOrderStatus } from "../../lib/orders.server";

export const Route = createFileRoute("/admin/pedidos")({ component: OrdersAdmin });

type OrderRow = { code: string; total_cents: number; customer_name: string | null; customer_email: string | null; status: string; created_at: string };
type OrderResult = OrderRow & { items: Array<{ product_id: string; product_name: string; quantity: number; unit_price_cents: number }> };

const statusLabels: Record<string, string> = { pending: "Pendente", processing: "Preparando", shipped: "Enviado", completed: "Concluído", cancelled: "Cancelado" };

function money(cents: number) { return `R$ ${(Number(cents) / 100).toFixed(2).replace(".", ",")}`; }
function date(value: string) { return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); }

function OrdersAdmin() {
  const [token, setToken] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selected, setSelected] = useState<OrderResult | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadOrders(currentToken = token) {
    if (!currentToken) return;
    setLoading(true); setMessage("");
    try { setOrders((await listOrders({ data: { adminToken: currentToken } })) as OrderRow[]); setTokenSaved(true); }
    catch { setMessage("Token inválido ou banco de dados não configurado."); setOrders([]); setTokenSaved(false); }
    finally { setLoading(false); }
  }

  useEffect(() => { const saved = sessionStorage.getItem("the-archive-admin-token"); if (saved) { setToken(saved); loadOrders(saved); } }, []);

  async function openOrder(code: string) {
    setLoading(true); setMessage("");
    try { setSelected((await findOrder({ data: { code, adminToken: token } })) as OrderResult | null); }
    catch { setMessage("Não foi possível abrir este pedido."); }
    finally { setLoading(false); }
  }

  async function changeStatus(code: string, status: "pending" | "processing" | "shipped" | "completed" | "cancelled") {
    try { await updateOrderStatus({ data: { code, status, adminToken: token } }); await loadOrders(); if (selected?.code === code) setSelected({ ...selected, status }); }
    catch { setMessage("Não foi possível atualizar o status."); }
  }

  const filtered = useMemo(() => orders.filter((order) => {
    const text = `${order.code} ${order.customer_name ?? ""} ${order.customer_email ?? ""}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === "all" || order.status === statusFilter);
  }), [orders, query, statusFilter]);

  const stats = useMemo(() => ({ total: orders.length, pending: orders.filter((o) => o.status === "pending").length, shipped: orders.filter((o) => o.status === "shipped").length, revenue: orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total_cents), 0) }), [orders]);

  function login(event: FormEvent) { event.preventDefault(); sessionStorage.setItem("the-archive-admin-token", token); loadOrders(token); }

  if (!tokenSaved) return (
    <main className="admin-page admin-login">
      <div className="admin-login-card"><a className="brand" href="/">THE ARCHIVE<span>.</span></a><p className="eyebrow">ÁREA RESTRITA</p><h1>Painel administrativo</h1><p>Entre com o token administrativo configurado no servidor para acessar os pedidos.</p><form onSubmit={login}><input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Token administrativo" autoFocus /><button className="admin-primary" disabled={loading}>{loading ? "Entrando..." : "Acessar painel"}</button></form>{message && <div className="admin-message">{message}</div>}<a className="admin-back" href="/"><ArrowLeft size={15}/> Voltar para a loja</a></div>
    </main>
  );

  return (
    <main className="admin-page">
      <header className="admin-topbar"><div><a className="brand" href="/">THE ARCHIVE<span>.</span></a><span className="admin-badge">ADMIN</span></div><button onClick={() => { sessionStorage.removeItem("the-archive-admin-token"); setTokenSaved(false); setToken(""); }}>Sair</button></header>
      <div className="admin-shell">
        <div className="admin-heading"><div><p className="eyebrow">COMMAND CENTER</p><h1>Pedidos</h1><p>Acompanhe vendas, clientes e status dos pedidos em um só lugar.</p></div><button className="admin-refresh" onClick={() => loadOrders()} disabled={loading}>↻ Atualizar</button></div>
        <div className="admin-stats"><div><ShoppingBag/><span>Pedidos</span><strong>{stats.total}</strong></div><div><Package/><span>Pendentes</span><strong>{stats.pending}</strong></div><div><Truck/><span>Enviados</span><strong>{stats.shipped}</strong></div><div><CheckCircle2/><span>Vendas</span><strong>{money(stats.revenue)}</strong></div></div>
        {message && <div className="admin-message">{message}</div>}
        <section className="admin-panel"><div className="admin-toolbar"><label><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar código, cliente ou e-mail" /></label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">Todos os status</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
          <div className="admin-table-wrap"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Status</th><th>Total</th><th></th></tr></thead><tbody>{filtered.map((order) => <tr key={order.code}><td><button className="order-link" onClick={() => openOrder(order.code)}>{order.code}</button></td><td><strong>{order.customer_name || "Cliente não informado"}</strong><small>{order.customer_email || "—"}</small></td><td>{date(order.created_at)}</td><td><span className={`status status-${order.status}`}>{statusLabels[order.status] ?? order.status}</span></td><td><strong>{money(order.total_cents)}</strong></td><td><button className="view-button" onClick={() => openOrder(order.code)}>Ver</button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="admin-empty">Nenhum pedido encontrado.</div>}</div>
        </section>

        {selected && <div className="admin-detail"><div className="detail-header"><div><p className="eyebrow">PEDIDO</p><h2>{selected.code}</h2><span>{date(selected.created_at)}</span></div><button onClick={() => setSelected(null)}>Fechar</button></div><div className="detail-grid"><div><span>Cliente</span><strong>{selected.customer_name || "Não informado"}</strong></div><div><span>E-mail</span><strong>{selected.customer_email || "Não informado"}</strong></div><div><span>Total</span><strong>{money(selected.total_cents)}</strong></div><div><span>Status</span><strong>{statusLabels[selected.status] ?? selected.status}</strong></div></div><div className="detail-actions"><button onClick={() => { navigator.clipboard?.writeText(selected.code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}><Clipboard size={15}/> {copied ? "Copiado" : "Copiar código"}</button><select value={selected.status} onChange={(e) => changeStatus(selected.code, e.target.value as "pending" | "processing" | "shipped" | "completed" | "cancelled")}><option value="pending">Pendente</option><option value="processing">Preparando</option><option value="shipped">Enviado</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select></div><h3>Itens</h3><div className="detail-items">{selected.items.map((item, index) => <div key={`${item.product_id}-${index}`}><span>{item.product_name}<small>{item.quantity} × {money(item.unit_price_cents)}</small></span><strong>{money(item.quantity * item.unit_price_cents)}</strong></div>)}</div></div>}
      </div>
    </main>
  );
}
