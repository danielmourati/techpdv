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

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-1",
    productId: "p1",
    productName: "REFRIGERANTE 2L",
    productCode: "7891000100101",
    type: "ENTRADA",
    quantity: 50,
    previousStock: 12,
    newStock: 62,
    reason: "Entrada de mercadoria NF 10452 - Bebidas Paulista",
    operator: "Administrador Geral",
    documentNumber: "NF 10452",
    timestamp: "2026-08-23 09:30:00",
  },
  {
    id: "mov-2",
    productId: "p3",
    productName: "ARROZ TIPO 1 5KG",
    productCode: "7891000100103",
    type: "ENTRADA",
    quantity: 100,
    previousStock: 8,
    newStock: 108,
    reason: "Recebimento Santa Tereza Alimentos NF 8901",
    operator: "Administrador Geral",
    documentNumber: "NF 8901",
    timestamp: "2026-08-23 10:15:00",
  },
  {
    id: "mov-3",
    productId: "w2",
    productName: "TOMATE ITALIANO KG",
    productCode: "000002",
    type: "PERDA",
    quantity: 2.8,
    previousStock: 30.0,
    newStock: 27.2,
    reason: "Descarte por avaria / maturação excessiva",
    operator: "Daniel Oliveira",
    timestamp: "2026-08-23 11:45:00",
  },
  {
    id: "mov-4",
    productId: "p8",
    productName: "LEITE INTEGRAL 1L",
    productCode: "7891000100108",
    type: "AJUSTE",
    quantity: 5,
    previousStock: 255,
    newStock: 260,
    reason: "Ajuste de conferência física de prateleira",
    operator: "Daniel Oliveira",
    timestamp: "2026-08-23 13:20:00",
  },
];

const STORAGE_KEY = "meupdv_mock_inventory_v1";

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
