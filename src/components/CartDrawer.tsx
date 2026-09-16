import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { Product } from "../data/products";

export type CartItem = Product & { quantity: number };

type Props = {
  items: CartItem[];
  open: boolean;
  onClose: () => void;
  onChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
};

export function CartDrawer({ items, open, onClose, onChange, onRemove }: Props) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-header">
          <div><p className="eyebrow">THE ARCHIVE</p><h2>Sua seleção</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar carrinho"><X /></button>
        </header>
        <div className="cart-content">
          {items.length === 0 ? (
            <div className="empty-cart"><ShoppingBag size={34} strokeWidth={1.3} /><p>Seu carrinho está vazio.</p><span>Explore a coleção e escolha suas peças.</span></div>
          ) : items.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div className="cart-item-main">
                <div className="cart-item-top"><div><p>{item.category}</p><h3>{item.name}</h3></div><button onClick={() => onRemove(item.id)} aria-label="Remover"><Trash2 size={15} /></button></div>
                <strong>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</strong>
                <div className="quantity"><button onClick={() => onChange(item.id, -1)}><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => onChange(item.id, 1)}><Plus size={14}/></button></div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && <footer className="drawer-footer"><div><span>Total</span><strong>R$ {total.toFixed(2).replace('.', ',')}</strong></div><button className="checkout-button" onClick={() => alert("Checkout demonstrativo. Conecte um gateway de pagamento para receber pedidos reais.")}>Finalizar pedido</button><small>Pagamento seguro • Envio para todo o Brasil</small></footer>}
      </aside>
    </div>
  );
}
