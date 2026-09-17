import { useMemo, useState, type FormEvent } from "react";
import { ChevronDown, Search, ShoppingBag, SlidersHorizontal, Star, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { products, type Category, type Product } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { CartDrawer } from "../components/CartDrawer";
import { useCart } from "../hooks/useCart";
import { createOrder } from "../lib/orders.functions";
import "../archive.css";

export const Route = createFileRoute("/")({ component: Index });
const categories: Category[] = ["Todos", "Camisas", "Calças", "Casacos", "Acessórios"];
const faqs = [
  ["Quanto tempo leva para meu pedido chegar?", "O prazo varia conforme o endereço e aparece na etapa de compra. Depois do envio, o código de acompanhamento é informado quando disponível."],
  ["Posso trocar uma peça?", "Sim. A solicitação de troca deve seguir a política da loja e as condições informadas no atendimento."],
  ["Como escolho meu tamanho?", "Confira os tamanhos disponíveis na página do produto. Para cada peça, priorizamos informações claras sobre modelagem."],
  ["Como acompanho meu pedido?", "Seu pedido recebe um código exclusivo no formato TA-XXXXXX. Guarde esse código para consultar a compra no painel."],
];

function Index() {
  const [category, setCategory] = useState<Category>("Todos");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const { items, totalCents, addItem, removeItem, updateQuantity, clearCart } = useCart();

  const filtered = useMemo(() => products.filter((product) => (category === "Todos" || product.category === category) && `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase())), [category, search]);
  const money = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

  async function checkout(event: FormEvent) {
    event.preventDefault();
    if (!items.length || !customerName.trim() || !customerEmail.trim()) return;
    setCheckoutBusy(true);
    try {
      const result = await createOrder({ data: { items: items.map((item) => ({ productId: item.product.id, productName: item.product.name, quantity: item.quantity, unitPriceCents: item.product.priceCents })), totalCents, customerName: customerName.trim(), customerEmail: customerEmail.trim() } });
      setOrderCode(result.code); clearCart(); setCheckoutOpen(false); setCartOpen(false);
    } catch { setOrderCode(null); alert("Não foi possível criar o pedido agora."); }
    finally { setCheckoutBusy(false); }
  }

  return <main className="site-shell">
    <div className="announcement">FRETE GRÁTIS ACIMA DE R$ 499 · THE ARCHIVE</div>
    <header className="site-header"><a className="brand" href="/">THE ARCHIVE<span>.</span></a><nav className={menuOpen ? "open" : ""}><a href="#colecao">Coleção</a><a href="#novidades">Novidades</a><a href="#sobre">Sobre</a><a href="/admin/pedidos">Admin</a></nav><div className="header-actions"><label className="search-box"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar" /></label><button className="icon-button" onClick={() => setCartOpen(true)} aria-label="Abrir carrinho"><ShoppingBag size={19}/>{items.length > 0 && <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>}</button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}><SlidersHorizontal size={18}/></button></div></header>
    <section className="hero"><div><p className="eyebrow">THE ARCHIVE · 2026</p><h1>Peças que permanecem.</h1><p>Uma seleção de roupas e acessórios para quem prefere presença sem excesso.</p><a className="primary-link" href="#colecao">Explorar coleção</a></div><div className="hero-mark">TA<span>/</span>01</div></section>
    <section className="trust-strip"><div><strong>Curadoria</strong><span>Peças selecionadas</span></div><div><strong>Envio</strong><span>Frete acima de R$ 499</span></div><div><strong>Atendimento</strong><span>Suporte dedicado</span></div><div><strong>Pedido</strong><span>Rastreamento por código</span></div></section>
    <section id="colecao" className="collection-section"><div className="section-heading"><div><p className="eyebrow">THE COLLECTION</p><h2>Seleção atual</h2></div><span>{filtered.length} peças</span></div><div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={() => addItem(product)} onOpen={() => setSelected(product)} />)}</div></section>
    <section id="novidades" className="editorial"><div><p className="eyebrow">NEW ARRIVALS</p><h2>Luxo discreto.<br/>Identidade forte.</h2><p>Silhuetas limpas, materiais escolhidos e detalhes que fazem sentido. A estética da The Archive nasce do equilíbrio entre clássico e contemporâneo.</p></div><div className="editorial-card"><span>ARCHIVE<br/>OBJECT 01</span><strong>EST. 2026</strong></div></section>
    <section id="sobre" className="manifesto"><p className="eyebrow">OUR MANIFESTO</p><h2>Menos tendência.<br/>Mais repertório.</h2><p>Construímos uma curadoria para atravessar temporadas. O foco está na peça, no caimento, no material e na forma como tudo conversa.</p></section>
    <section className="faq-section"><div className="section-heading"><div><p className="eyebrow">FAQ</p><h2>Dúvidas frequentes</h2></div></div><div className="faq-grid">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={17}/></summary><p>{answer}</p></details>)}</div></section>
    <footer className="site-footer"><div><a className="brand" href="/">THE ARCHIVE<span>.</span></a><p>Moda premium, curadoria e identidade.</p></div><div><span>SHOP</span><a href="#colecao">Coleção</a><a href="#novidades">Novidades</a><a href="/pedido">Rastrear pedido</a></div><div><span>INFO</span><a href="#sobre">Sobre</a><a href="/admin/pedidos">Admin</a></div><small>© 2026 THE ARCHIVE. Todos os direitos reservados.</small></footer>
    <CartDrawer open={cartOpen} items={items} total={totalCents} onClose={() => setCartOpen(false)} onRemove={removeItem} onUpdateQuantity={updateQuantity} onCheckout={() => setCheckoutOpen(true)} />
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="product-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X size={18}/></button><p className="eyebrow">THE ARCHIVE</p><h2>{selected.name}</h2><p>{selected.description}</p><strong>{money(selected.priceCents)}</strong><button className="primary-button" onClick={() => { addItem(selected); setSelected(null); setCartOpen(true); }}>Adicionar ao carrinho</button></div></div>}
    {checkoutOpen && <div className="modal-backdrop"><form className="checkout-modal" onSubmit={checkout}><button type="button" className="modal-close" onClick={() => setCheckoutOpen(false)}><X size={18}/></button><p className="eyebrow">CHECKOUT</p><h2>Finalizar pedido</h2><p>Informe seus dados para gerar o código da compra.</p><input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome completo"/><input required type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="E-mail"/><div className="checkout-total"><span>Total</span><strong>{money(totalCents)}</strong></div><button className="primary-button" disabled={checkoutBusy}>{checkoutBusy ? "Gerando pedido..." : "Confirmar pedido"}</button></form></div>}
    {orderCode && <div className="modal-backdrop"><div className="success-modal"><p className="eyebrow">PEDIDO CONFIRMADO</p><h2>{orderCode}</h2><p>Seu pedido foi registrado. Guarde este código para acompanhar o status.</p><a className="primary-link" href={`/pedido?code=${orderCode}`}>Acompanhar pedido</a><button className="text-button" onClick={() => setOrderCode(null)}>Fechar</button></div></div>}
  </main>;
}
