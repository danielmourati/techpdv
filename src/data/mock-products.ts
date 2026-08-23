export type ProductCategory =
  | "Bebidas"
  | "Alimentos Básicos"
  | "Hortifruti"
  | "Açougue"
  | "Laticínios & Frios"
  | "Limpeza & Higiene"
  | "Padaria & Doces"
  | "Outros";

export type Product = {
  id: string;
  code: string;
  internalCode?: string;
  name: string;
  category: ProductCategory;
  unit: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  quickAdd?: boolean;
  soldByWeight?: boolean;
  active?: boolean;
  supplierId?: string;
  updatedAt?: string;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Bebidas",
  "Alimentos Básicos",
  "Hortifruti",
  "Açougue",
  "Laticínios & Frios",
  "Limpeza & Higiene",
  "Padaria & Doces",
  "Outros",
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    code: "7891000100101",
    internalCode: "REF-001",
    name: "REFRIGERANTE 2L",
    category: "Bebidas",
    unit: "UN",
    price: 20.0,
    costPrice: 12.5,
    stock: 42,
    minStock: 15,
    quickAdd: true,
    active: true,
  },
  {
    id: "p2",
    code: "7891000100102",
    internalCode: "CERV-002",
    name: "CERVEJA LATA 350ML",
    category: "Bebidas",
    unit: "UN",
    price: 4.5,
    costPrice: 2.8,
    stock: 320,
    minStock: 50,
    quickAdd: true,
    active: true,
  },
  {
    id: "p3",
    code: "7891000100103",
    internalCode: "ARR-003",
    name: "ARROZ TIPO 1 5KG",
    category: "Alimentos Básicos",
    unit: "PC",
    price: 27.9,
    costPrice: 20.0,
    stock: 88,
    minStock: 20,
    quickAdd: true,
    active: true,
  },
  {
    id: "p4",
    code: "7891000100104",
    internalCode: "FEIJ-004",
    name: "FEIJAO CARIOCA 1KG",
    category: "Alimentos Básicos",
    unit: "PC",
    price: 8.75,
    costPrice: 5.5,
    stock: 140,
    minStock: 30,
    quickAdd: true,
    active: true,
  },
  {
    id: "p5",
    code: "7891000100105",
    internalCode: "OLEO-005",
    name: "OLEO DE SOJA 900ML",
    category: "Alimentos Básicos",
    unit: "UN",
    price: 6.99,
    costPrice: 4.8,
    stock: 210,
    minStock: 40,
    quickAdd: true,
    active: true,
  },
  {
    id: "p6",
    code: "7891000100106",
    internalCode: "ACU-006",
    name: "ACUCAR REFINADO 1KG",
    category: "Alimentos Básicos",
    unit: "PC",
    price: 4.29,
    costPrice: 2.9,
    stock: 175,
    minStock: 35,
    quickAdd: true,
    active: true,
  },
  {
    id: "p7",
    code: "7891000100107",
    internalCode: "CAF-007",
    name: "CAFE TORRADO 500G",
    category: "Alimentos Básicos",
    unit: "PC",
    price: 18.4,
    costPrice: 13.2,
    stock: 64,
    minStock: 15,
    quickAdd: true,
    active: true,
  },
  {
    id: "p8",
    code: "7891000100108",
    internalCode: "LEIT-008",
    name: "LEITE INTEGRAL 1L",
    category: "Laticínios & Frios",
    unit: "UN",
    price: 5.19,
    costPrice: 3.6,
    stock: 260,
    minStock: 50,
    quickAdd: true,
    active: true,
  },
  {
    id: "p9",
    code: "7891000100109",
    internalCode: "AGUA-009",
    name: "AGUA MINERAL 500ML",
    category: "Bebidas",
    unit: "UN",
    price: 2.5,
    costPrice: 1.1,
    stock: 480,
    minStock: 100,
    active: true,
  },
  {
    id: "p10",
    code: "7891000100110",
    internalCode: "PAO-010",
    name: "PAO DE FORMA 500G",
    category: "Padaria & Doces",
    unit: "UN",
    price: 9.9,
    costPrice: 6.2,
    stock: 35,
    minStock: 10,
    active: true,
  },
  {
    id: "p11",
    code: "7891000100111",
    internalCode: "SAB-011",
    name: "SABAO EM PO 1KG",
    category: "Limpeza & Higiene",
    unit: "PC",
    price: 14.9,
    costPrice: 9.8,
    stock: 72,
    minStock: 20,
    active: true,
  },
  {
    id: "p12",
    code: "7891000100112",
    internalCode: "PAP-012",
    name: "PAPEL HIGIENICO 12UN",
    category: "Limpeza & Higiene",
    unit: "FD",
    price: 22.5,
    costPrice: 15.0,
    stock: 51,
    minStock: 12,
    active: true,
  },
  {
    id: "p13",
    code: "7891000100113",
    internalCode: "MAC-013",
    name: "MACARRAO ESPAGUETE 500G",
    category: "Alimentos Básicos",
    unit: "PC",
    price: 4.79,
    costPrice: 3.1,
    stock: 190,
    minStock: 40,
    active: true,
  },
  {
    id: "p14",
    code: "7891000100114",
    internalCode: "MOL-014",
    name: "MOLHO DE TOMATE 340G",
    category: "Alimentos Básicos",
    unit: "UN",
    price: 3.29,
    costPrice: 1.9,
    stock: 230,
    minStock: 50,
    active: true,
  },
  {
    id: "w1",
    code: "000001",
    internalCode: "BAN-001",
    name: "BANANA PRATA KG",
    category: "Hortifruti",
    unit: "KG",
    price: 8.9,
    costPrice: 4.5,
    stock: 34.5,
    minStock: 10,
    quickAdd: true,
    soldByWeight: true,
    active: true,
  },
  {
    id: "w2",
    code: "000002",
    internalCode: "TOM-002",
    name: "TOMATE ITALIANO KG",
    category: "Hortifruti",
    unit: "KG",
    price: 11.49,
    costPrice: 6.8,
    stock: 27.2,
    minStock: 8,
    quickAdd: true,
    soldByWeight: true,
    active: true,
  },
  {
    id: "w3",
    code: "000003",
    internalCode: "FRAN-003",
    name: "FILE DE FRANGO KG",
    category: "Açougue",
    unit: "KG",
    price: 22.9,
    costPrice: 15.5,
    stock: 18.0,
    minStock: 10,
    soldByWeight: true,
    active: true,
  },
  {
    id: "w4",
    code: "000004",
    internalCode: "QUEI-004",
    name: "QUEIJO MUSSARELA KG",
    category: "Laticínios & Frios",
    unit: "KG",
    price: 42.9,
    costPrice: 28.0,
    stock: 9.4,
    minStock: 5,
    soldByWeight: true,
    active: true,
  },
  {
    id: "p15",
    code: "7891000100115",
    internalCode: "BISC-015",
    name: "BISCOITO RECHEADO 140G",
    category: "Padaria & Doces",
    unit: "UN",
    price: 3.49,
    costPrice: 2.1,
    stock: 310,
    minStock: 50,
    active: true,
  },
];

const STORAGE_KEY = "meupdv_mock_products_v2";

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("meupdv_products_updated"));
  } catch (err) {
    console.error("Error saving products to localStorage", err);
  }
}

export const MOCK_PRODUCTS: Product[] = INITIAL_PRODUCTS;

export function findProduct(term: string): Product | undefined {
  const products = getStoredProducts();
  const t = term.trim().toLowerCase();
  if (!t) return undefined;
  return (
    products.find((p) => p.code === t) ??
    products.find((p) => p.internalCode?.toLowerCase() === t) ??
    products.find((p) => p.name.toLowerCase().includes(t))
  );
}

export function searchProducts(term: string, limit = 8): Product[] {
  const products = getStoredProducts();
  const t = term.trim().toLowerCase();
  if (!t) return products.slice(0, limit);
  return products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        p.code.includes(t) ||
        p.category.toLowerCase().includes(t) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(t)),
    )
    .slice(0, limit);
}
