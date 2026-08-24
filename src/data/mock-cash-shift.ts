export type CashShift = {
  id: string;
  openedAt: string;
  closedAt?: string;
  operatorId: string;
  operatorName: string;
  initialFloat: number;
  cashSalesTotal: number;
  pixSalesTotal: number;
  cardDebitSalesTotal: number;
  cardCreditSalesTotal: number;
  totalSales: number;
  countedCash?: number;
  expectedCash?: number;
  difference?: number;
  differenceReason?: string;
  adminAuthorizedBy?: string;
  status: "OPEN" | "CLOSED";
};

const CURRENT_SHIFT_KEY = "meupdv_current_shift_v2";
const SHIFT_HISTORY_KEY = "meupdv_shift_history_v2";

export function getCurrentShift(): CashShift | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(CURRENT_SHIFT_KEY);
  if (!saved) {
    // Default open shift with initial float if not set
    const defaultShift: CashShift = {
      id: `shift-init-${Date.now()}`,
      openedAt: new Date().toISOString(),
      operatorId: "u1",
      operatorName: "Administrador Geral",
      initialFloat: 100,
      cashSalesTotal: 0,
      pixSalesTotal: 0,
      cardDebitSalesTotal: 0,
      cardCreditSalesTotal: 0,
      totalSales: 0,
      status: "OPEN",
    };
    saveCurrentShift(defaultShift);
    return defaultShift;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function saveCurrentShift(shift: CashShift | null): void {
  if (typeof window === "undefined") return;
  if (!shift) {
    localStorage.removeItem(CURRENT_SHIFT_KEY);
  } else {
    localStorage.setItem(CURRENT_SHIFT_KEY, JSON.stringify(shift));
  }
  window.dispatchEvent(new Event("meupdv_shift_updated"));
}

export function getShiftHistory(): CashShift[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(SHIFT_HISTORY_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveShiftHistory(history: CashShift[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHIFT_HISTORY_KEY, JSON.stringify(history));
  window.dispatchEvent(new Event("meupdv_shift_history_updated"));
}
