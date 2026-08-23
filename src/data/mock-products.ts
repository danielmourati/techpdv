export type Product = {
  id: string;
  code: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  quickAdd?: boolean;
  soldByWeight?: boolean;
};

export const MOCK_PRODUCTS: Product[] = [
  { id: "p1", code: "7891000100101", name: "REFRIGERANTE 2L", unit: "UN", price: 20, stock: 42, quickAdd: true },
  { id: "p2", code: "7891000100102", name: "CERVEJA LATA 350ML", unit: "UN", price: 4.5, stock: 320, quickAdd: true },
  { id: "p3", code: "7891000100103", name: "ARROZ TIPO 1 5KG", unit: "PC", price: 27.9, stock: 88, quickAdd: true },
  { id: "p4", code: "7891000100104", name: "FEIJAO CARIOCA 1KG", unit: "PC", price: 8.75, stock: 140, quickAdd: true },
  { id: "p5", code: "7891000100105", name: "OLEO DE SOJA 900ML", unit: "UN", price: 6.99, stock: 210, quickAdd: true },
  { id: "p6", code: "7891000100106", name: "ACUCAR REFINADO 1KG", unit: "PC", price: 4.29, stock: 175, quickAdd: true },
  { id: "p7", code: "7891000100107", name: "CAFE TORRADO 500G", unit: "PC", price: 18.4, stock: 64, quickAdd: true },
  { id: "p8", code: "7891000100108", name: "LEITE INTEGRAL 1L", unit: "UN", price: 5.19, stock: 260, quickAdd: true },
  { id: "p9", code: "7891000100109", name: "AGUA MINERAL 500ML", unit: "UN", price: 2.5, stock: 480 },
  { id: "p10", code: "7891000100110", name: "PAO DE FORMA 500G", unit: "UN", price: 9.9, stock: 35 },
  { id: "p11", code: "7891000100111", name: "SABAO EM PO 1KG", unit: "PC", price: 14.9, stock: 72 },
  { id: "p12", code: "7891000100112", name: "PAPEL HIGIENICO 12UN", unit: "FD", price: 22.5, stock: 51 },
  { id: "p13", code: "7891000100113", name: "MACARRAO ESPAGUETE 500G", unit: "PC", price: 4.79, stock: 190 },
  { id: "p14", code: "7891000100114", name: "MOLHO DE TOMATE 340G", unit: "UN", price: 3.29, stock: 230 },
  { id: "w1", code: "000001", name: "BANANA PRATA KG", unit: "KG", price: 8.9, stock: 34, quickAdd: true, soldByWeight: true },
  { id: "w2", code: "000002", name: "TOMATE ITALIANO KG", unit: "KG", price: 11.49, stock: 27, quickAdd: true, soldByWeight: true },
  { id: "w3", code: "000003", name: "FILE DE FRANGO KG", unit: "KG", price: 22.9, stock: 18, soldByWeight: true },
  { id: "w4", code: "000004", name: "QUEIJO MUSSARELA KG", unit: "KG", price: 42.9, stock: 9, soldByWeight: true },
  { id: "p15", code: "7891000100115", name: "BISCOITO RECHEADO 140G", unit: "UN", price: 3.49, stock: 310 },
];

export function findProduct(term: string): Product | undefined {
  const t = term.trim().toLowerCase();
  if (!t) return undefined;
  return (
    MOCK_PRODUCTS.find((p) => p.code === t) ??
    MOCK_PRODUCTS.find((p) => p.name.toLowerCase().includes(t))
  );
}

export function searchProducts(term: string, limit = 6): Product[] {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  return MOCK_PRODUCTS.filter(
    (p) => p.name.toLowerCase().includes(t) || p.code.includes(t),
  ).slice(0, limit);
}
