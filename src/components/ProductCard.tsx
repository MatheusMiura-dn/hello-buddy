import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "../data/products";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  onOpen: (product: Product) => void;
};

export function ProductCard({ product, onAdd, onOpen }: ProductCardProps) {
  return (
    <article className="product-card">
      <button className="product-image-button" onClick={() => onOpen(product)} aria-label={`Ver ${product.name}`}>
        <div className="product-image-wrap">
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
          {product.oldPrice && <span className="product-badge">Archive Sale</span>}
          <button
            className="wishlist-button"
            aria-label="Adicionar aos favoritos"
            onClick={(event) => event.stopPropagation()}
          >
            <Heart size={17} strokeWidth={1.7} />
          </button>
        </div>
      </button>
      <div className="product-info">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
        <div className="product-price-row">
          <strong>R$ {product.price.toFixed(2).replace('.', ',')}</strong>
          {product.oldPrice && <span>R$ {product.oldPrice.toFixed(2).replace('.', ',')}</span>}
        </div>
        <button className="add-button" onClick={() => onAdd(product)}>
          <ShoppingBag size={16} /> Adicionar
        </button>
      </div>
    </article>
  );
}
