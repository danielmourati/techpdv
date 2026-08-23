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

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup1",
    companyName: "Distribuidora de Bebidas Paulista S/A",
    tradeName: "Bebidas Paulista",
    cnpj: "11.222.333/0001-44",
    stateRegistration: "110.222.333.444",
    email: "pedidos@bebidaspaulista.com.br",
    phone: "(11) 3100-5000",
    contactPerson: "Marcos Vinicius (Representante)",
    categories: ["Bebidas"],
    city: "São Paulo",
    state: "SP",
    deliveryDays: 2,
    paymentTerms: "28 DDL (Boleto)",
    active: true,
    notes: "Entrega toda terça e quinta-feira pela manhã.",
    createdAt: "2024-05-10",
  },
  {
    id: "sup2",
    companyName: "Alimentos Santa Tereza Distribuidora Ltda",
    tradeName: "Santa Tereza Alimentos",
    cnpj: "22.333.444/0001-55",
    stateRegistration: "220.333.444.555",
    email: "comercial@santatereza.com.br",
    phone: "(11) 4567-8900",
    contactPerson: "Juliana Peixoto",
    categories: ["Alimentos Básicos", "Padaria & Doces"],
    city: "Guarulhos",
    state: "SP",
    deliveryDays: 3,
    paymentTerms: "14/28 DDL",
    active: true,
    notes: "Fornecedor principal de grãos, farinhas e açúcar.",
    createdAt: "2024-06-18",
  },
  {
    id: "sup3",
    companyName: "Cooperativa Agropecuária do Vale",
    tradeName: "Hortifruti Vale Fresco",
    cnpj: "33.444.555/0001-66",
    stateRegistration: "ISENTO",
    email: "entregas@valefresco.coop.br",
    phone: "(12) 3988-1234",
    contactPerson: "Seu Sebastião",
    categories: ["Hortifruti"],
    city: "Mogi das Cruzes",
    state: "SP",
    deliveryDays: 1,
    paymentTerms: "À Vista / PIX",
    active: true,
    notes: "Produtos orgânicos e frutas frescas.",
    createdAt: "2024-08-01",
  },
  {
    id: "sup4",
    companyName: "Química & Limpeza Suprema Ltda",
    tradeName: "Suprema Clean",
    cnpj: "44.555.666/0001-77",
    stateRegistration: "440.555.666.777",
    email: "atendimento@supremaclean.com.br",
    phone: "(11) 2890-4455",
    contactPerson: "Renata Duarte",
    categories: ["Limpeza & Higiene"],
    city: "São Bernardo do Campo",
    state: "SP",
    deliveryDays: 4,
    paymentTerms: "30 DDL",
    active: true,
    createdAt: "2025-01-20",
  },
  {
    id: "sup5",
    companyName: "Frigorífico Boi Nobre Alimentos Eireli",
    tradeName: "Boi Nobre Carnes",
    cnpj: "55.666.777/0001-88",
    stateRegistration: "550.666.777.888",
    email: "vendas@boinobre.com.br",
    phone: "(11) 3678-9900",
    contactPerson: "Leandro Carvalho",
    categories: ["Açougue", "Laticínios & Frios"],
    city: "Osasco",
    state: "SP",
    deliveryDays: 2,
    paymentTerms: "7/14 DDL",
    active: true,
    createdAt: "2024-09-12",
  },
];

const STORAGE_KEY = "meupdv_mock_suppliers_v1";

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
