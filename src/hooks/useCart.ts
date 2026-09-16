import { useEffect, useMemo, useState } from "react";
import type { Product } from "../data/products";
import type { CartItem } from "../components/CartDrawer";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("the-archive-cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("the-archive-cart", JSON.stringify(items));
  }, [items]);

  function add(product: Product) {
    setItems((current) => {
      const found = current.find((item) => item.id === product.id);
      return found ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
    });
  }
  function change(id: string, delta: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  }
  function remove(id: string) { setItems((current) => current.filter((item) => item.id !== id)); }

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  return { items, add, change, remove, count };
}
