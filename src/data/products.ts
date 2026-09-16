export type Category = "Todos" | "Camisas" | "Calças" | "Casacos" | "Acessórios";

export type Product = {
  id: string;
  code: string;
  name: string;
  category: Exclude<Category, "Todos">;
  price: number;
  oldPrice?: number;
  image: string;
  sizes: string[];
  colors: string[];
  description: string;
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: "oxford-001",
    code: "TA-8F4K29",
    name: "Oxford Essential",
    category: "Camisas",
    price: 289,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Off-white", "Azul"],
    description: "Camisa Oxford de algodão com caimento estruturado e acabamento discreto.",
    featured: true,
  },
  {
    id: "polo-002",
    code: "TA-4M7Q12",
    name: "Polo Heritage",
    category: "Camisas",
    price: 249,
    image: "https://images.unsplash.com/photo-1625910513413-5fc45c7c7c0c?auto=format&fit=crop&w=900&q=85",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Navy", "Preto", "Creme"],
    description: "Polo minimalista em malha macia, inspirada no estilo clássico europeu.",
    featured: true,
  },
  {
    id: "trouser-003",
    code: "TA-9N2R41",
    name: "Tailored Trouser",
    category: "Calças",
    price: 399,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85",
    sizes: ["36", "38", "40", "42", "44"],
    colors: ["Bege", "Preto"],
    description: "Calça de alfaiataria com corte reto e tecido confortável para uso diário.",
    featured: true,
  },
  {
    id: "knit-004",
    code: "TA-3C8P55",
    name: "Cashmere Knit",
    category: "Casacos",
    price: 479,
    image: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=900&q=85",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Cinza", "Marrom"],
    description: "Tricô de textura suave para sobreposição em dias frios.",
  },
  {
    id: "jacket-005",
    code: "TA-6V1B73",
    name: "Varsity Archive",
    category: "Casacos",
    price: 549,
    oldPrice: 629,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Verde"],
    description: "Jaqueta inspirada em peças universitárias clássicas, com acabamento premium.",
  },
  {
    id: "belt-006",
    code: "TA-2H9L64",
    name: "Leather Belt",
    category: "Acessórios",
    price: 179,
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=85",
    sizes: ["80", "90", "100", "110"],
    colors: ["Marrom", "Preto"],
    description: "Cinto de couro com fivela metálica minimalista.",
  },
  {
    id: "tee-007",
    code: "TA-7X5D18",
    name: "Archive Tee",
    category: "Camisas",
    price: 159,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Branco", "Preto"],
    description: "Camiseta pesada de algodão com logo pequeno e estética limpa.",
  },
  {
    id: "short-008",
    code: "TA-1Z6E90",
    name: "Pleated Short",
    category: "Calças",
    price: 229,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=85",
    sizes: ["36", "38", "40", "42"],
    colors: ["Bege", "Navy"],
    description: "Bermuda de pregas com inspiração clássica e construção contemporânea.",
  },
];
