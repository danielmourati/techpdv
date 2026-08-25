export type EntryType = "RECEITA" | "DESPESA" | "SANGRIA" | "SUPRIMENTO";
export type EntryStatus = "PAGO" | "PENDENTE" | "CANCELADO";
export type PaymentMethod = "DINHEIRO" | "PIX" | "CARTAO_DEBITO" | "CARTAO_CREDITO" | "BOLETO" | "OUTROS";

export type FinancialEntry = {
  id: string;
  description: string;
  type: EntryType;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: EntryStatus;
  dueDate: string;
  paymentDate?: string;
  entityName?: string; // Fornecedor ou Cliente
  documentNumber?: string;
  operator: string;
  notes?: string;
  createdAt: string;
};

const INITIAL_ENTRIES: FinancialEntry[] = [];

const STORAGE_KEY = "meupdv_financial_v2";

export function getStoredFinancial(): FinancialEntry[] {
  if (typeof window === "undefined") return INITIAL_ENTRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ENTRIES));
      return INITIAL_ENTRIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ENTRIES;
  }
}

export function saveStoredFinancial(entries: FinancialEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event("meupdv_financial_updated"));
  } catch (err) {
    console.error("Error saving financial entries to localStorage", err);
  }
}
