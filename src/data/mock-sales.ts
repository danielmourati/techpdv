import { MOCK_PRODUCTS } from "./mock-products";

export type SaleItem = {
  id: string;
  productId: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
};

export type SaleSession = {
  id: string;
  number: number;
  operator: string;
  openedAt: string;
  items: SaleItem[];
};

const p = (id: string) => MOCK_PRODUCTS.find((x) => x.id === id)!;

const line = (productId: string, quantity: number): SaleItem => {
  const prod = p(productId);
  return {
    id: `${productId}-${quantity}-${Math.random().toString(36).slice(2, 7)}`,
    productId: prod.id,
    code: prod.code,
    name: prod.name,
    unit: prod.unit,
    quantity,
    price: prod.price,
  };
};

export const MOCK_SESSIONS: SaleSession[] = [
  {
    id: "s7",
    number: 7,
    operator: "DANIEL",
    openedAt: "14:02",
    items: [line("p1", 1)],
  },
  {
    id: "s8",
    number: 8,
    operator: "DANIEL",
    openedAt: "14:11",
    items: [line("p1", 2)],
  },
  {
    id: "s9",
    number: 9,
    operator: "DANIEL",
    openedAt: "14:26",
    items: [line("p3", 2), line("p4", 3), line("p8", 6)],
  },
];

export function sessionTotal(session: SaleSession): number {
  return session.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
}
