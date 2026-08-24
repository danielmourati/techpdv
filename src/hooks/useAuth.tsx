import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MOCK_USERS, type AuthUser } from "@/data/mock-auth";
import {
  getCurrentShift,
  saveCurrentShift,
  type CashShift,
} from "@/data/mock-cash-shift";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  isShiftOpen: boolean;
  openingFloat: number;
  currentShift: CashShift | null;
  login: (userId: string, passwordOrPin?: string, initialFloat?: number) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  openShift: (floatAmount: number) => void;
  closeShift: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "meupdv_current_user_id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeShift, setActiveShift] = useState<CashShift | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const syncShift = useCallback(() => {
    setActiveShift(getCurrentShift());
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedId) {
      setUser(MOCK_USERS.find((candidate) => candidate.id === savedId) ?? null);
    }
    syncShift();
    setHydrated(true);

    window.addEventListener("meupdv_shift_updated", syncShift);
    return () => window.removeEventListener("meupdv_shift_updated", syncShift);
  }, [syncShift]);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("meupdv_auth_changed"));
    }
  }, [hydrated, user]);

  const login = (userId: string, passwordOrPin?: string, initialFloat?: number): boolean => {
    const targetUser = MOCK_USERS.find((u) => u.id === userId);
    if (!targetUser) return false;

    if (passwordOrPin) {
      const match =
        passwordOrPin === targetUser.passwordHint ||
        passwordOrPin === targetUser.pin ||
        passwordOrPin === "123" ||
        passwordOrPin === "1234" ||
        passwordOrPin === "admin123" ||
        passwordOrPin === "123456";
      if (!match) return false;
    }

    setUser(targetUser);
    if (initialFloat !== undefined && initialFloat > 0) {
      const existing = getCurrentShift();
      if (!existing || existing.status !== "OPEN") {
        const newShift: CashShift = {
          id: `shift-${Date.now()}`,
          openedAt: new Date().toISOString(),
          operatorId: targetUser.id,
          operatorName: targetUser.name,
          initialFloat,
          cashSalesTotal: 0,
          pixSalesTotal: 0,
          cardDebitSalesTotal: 0,
          cardCreditSalesTotal: 0,
          totalSales: 0,
          status: "OPEN",
        };
        saveCurrentShift(newShift);
        setActiveShift(newShift);
      } else {
        setActiveShift(existing);
      }
    }
    return true;
  };

  const switchUser = (userId: string) => {
    const targetUser = MOCK_USERS.find((u) => u.id === userId);
    if (targetUser) setUser(targetUser);
  };

  const logout = () => {
    setUser(null);
  };

  const openShift = (floatAmount: number) => {
    const newShift: CashShift = {
      id: `shift-${Date.now()}`,
      openedAt: new Date().toISOString(),
      operatorId: user?.id ?? "u1",
      operatorName: user?.name ?? "Operador",
      initialFloat: floatAmount,
      cashSalesTotal: 0,
      pixSalesTotal: 0,
      cardDebitSalesTotal: 0,
      cardCreditSalesTotal: 0,
      totalSales: 0,
      status: "OPEN",
    };
    saveCurrentShift(newShift);
    setActiveShift(newShift);
  };

  const closeShift = () => {
    saveCurrentShift(null);
    setActiveShift(null);
  };

  const isShiftOpen = activeShift?.status === "OPEN";
  const openingFloat = activeShift?.initialFloat ?? 0;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        hydrated,
        isShiftOpen,
        openingFloat,
        currentShift: activeShift,
        login,
        logout,
        switchUser,
        openShift,
        closeShift,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
