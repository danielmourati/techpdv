import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  KeyRound,
  Lock,
  LogIn,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
  UserCheck,
} from "lucide-react";
import { MOCK_USERS, type AuthUser } from "@/data/mock-auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — MeuPDV" },
      { name: "description", content: "Acesso seguro ao sistema de PDV e Gestão." },
    ],
  }),
  component: LoginPage,
});

const DEFAULT_USER = MOCK_USERS[0]!;

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [selectedUserId, setSelectedUserId] = useState<string>(user?.id ?? DEFAULT_USER.id);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const selectedUser = MOCK_USERS.find((u) => u.id === selectedUserId) ?? DEFAULT_USER;

  const handleSelectUser = (id: string) => {
    setSelectedUserId(id);
    const u = MOCK_USERS.find((item) => item.id === id);
    if (u) {
      setPassword(u.passwordHint);
    }
  };

  const handleQuickLogin = (u: AuthUser) => {
    setSelectedUserId(u.id);
    setPassword(u.passwordHint);
    setLoading(true);
    setTimeout(() => {
      login(u.id, u.passwordHint);
      toast.success(`Bem-vindo, ${u.name}! (${u.roleLabel})`);
      setLoading(false);
      navigate({ to: "/" });
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const success = login(selectedUserId, password || undefined);
      if (success) {
        toast.success(`Autenticado com sucesso como ${selectedUser.name}!`);
        navigate({ to: "/" });
      } else {
        toast.error("Senha ou PIN incorreto. Tente 'admin123' ou '123456'.");
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-radial from-background via-background to-muted/50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-black text-primary-foreground shadow-lg shadow-primary/20 ring-4 ring-primary/10">
            PD
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            MeuPDV
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Frente de Caixa & Gestão Comercial Inteligente
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 shadow-xl shadow-black/5">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="font-display text-lg font-bold">Identificação de Acesso</CardTitle>
            <CardDescription className="text-xs">
              Selecione o operador ou administrador para entrar no sistema.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Select User Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="user-select" className="text-xs font-semibold">
                  Selecione o Usuário
                </Label>
                <Select value={selectedUserId} onValueChange={handleSelectUser}>
                  <SelectTrigger id="user-select" className="h-12">
                    <SelectValue placeholder="Escolha um usuário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_USERS.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="py-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid size-7 shrink-0 place-items-center rounded-md font-display text-xs font-bold ${
                              u.role === "admin"
                                ? "bg-primary text-primary-foreground"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            {u.avatarText}
                          </span>
                          <div className="text-left">
                            <p className="font-medium leading-none">{u.name}</p>
                            <p className="text-[11px] text-muted-foreground">{u.roleLabel}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Preview Badge */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-md font-display text-xs font-bold ${
                      selectedUser.role === "admin"
                        ? "bg-primary text-primary-foreground"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {selectedUser.avatarText}
                  </span>
                  <div>
                    <p className="text-xs font-bold leading-tight">{selectedUser.name}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <Badge
                  variant={selectedUser.role === "admin" ? "default" : "secondary"}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  {selectedUser.role === "admin" ? "Admin" : "Operador"}
                </Badge>
              </div>

              {/* Password / PIN Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    Senha ou PIN de Acesso
                  </Label>
                  <button
                    type="button"
                    onClick={() => setPassword(selectedUser.passwordHint)}
                    className="text-[10px] font-medium text-primary hover:underline"
                  >
                    Preencher demo ({selectedUser.passwordHint})
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha..."
                    className="h-10 pl-9 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Fast 1-Click Access Buttons */}
              <div className="pt-1">
                <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                  Acesso rápido para demonstração:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto flex-col items-start gap-1 py-2 text-left"
                    onClick={() => handleQuickLogin(DEFAULT_USER)}
                  >
                    <span className="flex items-center gap-1.5 font-display text-xs font-bold text-primary">
                      <ShieldCheck className="size-3.5" />
                      Administrador
                    </span>
                    <span className="text-[10px] text-muted-foreground">Acesso Total</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto flex-col items-start gap-1 py-2 text-left"
                    onClick={() => handleQuickLogin(MOCK_USERS[1] ?? DEFAULT_USER)}
                  >
                    <span className="flex items-center gap-1.5 font-display text-xs font-bold text-emerald-600">
                      <UserCheck className="size-3.5" />
                      Operador
                    </span>
                    <span className="text-[10px] text-muted-foreground">Caixa & Vendas</span>
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button type="submit" className="w-full gap-2 font-semibold" disabled={loading}>
                <LogIn className="size-4" />
                {loading ? "Entrando..." : "Entrar no Sistema"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2026 MeuPDV — Sistema de Frente de Caixa e Gestão Comercial</p>
        </div>
      </div>
    </div>
  );
}
