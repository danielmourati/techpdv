import { getStoredProducts, saveStoredProducts } from "./mock-products";

export type MovementType = "ENTRADA" | "SAIDA" | "AJUSTE" | "PERDA";

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  operator: string;
  documentNumber?: string;
  timestamp: string;
};

const INITIAL_MOVEMENTS: StockMovement[] = [];

const STORAGE_KEY = "meupdv_inventory_v2";

export function getStoredMovements(): StockMovement[] {
  if (typeof window === "undefined") return INITIAL_MOVEMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOVEMENTS;
  }
}

export function saveStoredMovements(movements: StockMovement[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movements));
    window.dispatchEvent(new Event("meupdv_inventory_updated"));
  } catch (err) {
    console.error("Error saving movements to localStorage", err);
  }
}

export function registerStockMovement(
  productId: string,
  type: MovementType,
  quantity: number,
  reason: string,
  operator: string,
  documentNumber?: string,
): boolean {
  const products = getStoredProducts();
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex === -1) return false;

  const product = products[productIndex];
  if (!product) return false;
  const previousStock = product.stock;
  let newStock = previousStock;

  if (type === "ENTRADA") {
    newStock = previousStock + quantity;
  } else if (type === "SAIDA" || type === "PERDA") {
    newStock = Math.max(0, previousStock - quantity);
  } else if (type === "AJUSTE") {
    // If ajuste, quantity is treated as the new target stock value or delta
    newStock = quantity;
  }

  // update product stock
  products[productIndex] = {
    ...product,
    stock: newStock,
    updatedAt: new Date().toISOString(),
  };
  saveStoredProducts(products);

  // create movement log
  const movement: StockMovement = {
    id: `mov-${Date.now()}`,
    productId: product.id,
    productName: product.name,
    productCode: product.code,
    type,
    quantity,
    previousStock,
    newStock,
    reason: reason.trim() || "Ajuste manual de estoque",
    operator,
    ...(documentNumber ? { documentNumber } : {}),
    timestamp: new Date().toLocaleString("pt-BR"),
  };

  const movements = [movement, ...getStoredMovements()];
  saveStoredMovements(movements);

  return true;
}
