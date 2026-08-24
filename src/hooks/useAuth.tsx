import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MOCK_USERS, type AuthUser } from "@/data/mock-auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
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
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedId) return null;
    const found = MOCK_USERS.find((u) => u.id === savedId);
    return found ?? null;
  });

  const [openingFloat, setOpeningFloat] = useState<number>(() => {
    if (typeof window === "undefined") return 100;
    const saved = localStorage.getItem(SHIFT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.openingFloat ?? 100;
      } catch {
        return 100;
      }
    }
    return 100;
  });

  const [isShiftOpen, setIsShiftOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem(SHIFT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.isOpen ?? true;
      } catch {
        return true;
      }
    }
    return true;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

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
