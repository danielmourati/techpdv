export type Supplier = {
  id: string;
  companyName: string; // Razão Social
  tradeName: string; // Nome Fantasia
  cnpj: string;
  stateRegistration?: string; // Inscrição Estadual
  email: string;
  phone: string;
  contactPerson: string;
  categories: string[];
  city: string;
  state: string;
  deliveryDays: number;
  paymentTerms: string;
  active: boolean;
  notes?: string;
  createdAt: string;
};

const INITIAL_SUPPLIERS: Supplier[] = [];

const STORAGE_KEY = "meupdv_suppliers_v2";

export function getStoredSuppliers(): Supplier[] {
  if (typeof window === "undefined") return INITIAL_SUPPLIERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUPPLIERS));
      return INITIAL_SUPPLIERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUPPLIERS;
  }
}

export function saveStoredSuppliers(suppliers: Supplier[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
    window.dispatchEvent(new Event("meupdv_suppliers_updated"));
  } catch (err) {
    console.error("Error saving suppliers to localStorage", err);
  }
}
