import { useMemo, useState } from "react";
import { Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { products, type Category, type Product } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { CartDrawer } from "../components/CartDrawer";
import { useCart } from "../hooks/useCart";

export const Route = createFileRoute("/")({ component: Index });

const categories: Category[] = ["Todos", "Camisas", "Calças", "Casacos", "Acessórios"];

function Index() {
  const [category, setCategory] = useState<Category>("Todos");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { items, add, change, remove, count } = useCart();

  const filtered = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "Todos" || product.category === category;
    const term = search.toLowerCase().trim();
    return matchesCategory && (!term || `${product.name} ${product.category}`.toLowerCase().includes(term));
  }), [category, search]);

  const addProduct = (product: Product) => { add(product); setCartOpen(true); };

  return (
    <main>
      <div className="announcement">ENVIO GRÁTIS EM PEDIDOS ACIMA DE R$ 399 • CURADORIA THE ARCHIVE</div>
      <header className="site-header">
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><SlidersHorizontal size={19}/></button>
        <a className="brand" href="#top">THE ARCHIVE<span>.</span></a>
        <nav className={menuOpen ? "main-nav open" : "main-nav"}>
          <a href="#colecao">Coleção</a><a href="#novidades">Novidades</a><a href="#sobre">Sobre</a>
        </nav>
        <div className="header-actions">
          <label className="search-box"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar peças" /></label>
          <button className="bag-button" onClick={() => setCartOpen(true)} aria-label="Abrir carrinho"><ShoppingBag size={19}/>{count > 0 && <span>{count}</span>}</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy"><p className="eyebrow">EST. 2026 • CURATED CLOTHING</p><h1>Peças que não<br/><em>seguem o tempo.</em></h1><p>Uma seleção de clássicos contemporâneos, feita para quem valoriza qualidade, simplicidade e personalidade.</p><a href="#colecao" className="hero-button">Explorar coleção</a></div>
        <div className="hero-image"><img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=90" alt="Coleção The Archive"/><div className="hero-caption">THE ARCHIVE / 001</div></div>
      </section>

      <section className="intro-strip" id="novidades"><p>THE ARCHIVE</p><span>Luxo discreto, materiais selecionados e design atemporal.</span><p>EST. 2026</p></section>

      <section className="collection" id="colecao">
        <div className="section-heading"><div><p className="eyebrow">SELEÇÃO 01</p><h2>A coleção</h2></div><p>{filtered.length} peças selecionadas</p></div>
        <div className="category-bar">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="products-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={addProduct} onOpen={setSelected}/>)}</div>
        {filtered.length === 0 && <div className="empty-results">Nenhuma peça encontrada.<button onClick={() => {setSearch("");setCategory("Todos")}}>Limpar filtros</button></div>}
      </section>

      <section className="manifesto" id="sobre"><div><p className="eyebrow">OUR APPROACH</p><h2>Menos excesso.<br/><em>Mais escolha.</em></h2></div><p>A The Archive nasceu para reunir peças versáteis que permanecem relevantes. Em vez de seguir cada tendência, selecionamos materiais, cortes e detalhes que funcionam hoje e continuam funcionando amanhã.</p></section>
      <footer><div><a className="brand" href="#top">THE ARCHIVE<span>.</span></a><p>Curadoria de moda contemporânea.</p></div><div className="footer-links"><a href="#colecao">Shop</a><a href="#sobre">Sobre</a><a href="#top">Privacidade</a><a href="#top">Contato</a></div><small>© 2026 The Archive. Todos os direitos reservados.</small></footer>

      <CartDrawer items={items} open={cartOpen} onClose={() => setCartOpen(false)} onChange={change} onRemove={remove}/>
      {selected && <div className="modal-overlay" onClick={() => setSelected(null)}><div className="product-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X/></button><img src={selected.image} alt={selected.name}/><div className="modal-copy"><p className="eyebrow">{selected.category} • {selected.code}</p><h2>{selected.name}</h2><p>{selected.description}</p><strong>R$ {selected.price.toFixed(2).replace('.', ',')}</strong><div className="size-list">{selected.sizes.map((size) => <span key={size}>{size}</span>)}</div><button className="checkout-button" onClick={() => addProduct(selected)}>Adicionar ao carrinho</button></div></div></div>}
    </main>
  );
}
