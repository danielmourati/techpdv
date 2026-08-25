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

export const MOCK_SESSIONS: SaleSession[] = [
  {
    id: "s1",
    number: 1,
    operator: "OPERADOR",
    openedAt: "",
    items: [],
  },
];

export function sessionTotal(session: SaleSession): number {
  return session.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
}
