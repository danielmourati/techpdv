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

const INITIAL_SALES_HISTORY: CompletedSale[] = [
  {
    id: "sale-101",
    code: "VDA-00101",
    receiptNumber: 101,
    date: "2026-08-23",
    time: "10:14:22",
    customerName: "Consumidor Final",
    operator: "Daniel Oliveira",
    items: [
      {
        id: "p1-1",
        productId: "p1",
        code: "7891000100101",
        name: "REFRIGERANTE 2L",
        unit: "UN",
        quantity: 2,
        price: 20.0,
      },
      {
        id: "p2-1",
        productId: "p2",
        code: "7891000100102",
        name: "CERVEJA LATA 350ML",
        unit: "UN",
        quantity: 6,
        price: 4.5,
      },
    ],
    subtotal: 67.0,
    discount: 2.0,
    total: 65.0,
    paymentMethod: "PIX",
    amountPaid: 65.0,
    change: 0.0,
    status: "CONCLUIDA",
    nfceKey: "3526 0812 3456 7800 0190 6500 1000 0001 0119 8234 5678",
  },
  {
    id: "sale-102",
    code: "VDA-00102",
    receiptNumber: 102,
    date: "2026-08-23",
    time: "11:28:05",
    customerName: "Ana Clara Souza",
    customerDocument: "123.456.789-00",
    operator: "Daniel Oliveira",
    items: [
      {
        id: "p3-1",
        productId: "p3",
        code: "7891000100103",
        name: "ARROZ TIPO 1 5KG",
        unit: "PC",
        quantity: 1,
        price: 27.9,
      },
      {
        id: "p4-1",
        productId: "p4",
        code: "7891000100104",
        name: "FEIJAO CARIOCA 1KG",
        unit: "PC",
        quantity: 2,
        price: 8.75,
      },
      {
        id: "p5-1",
        productId: "p5",
        code: "7891000100105",
        name: "OLEO DE SOJA 900ML",
        unit: "UN",
        quantity: 2,
        price: 6.99,
      },
    ],
    subtotal: 59.38,
    discount: 0.0,
    total: 59.38,
    paymentMethod: "CARTAO_DEBITO",
    amountPaid: 59.38,
    change: 0.0,
    status: "CONCLUIDA",
    nfceKey: "3526 0812 3456 7800 0190 6500 1000 0001 0219 8234 5679",
  },
  {
    id: "sale-103",
    code: "VDA-00103",
    receiptNumber: 103,
    date: "2026-08-23",
    time: "13:05:40",
    customerName: "Consumidor Final",
    operator: "Daniel Oliveira",
    items: [
      {
        id: "w1-1",
        productId: "w1",
        code: "000001",
        name: "BANANA PRATA KG",
        unit: "KG",
        quantity: 1.45,
        price: 8.9,
      },
      {
        id: "w4-1",
        productId: "w4",
        code: "000004",
        name: "QUEIJO MUSSARELA KG",
        unit: "KG",
        quantity: 0.42,
        price: 42.9,
      },
    ],
    subtotal: 30.92,
    discount: 0.0,
    total: 30.92,
    paymentMethod: "DINHEIRO",
    amountPaid: 50.0,
    change: 19.08,
    status: "CONCLUIDA",
    nfceKey: "3526 0812 3456 7800 0190 6500 1000 0001 0319 8234 5680",
  },
  {
    id: "sale-104",
    code: "VDA-00104",
    receiptNumber: 104,
    date: "2026-08-23",
    time: "14:15:10",
    customerName: "Padaria Estrela Dalva Ltda",
    customerDocument: "12.345.678/0001-90",
    operator: "Daniel Oliveira",
    items: [
      {
        id: "p8-1",
        productId: "p8",
        code: "7891000100108",
        name: "LEITE INTEGRAL 1L",
        unit: "UN",
        quantity: 24,
        price: 5.19,
      },
      {
        id: "p6-1",
        productId: "p6",
        code: "7891000100106",
        name: "ACUCAR REFINADO 1KG",
        unit: "PC",
        quantity: 10,
        price: 4.29,
      },
    ],
    subtotal: 167.46,
    discount: 5.0,
    total: 162.46,
    paymentMethod: "PIX",
    amountPaid: 162.46,
    change: 0.0,
    status: "CONCLUIDA",
    nfceKey: "3526 0812 3456 7800 0190 6500 1000 0001 0419 8234 5681",
  },
  {
    id: "sale-105",
    code: "VDA-00105",
    receiptNumber: 105,
    date: "2026-08-23",
    time: "15:40:19",
    customerName: "Consumidor Final",
    operator: "Daniel Oliveira",
    items: [
      {
        id: "p1-2",
        productId: "p1",
        code: "7891000100101",
        name: "REFRIGERANTE 2L",
        unit: "UN",
        quantity: 1,
        price: 20.0,
      },
    ],
    subtotal: 20.0,
    discount: 0.0,
    total: 20.0,
    paymentMethod: "DINHEIRO",
    amountPaid: 20.0,
    change: 0.0,
    status: "CANCELADA",
    cancelReason: "Cliente desistiu da compra antes de retirar o item.",
    canceledAt: "2026-08-23 15:42:00",
  },
];

const STORAGE_KEY = "meupdv_mock_sales_history_v1";

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
