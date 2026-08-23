import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MOCK_USERS, type AuthUser } from "@/data/mock-auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (userId: string, passwordOrPin?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "meupdv_current_user_id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return MOCK_USERS[0];
    const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
    const found = MOCK_USERS.find((u) => u.id === savedId);
    return found ?? MOCK_USERS[0]; // default to first user (Admin) or operador
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (userId: string, passwordOrPin?: string): boolean => {
    const targetUser = MOCK_USERS.find((u) => u.id === userId);
    if (!targetUser) return false;

    if (passwordOrPin) {
      const match =
        passwordOrPin === targetUser.passwordHint ||
        passwordOrPin === targetUser.pin ||
        passwordOrPin === "123" ||
        passwordOrPin === "1234";
      if (!match) {
        // allow anyway if empty or demo, but if provided check match
        return false;
      }
    }

    setUser(targetUser);
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

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchUser,
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
