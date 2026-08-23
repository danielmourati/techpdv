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

const INITIAL_ENTRIES: FinancialEntry[] = [
  {
    id: "fin-1",
    description: "Venda PDV Cupom #00104",
    type: "RECEITA",
    category: "Vendas à Vista",
    amount: 145.8,
    paymentMethod: "PIX",
    status: "PAGO",
    dueDate: "2026-08-23",
    paymentDate: "2026-08-23 14:15",
    entityName: "Consumidor Final",
    operator: "Daniel Oliveira",
    createdAt: "2026-08-23",
  },
  {
    id: "fin-2",
    description: "Venda PDV Cupom #00105",
    type: "RECEITA",
    category: "Vendas à Vista",
    amount: 89.2,
    paymentMethod: "DINHEIRO",
    status: "PAGO",
    dueDate: "2026-08-23",
    paymentDate: "2026-08-23 14:30",
    entityName: "Consumidor Final",
    operator: "Daniel Oliveira",
    createdAt: "2026-08-23",
  },
  {
    id: "fin-3",
    description: "Suprimento Inicial de Caixa (Troco)",
    type: "SUPRIMENTO",
    category: "Abertura de Caixa",
    amount: 200.0,
    paymentMethod: "DINHEIRO",
    status: "PAGO",
    dueDate: "2026-08-23",
    paymentDate: "2026-08-23 08:00",
    operator: "Daniel Oliveira",
    notes: "Fundo de troco para o turno da manhã.",
    createdAt: "2026-08-23",
  },
  {
    id: "fin-4",
    description: "Sangria de Caixa - Depósito Bancário",
    type: "SANGRIA",
    category: "Retirada de Caixa",
    amount: 500.0,
    paymentMethod: "DINHEIRO",
    status: "PAGO",
    dueDate: "2026-08-23",
    paymentDate: "2026-08-23 12:00",
    operator: "Administrador Geral",
    notes: "Excesso de dinheiro em gaveta recolhido para o cofre.",
    createdAt: "2026-08-23",
  },
  {
    id: "fin-5",
    description: "Pagamento Fornecedor Bebidas Paulista NF 10452",
    type: "DESPESA",
    category: "Fornecedores",
    amount: 680.0,
    paymentMethod: "BOLETO",
    status: "PAGO",
    dueDate: "2026-08-22",
    paymentDate: "2026-08-22 10:00",
    entityName: "Bebidas Paulista",
    operator: "Administrador Geral",
    createdAt: "2026-08-20",
  },
  {
    id: "fin-6",
    description: "Conta de Energia Elétrica - Enel",
    type: "DESPESA",
    category: "Contas Fixas",
    amount: 450.0,
    paymentMethod: "BOLETO",
    status: "PENDENTE",
    dueDate: "2026-08-28",
    entityName: "Enel Distribuição",
    operator: "Administrador Geral",
    createdAt: "2026-08-15",
  },
  {
    id: "fin-7",
    description: "Internet Fibra Óptica Comercial",
    type: "DESPESA",
    category: "Contas Fixas",
    amount: 149.9,
    paymentMethod: "BOLETO",
    status: "PENDENTE",
    dueDate: "2026-08-25",
    entityName: "Vivo Empresas",
    operator: "Administrador Geral",
    createdAt: "2026-08-10",
  },
  {
    id: "fin-8",
    description: "Recebimento Fiado - Carlos Eduardo",
    type: "RECEITA",
    category: "Recebimento a Prazo",
    amount: 180.0,
    paymentMethod: "PIX",
    status: "PAGO",
    dueDate: "2026-08-23",
    paymentDate: "2026-08-23 15:10",
    entityName: "Carlos Eduardo Lima",
    operator: "Daniel Oliveira",
    createdAt: "2026-08-23",
  },
];

const STORAGE_KEY = "meupdv_mock_financial_v1";

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
