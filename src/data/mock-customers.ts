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

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    type: "PF",
    name: "Ana Clara Souza",
    document: "123.456.789-00",
    email: "ana.souza@gmail.com",
    phone: "(11) 98765-4321",
    address: "Rua das Flores, 120",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01001-000",
    creditLimit: 500.0,
    currentDebt: 45.5,
    totalPurchased: 2450.8,
    lastPurchaseDate: "2026-08-20",
    active: true,
    notes: "Cliente fiel, prefere pagar no fim do mês.",
    createdAt: "2025-01-15",
  },
  {
    id: "c2",
    type: "PF",
    name: "Carlos Eduardo Lima",
    document: "234.567.890-11",
    email: "carlos.lima@hotmail.com",
    phone: "(11) 97654-3210",
    address: "Av. Paulista, 1500 - Apto 42",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01311-200",
    creditLimit: 800.0,
    currentDebt: 0.0,
    totalPurchased: 4120.0,
    lastPurchaseDate: "2026-08-22",
    active: true,
    createdAt: "2025-03-10",
  },
  {
    id: "c3",
    type: "PJ",
    name: "Padaria Estrela Dalva Ltda",
    document: "12.345.678/0001-90",
    email: "contato@estreladalva.com.br",
    phone: "(11) 3222-1100",
    address: "Rua do Comércio, 450",
    neighborhood: "Santana",
    city: "São Paulo",
    state: "SP",
    zipCode: "02012-000",
    creditLimit: 2500.0,
    currentDebt: 680.0,
    totalPurchased: 18950.0,
    lastPurchaseDate: "2026-08-23",
    active: true,
    notes: "Compras semanais de farinha e laticínios.",
    createdAt: "2024-11-05",
  },
  {
    id: "c4",
    type: "PF",
    name: "Mariana Mendes Ribeiro",
    document: "345.678.901-22",
    email: "mariana.mendes@outlook.com",
    phone: "(11) 96543-2109",
    address: "Rua Vergueiro, 890",
    neighborhood: "Vila Mariana",
    city: "São Paulo",
    state: "SP",
    zipCode: "04101-000",
    creditLimit: 300.0,
    currentDebt: 120.0,
    totalPurchased: 890.5,
    lastPurchaseDate: "2026-08-18",
    active: true,
    createdAt: "2025-06-20",
  },
  {
    id: "c5",
    type: "PJ",
    name: "Lanchonete Sabor Tropical",
    document: "98.765.432/0001-10",
    email: "financeiro@sabortropical.com",
    phone: "(11) 3456-7890",
    address: "Alameda Santos, 320",
    neighborhood: "Jardins",
    city: "São Paulo",
    state: "SP",
    zipCode: "01418-000",
    creditLimit: 1500.0,
    currentDebt: 0.0,
    totalPurchased: 9840.0,
    lastPurchaseDate: "2026-08-21",
    active: true,
    createdAt: "2025-02-18",
  },
  {
    id: "c6",
    type: "PF",
    name: "Roberto Silveira Santos",
    document: "456.789.012-33",
    email: "roberto.silveira@uol.com.br",
    phone: "(11) 95432-1098",
    address: "Rua Augusta, 2100",
    neighborhood: "Consolação",
    city: "São Paulo",
    state: "SP",
    zipCode: "01412-000",
    creditLimit: 400.0,
    currentDebt: 0.0,
    totalPurchased: 670.0,
    lastPurchaseDate: "2026-08-15",
    active: false,
    notes: "Mudou de bairro.",
    createdAt: "2025-04-12",
  },
];

const STORAGE_KEY = "meupdv_mock_customers_v1";

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
