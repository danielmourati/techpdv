import { useCallback, useMemo, useState } from "react";
import { MOCK_SESSIONS, sessionTotal, type SaleItem, type SaleSession } from "@/data/mock-sales";
import type { Product } from "@/data/mock-products";

let nextNumber = 10;

export function useSalesSessions() {
  const [sessions, setSessions] = useState<SaleSession[]>(MOCK_SESSIONS);
  const [activeId, setActiveId] = useState<string>(MOCK_SESSIONS[1]?.id ?? "s7");
  const [currentItemId, setCurrentItemId] = useState<string | null>(
    MOCK_SESSIONS[1]?.items[0]?.id ?? null,
  );

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? sessions[0],
    [sessions, activeId],
  );

  const currentItem: SaleItem | null = useMemo(
    () => active?.items.find((i) => i.id === currentItemId) ?? active?.items.at(-1) ?? null,
    [active, currentItemId],
  );

  const patchActive = useCallback(
    (fn: (s: SaleSession) => SaleSession) =>
      setSessions((prev) => prev.map((s) => (s.id === activeId ? fn(s) : s))),
    [activeId],
  );

  const selectSession = useCallback((id: string) => {
    setActiveId(id);
    setCurrentItemId(null);
  }, []);

  const newSession = useCallback(() => {
    const id = `s${nextNumber}`;
    const session: SaleSession = {
      id,
      number: nextNumber++,
      operator: "DANIEL",
      openedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      items: [],
    };
    setSessions((prev) => [...prev, session]);
    setActiveId(id);
    setCurrentItemId(null);
    return session;
  }, []);

  const addProduct = useCallback(
    (product: Product, quantity = 1, priceOverride?: number) => {
      const price = priceOverride ?? product.price;
      let targetId = "";
      patchActive((s) => {
        const existing = s.items.find((i) => i.productId === product.id && i.price === price);
        if (existing) {
          targetId = existing.id;
          return {
            ...s,
            items: s.items.map((i) =>
              i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          };
        }
        targetId = `${product.id}-${Date.now()}`;
        return {
          ...s,
          items: [
            ...s.items,
            {
              id: targetId,
              productId: product.id,
              code: product.code,
              name: product.name,
              unit: product.unit,
              quantity,
              price,
            },
          ],
        };
      });
      setCurrentItemId(targetId);
    },
    [patchActive],
  );

  const changeQuantity = useCallback(
    (itemId: string, delta: number) => {
      patchActive((s) => ({
        ...s,
        items: s.items
          .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + delta } : i))
          .filter((i) => i.quantity > 0),
      }));
      setCurrentItemId(itemId);
    },
    [patchActive],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      patchActive((s) => ({ ...s, items: s.items.filter((i) => i.id !== itemId) }));
      setCurrentItemId(null);
    },
    [patchActive],
  );

  const clearActive = useCallback(() => {
    patchActive((s) => ({ ...s, items: [] }));
    setCurrentItemId(null);
  }, [patchActive]);

  return {
    sessions,
    active,
    activeTotal: active ? sessionTotal(active) : 0,
    currentItem,
    selectSession,
    setCurrentItemId,
    newSession,
    addProduct,
    changeQuantity,
    removeItem,
    clearActive,
    totals: Object.fromEntries(sessions.map((s) => [s.id, sessionTotal(s)])) as Record<
      string,
      number
    >,
  };
}
