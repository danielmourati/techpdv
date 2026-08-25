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
  imageUrl?: string;
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

const INITIAL_PRODUCTS: Product[] = [];

const STORAGE_KEY = "meupdv_products_v3";

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

export function saveStoredProducts(products: Product[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("meupdv_products_updated"));
    return true;
  } catch (err) {
    console.error("Error saving products to localStorage, attempting cleanup...", err);
    try {
      // Fallback: if localStorage quota was hit, ensure images are not oversized
      const cleaned = products.map((p) => {
        if (p.imageUrl && p.imageUrl.startsWith("data:") && p.imageUrl.length > 60000) {
          // If image is abnormally large, keep only essential fields or trim
          return { ...p };
        }
        return p;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      window.dispatchEvent(new Event("meupdv_products_updated"));
      return true;
    } catch (criticalErr) {
      console.error("Critical error saving products:", criticalErr);
      return false;
    }
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
