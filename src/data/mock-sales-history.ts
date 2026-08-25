import { type SaleItem } from "./mock-sales";

export type SaleStatus = "CONCLUIDA" | "CANCELADA" | "EM_ABERTO";

export type CompletedSale = {
  id: string;
  code: string; // Ex: VDA-00101
  receiptNumber: number;
  date: string;
  time: string;
  customerName?: string;
  customerDocument?: string;
  operator: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "PIX" | "DINHEIRO" | "CARTAO_DEBITO" | "CARTAO_CREDITO" | "MULTIPLO";
  amountPaid: number;
  change: number;
  status: SaleStatus;
  nfceKey?: string;
  cancelReason?: string;
  canceledAt?: string;
};

const INITIAL_SALES_HISTORY: CompletedSale[] = [];

const STORAGE_KEY = "meupdv_sales_history_v2";

export function getStoredSalesHistory(): CompletedSale[] {
  if (typeof window === "undefined") return INITIAL_SALES_HISTORY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SALES_HISTORY));
      return INITIAL_SALES_HISTORY;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SALES_HISTORY;
  }
}

export function saveStoredSalesHistory(sales: CompletedSale[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
    window.dispatchEvent(new Event("meupdv_sales_updated"));
  } catch (err) {
    console.error("Error saving sales history to localStorage", err);
  }
}
