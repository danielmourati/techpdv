export type CustomerType = "PF" | "PJ";

export type Customer = {
  id: string;
  type: CustomerType;
  name: string;
  document: string; // CPF or CNPJ
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  creditLimit: number;
  currentDebt: number;
  totalPurchased: number;
  lastPurchaseDate?: string;
  active: boolean;
  notes?: string;
  createdAt: string;
};

const INITIAL_CUSTOMERS: Customer[] = [];

const STORAGE_KEY = "meupdv_customers_v2";

export function getStoredCustomers(): Customer[] {
  if (typeof window === "undefined") return INITIAL_CUSTOMERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

export function saveStoredCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    window.dispatchEvent(new Event("meupdv_customers_updated"));
  } catch (err) {
    console.error("Error saving customers to localStorage", err);
  }
}
