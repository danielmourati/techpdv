import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MOCK_USERS, type AuthUser } from "@/data/mock-auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  isShiftOpen: boolean;
  openingFloat: number;
  login: (userId: string, passwordOrPin?: string, initialFloat?: number) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  openShift: (floatAmount: number) => void;
  closeShift: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "meupdv_current_user_id";
const SHIFT_STORAGE_KEY = "meupdv_shift_status_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado inicial igual no servidor e no cliente para evitar erro de hidratação;
  // a sessão salva é lida somente depois da montagem.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isShiftOpen, setIsShiftOpen] = useState<boolean>(false);
  const [openingFloat, setOpeningFloat] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedId) {
      setUser(MOCK_USERS.find((u) => u.id === savedId) ?? null);
    }
    try {
      const raw = localStorage.getItem(SHIFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setIsShiftOpen(!!parsed.isOpen);
        setOpeningFloat(Number(parsed.openingFloat) || 0);
      }
    } catch {
      /* ignora storage inválido */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    window.dispatchEvent(new Event("meupdv_auth_changed"));
  }, [user, hydrated]);

  const persistShift = (open: boolean, floatVal: number) => {
    setIsShiftOpen(open);
    setOpeningFloat(floatVal);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        SHIFT_STORAGE_KEY,
        JSON.stringify({ isOpen: open, openingFloat: floatVal, openedAt: new Date().toISOString() })
      );
    }
  };

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
      if (!match) {
        return false;
      }
    }

    setUser(targetUser);
    if (initialFloat !== undefined) {
      persistShift(true, initialFloat);
    }
    return true;
  };

  const switchUser = (userId: string) => {
    const targetUser = MOCK_USERS.find((u) => u.id === userId);
    if (targetUser) {
      setUser(targetUser);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new Event("meupdv_auth_changed"));
    }
  };

  const openShift = (floatAmount: number) => {
    persistShift(true, floatAmount);
  };

  const closeShift = () => {
    persistShift(false, 0);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        hydrated,
        isShiftOpen,
        openingFloat,
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
