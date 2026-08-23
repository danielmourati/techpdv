export type UserRole = "admin" | "operador";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatarText: string;
  badgeColor: string;
  passwordHint: string;
  pin: string;
};

export const MOCK_USERS: AuthUser[] = [
  {
    id: "user-admin",
    name: "Administrador Geral",
    username: "admin",
    email: "admin@meupdv.com.br",
    role: "admin",
    roleLabel: "Administrador",
    avatarText: "AD",
    badgeColor: "bg-primary text-primary-foreground",
    passwordHint: "admin123",
    pin: "1234",
  },
  {
    id: "user-operador",
    name: "Daniel Oliveira",
    username: "operador",
    email: "daniel@meupdv.com.br",
    role: "operador",
    roleLabel: "Operador de Caixa",
    avatarText: "DO",
    badgeColor: "bg-emerald-600 text-white",
    passwordHint: "123456",
    pin: "4321",
  },
];
