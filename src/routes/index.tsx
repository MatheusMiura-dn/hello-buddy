import { useMemo, useState } from "react";
import { ChevronDown, Search, ShoppingBag, SlidersHorizontal, Star, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { products, type Category, type Product } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { CartDrawer } from "../components/CartDrawer";
import { useCart } from "../hooks/useCart";
import { createOrder } from "../lib/orders.server";

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { items, add, change, remove, clear, count } = useCart();

  const filtered = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "Todos" || product.category === category;
    const term = search.toLowerCase().trim();
    return matchesCategory && (!term || `${product.name} ${product.category} ${product.code}`.toLowerCase().includes(term));
  }), [category, search]);

  const featured = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);
  const brands = ["THE ARCHIVE", "ATELIER 01", "FORME", "ESSENTIALS", "NOIR", "STUDIO 06"];

  const addProduct = (product: Product) => { add(product); setCartOpen(true); };
  const startCheckout = () => { if (items.length) { setCartOpen(false); setCheckoutOpen(true); } };

  async function checkout(event: React.FormEvent) {
    event.preventDefault();
    if (!items.length || checkoutBusy || !customerName.trim() || !customerEmail.trim()) return;
    setCheckoutBusy(true);
    try {
      const result = await createOrder({
        data: {
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          totalCents: Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100),
          items: items.map((item) => ({ productId: item.id, productName: item.name, quantity: item.quantity, unitPriceCents: Math.round(item.price * 100) })),
        },
      });
      clear(); setCheckoutOpen(false); setOrderCode(result.code); setCustomerName(""); setCustomerEmail("");
    } catch (error) {
      console.error(error);
      alert("Não foi possível registrar o pedido. Verifique a configuração do banco de dados.");
    } finally { setCheckoutBusy(false); }
  }

  return (
    <main>
      <div className="announcement">ENVIO GRÁTIS EM PEDIDOS ACIMA DE R$ 399 <span>•</span> NOVA CURADORIA THE ARCHIVE</div>
      <header className="site-header" id="top">
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu"><SlidersHorizontal size={19}/></button>
        <a className="brand" href="#top">THE ARCHIVE<span>.</span></a>
        <nav className={menuOpen ? "main-nav open" : "main-nav"}>
          <a href="#colecao">Shop</a><a href="#novidades">Novidades</a><a href="#marcas">Marcas</a><a href="#sobre">Sobre</a><a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions"><label className="search-box"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar peças" /></label><button className="bag-button" onClick={() => setCartOpen(true)} aria-label="Abrir carrinho"><ShoppingBag size={19}/>{count > 0 && <span>{count}</span>}</button></div>
      </header>

      <section className="hero"><div className="hero-copy"><p className="eyebrow">EST. 2026 • CURATED CLOTHING</p><h1>O essencial,<br/><em>bem escolhido.</em></h1><p>Uma seleção de roupas e acessórios com estética contemporânea, materiais selecionados e aquela sensação de peça que você vai continuar usando.</p><a href="#colecao" className="hero-button">Explorar coleção</a></div><div className="hero-image"><img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1600&q=90" alt="Coleção The Archive"/><div className="hero-caption">THE ARCHIVE / DROP 01</div></div></section>

      <section className="trust-strip"><div><strong>CURADORIA</strong><span>Peças selecionadas</span></div><div><strong>QUALIDADE</strong><span>Materiais e acabamento</span></div><div><strong>ENVIO</strong><span>Compra simples e segura</span></div><div><strong>ATENDIMENTO</strong><span>Suporte ao cliente</span></div></section>

      <section className="collection" id="colecao"><div className="section-heading"><div><p className="eyebrow">SELEÇÃO 01</p><h2>Shop the archive</h2></div><p>{filtered.length} peças</p></div><div className="category-bar">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="products-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={addProduct} onOpen={setSelected}/>)}</div>{filtered.length === 0 && <div className="empty-results">Nenhuma peça encontrada.<button onClick={() => {setSearch("");setCategory("Todos")}}>Limpar filtros</button></div>}</section>

      <section className="editorial"><div className="editorial-image"><img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85" alt="Editorial The Archive"/></div><div><p className="eyebrow">THE ARCHIVE EDIT</p><h2>Vista menos.<br/><em>Escolha melhor.</em></h2><p>Construímos a coleção em torno de peças que combinam entre si. O resultado é um guarda-roupa mais simples, versátil e com identidade.</p><a className="text-link" href="#novidades">Ver seleção →</a></div></section>

      <section className="collection secondary" id="novidades"><div className="section-heading"><div><p className="eyebrow">DROP 01</p><h2>Novidades</h2></div><p>Recém-chegadas</p></div><div className="products-grid">{newArrivals.map((product) => <ProductCard key={product.id} product={product} onAdd={addProduct} onOpen={setSelected}/>)}</div></section>

      <section className="brand-section" id="marcas"><div className="section-heading"><div><p className="eyebrow">CURATED BY</p><h2>Marcas & linhas</h2></div></div><div className="brand-grid">{brands.map((brand, i) => <button key={brand} onClick={() => { setSearch(brand === "THE ARCHIVE" ? "" : brand.split(" ")[0]); document.getElementById("colecao")?.scrollIntoView({ behavior: "smooth" }); }}><span>0{i + 1}</span><strong>{brand}</strong></button>)}</div></section>

      <section className="social-proof"><div><p className="eyebrow">THE COMMUNITY</p><h2>Escolhas reais.<br/><em>Estilo pessoal.</em></h2></div><div className="review-grid"><article><div className="stars"><Star/><Star/><Star/><Star/><Star/></div><p>“A seleção é muito fácil de combinar e a experiência de compra é bem direta.”</p><strong>Cliente The Archive</strong></article><article><div className="stars"><Star/><Star/><Star/><Star/><Star/></div><p>“Gostei principalmente da apresentação das peças. Tudo parece pensado nos detalhes.”</p><strong>Cliente The Archive</strong></article><article><div className="stars"><Star/><Star/><Star/><Star/><Star/></div><p>“Uma proposta diferente de loja de roupa, sem ficar exagerada.”</p><strong>Cliente The Archive</strong></article></div></section>

      <section className="manifesto" id="sobre"><div><p className="eyebrow">OUR APPROACH</p><h2>Menos excesso.<br/><em>Mais escolha.</em></h2></div><p>A The Archive nasceu para reunir peças versáteis que permanecem relevantes. Em vez de seguir cada tendência, selecionamos materiais, cortes e detalhes que funcionam hoje e continuam funcionando amanhã.</p></section>

      <section className="faq-section" id="faq"><div><p className="eyebrow">NEED TO KNOW</p><h2>Perguntas frequentes</h2><p>Informações rápidas para comprar com mais tranquilidade.</p></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><ChevronDown size={18}/></button>{openFaq === index && <p>{answer}</p>}</div>)}</div></section>

      <footer><div><a className="brand" href="#top">THE ARCHIVE<span>.</span></a><p>Curadoria de moda contemporânea.</p></div><div className="footer-links"><a href="#colecao">Shop</a><a href="#marcas">Marcas</a><a href="#sobre">Sobre</a><a href="#faq">FAQ</a><a href="/admin/pedidos">Área administrativa</a></div><small>© 2026 The Archive. Todos os direitos reservados.</small></footer>

      <CartDrawer items={items} open={cartOpen} onClose={() => setCartOpen(false)} onChange={change} onRemove={remove} onCheckout={startCheckout} checkoutBusy={checkoutBusy}/>
      {selected && <div className="modal-overlay" onClick={() => setSelected(null)}><div className="product-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X/></button><img src={selected.image} alt={selected.name}/><div className="modal-copy"><p className="eyebrow">{selected.category} • {selected.code}</p><h2>{selected.name}</h2><p>{selected.description}</p><strong>R$ {selected.price.toFixed(2).replace('.', ',')}</strong><div className="size-list">{selected.sizes.map((size) => <span key={size}>{size}</span>)}</div><button className="checkout-button" onClick={() => addProduct(selected)}>Adicionar ao carrinho</button></div></div></div>}
      {checkoutOpen && <div className="modal-overlay"><form className="checkout-modal" onSubmit={checkout}><button type="button" className="modal-close" onClick={() => setCheckoutOpen(false)}><X/></button><p className="eyebrow">FINALIZAR PEDIDO</p><h2>Seus dados</h2><p>Informe nome e e-mail para registrar a compra no painel administrativo.</p><label>Nome completo<input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Seu nome" /></label><label>E-mail<input required type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="voce@email.com" /></label><div className="checkout-summary"><span>{count} {count === 1 ? "item" : "itens"}</span><strong>R$ {items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2).replace('.', ',')}</strong></div><button className="checkout-button" disabled={checkoutBusy}>{checkoutBusy ? "Registrando pedido..." : "Confirmar pedido"}</button></form></div>}
      {orderCode && <div className="modal-overlay"><div className="order-success"><p className="eyebrow">PEDIDO REGISTRADO</p><h2>Compra confirmada.</h2><p>Guarde este código. Ele identifica exclusivamente este pedido.</p><div className="order-code">{orderCode}</div><small>Seu pedido já está disponível no painel administrativo.</small><button className="checkout-button" onClick={() => setOrderCode(null)}>Continuar</button></div></div>}
    </main>
  );
}
