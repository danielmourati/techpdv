import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  FileCode,
  Key,
  Lock,
  Printer,
  Save,
  Scale,
  Settings,
  ShieldCheck,
  Store,
  UserCheck,
  UserPlus,
  Palette,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { StoreSettings } from "@/data/mock-settings";
import { useSettings } from "@/hooks/useSettings";
import { MOCK_USERS, type AuthUser } from "@/data/mock-auth";
import { ThemePicker } from "@/components/pos/ThemePicker";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações do Sistema — MeuPDV" },
      { name: "description", content: "Parametrização de empresa, impressoras térmicas, balanças, NFC-e e usuários." },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { settings, dirty, update, save, discard } = useSettings();
  const [users, setUsers] = useState<AuthUser[]>(MOCK_USERS);
  const [isTestingScale, setIsTestingScale] = useState(false);

  const setSettings = (next: StoreSettings) => update(next);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    save();
    toast.success("Configurações salvas e aplicadas no sistema!");
  };

  const handleDiscard = () => {
    discard();
    toast.info("Alterações descartadas.");
  };

  const handleTestScale = () => {
    setIsTestingScale(true);
    setTimeout(() => {
      setIsTestingScale(false);
      const simulatedWeight = (Math.random() * 2 + 0.5).toFixed(3);
      toast.success(
        `Comunicação OK com ${settings.scaleModel} na porta ${settings.scalePort}! Peso lido: ${simulatedWeight} kg`,
      );
    }, 800);
  };

  return (
    <AppLayout
      title="Configurações do Sistema"
      subtitle="Parâmetros da empresa, frente de caixa, periféricos e usuários"
    >
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <Tabs defaultValue="empresa" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full md:w-auto">
              <TabsTrigger value="empresa" className="text-xs flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="pdv" className="text-xs flex items-center gap-1.5">
                <Store className="size-3.5" />
                Frente de Caixa
              </TabsTrigger>
              <TabsTrigger value="hardware" className="text-xs flex items-center gap-1.5">
                <Printer className="size-3.5" />
                Impressora & Balança
              </TabsTrigger>
              <TabsTrigger value="fiscal" className="text-xs flex items-center gap-1.5">
                <FileCode className="size-3.5" />
                Fiscal & NFC-e
              </TabsTrigger>
              <TabsTrigger value="aparencia" className="text-xs flex items-center gap-1.5">
                <Palette className="size-3.5" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="text-xs flex items-center gap-1.5">
                <Users className="size-3.5" />
                Usuários & Acesso
              </TabsTrigger>
            </TabsList>

            <Button type="submit" size="sm" className="hidden md:flex gap-1.5">
              <Save className="size-4" />
              Salvar Alterações
            </Button>
          </div>

          {/* TAB: Aparência */}
          <TabsContent value="aparencia">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Paleta de Cores do Sistema</CardTitle>
                <CardDescription className="text-xs">
                  Escolha o tema visual da frente de caixa e dos cadastros conforme a iluminação da
                  loja e o tipo de operação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemePicker />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 1: Dados da Empresa */}
          <TabsContent value="empresa">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Dados Cadastrais da Empresa</CardTitle>
                <CardDescription className="text-xs">
                  Informações impressas no cabeçalho do cupom e utilizadas na emissão fiscal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="cfg-comp" className="text-xs font-semibold">
                      Razão Social
                    </Label>
                    <Input
                      id="cfg-comp"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-trade" className="text-xs font-semibold">
                      Nome Fantasia
                    </Label>
                    <Input
                      id="cfg-trade"
                      value={settings.tradeName}
                      onChange={(e) => setSettings({ ...settings, tradeName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-cnpj" className="text-xs font-semibold">
                      CNPJ
                    </Label>
                    <Input
                      id="cfg-cnpj"
                      value={settings.cnpj}
                      onChange={(e) => setSettings({ ...settings, cnpj: e.target.value })}
                      className="h-9 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-ie" className="text-xs font-semibold">
                      Inscrição Estadual
                    </Label>
                    <Input
                      id="cfg-ie"
                      value={settings.stateRegistration}
                      onChange={(e) =>
                        setSettings({ ...settings, stateRegistration: e.target.value })
                      }
                      className="h-9 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-phone" className="text-xs font-semibold">
                      Telefone de Contato
                    </Label>
                    <Input
                      id="cfg-phone"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-email" className="text-xs font-semibold">
                      E-mail Comercial
                    </Label>
                    <Input
                      id="cfg-email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-border pt-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="cfg-addr" className="text-xs font-semibold">
                      Endereço (Logradouro e Número)
                    </Label>
                    <Input
                      id="cfg-addr"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-neigh" className="text-xs font-semibold">
                      Bairro
                    </Label>
                    <Input
                      id="cfg-neigh"
                      value={settings.neighborhood}
                      onChange={(e) => setSettings({ ...settings, neighborhood: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-city" className="text-xs font-semibold">
                      Cidade
                    </Label>
                    <Input
                      id="cfg-city"
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-state" className="text-xs font-semibold">
                      UF
                    </Label>
                    <Input
                      id="cfg-state"
                      value={settings.state}
                      onChange={(e) =>
                        setSettings({ ...settings, state: e.target.value.toUpperCase() })
                      }
                      className="h-9 text-xs uppercase"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-cep" className="text-xs font-semibold">
                      CEP
                    </Label>
                    <Input
                      id="cfg-cep"
                      value={settings.zipCode}
                      onChange={(e) => setSettings({ ...settings, zipCode: e.target.value })}
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Frente de Caixa */}
          <TabsContent value="pdv">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Parâmetros do PDV</CardTitle>
                <CardDescription className="text-xs">
                  Ajuste regras operacionais, mensagens no cupom e limites de desconto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="cfg-footer" className="text-xs font-semibold">
                    Mensagem de Rodapé no Cupom Térmico
                  </Label>
                  <Input
                    id="cfg-footer"
                    value={settings.receiptFooterMessage}
                    onChange={(e) =>
                      setSettings({ ...settings, receiptFooterMessage: e.target.value })
                    }
                    placeholder="Ex: Obrigado pela preferência! Volte sempre."
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <Label htmlFor="allow-disc" className="text-xs font-semibold">
                        Permitir Desconto Manual
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Operador pode conceder descontos no fechamento
                      </p>
                    </div>
                    <Switch
                      id="allow-disc"
                      checked={settings.allowManualDiscount}
                      onCheckedChange={(val) =>
                        setSettings({ ...settings, allowManualDiscount: val })
                      }
                    />
                  </div>

                  <div className="space-y-1 rounded-lg border border-border p-3">
                    <Label htmlFor="max-disc" className="text-xs font-semibold">
                      Desconto Máximo Permitido (%)
                    </Label>
                    <Input
                      id="max-disc"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.maxDiscountPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxDiscountPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-8 font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <Label htmlFor="ask-cust" className="text-xs font-semibold">
                        Solicitar CPF na Venda
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Abre prompt de identificação antes do cupom
                      </p>
                    </div>
                    <Switch
                      id="ask-cust"
                      checked={settings.askCustomerIdentification}
                      onCheckedChange={(val) =>
                        setSettings({ ...settings, askCustomerIdentification: val })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <Label htmlFor="auto-print" className="text-xs font-semibold">
                        Impressão Automática de Cupom
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Imprime comprovante assim que finalizado
                      </p>
                    </div>
                    <Switch
                      id="auto-print"
                      checked={settings.autoPrintReceipt}
                      onCheckedChange={(val) =>
                        setSettings({ ...settings, autoPrintReceipt: val })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Impressora & Balança */}
          <TabsContent value="hardware">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Periféricos & Automação</CardTitle>
                <CardDescription className="text-xs">
                  Configuração de impressora térmica não fiscal e balança eletrônica checkout.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* Printer */}
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                  <h4 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Printer className="size-3.5 text-primary" />
                    Impressora de Cupom
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="cfg-printer-type" className="text-xs font-semibold">
                        Modelo / Largura do Papel
                      </Label>
                      <Select
                        value={settings.printerType}
                        onValueChange={(val: any) =>
                          setSettings({ ...settings, printerType: val })
                        }
                      >
                        <SelectTrigger id="cfg-printer-type" className="h-9 text-xs">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="THERMAL_80MM">Térmica 80mm (Padrão PDV)</SelectItem>
                          <SelectItem value="THERMAL_58MM">Térmica 58mm (Compacta)</SelectItem>
                          <SelectItem value="A4_DESKTOP">Impressora Comum (Folha A4)</SelectItem>
                          <SelectItem value="NONE">Sem Impressora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cfg-printer-port" className="text-xs font-semibold">
                        Porta ou Driver
                      </Label>
                      <Input
                        id="cfg-printer-port"
                        value={settings.printerPort}
                        onChange={(e) =>
                          setSettings({ ...settings, printerPort: e.target.value })
                        }
                        placeholder="Ex: USB001 / EPSON TM-T20X"
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Scale */}
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Scale className="size-3.5 text-blue-500" />
                      Balança Eletrônica
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestScale}
                      disabled={isTestingScale}
                      className="h-7 text-xs"
                    >
                      {isTestingScale ? "Testando..." : "Testar Leitura da Balança"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label htmlFor="cfg-scale-model" className="text-xs font-semibold">
                        Protocolo da Balança
                      </Label>
                      <Select
                        value={settings.scaleModel}
                        onValueChange={(val: any) =>
                          setSettings({ ...settings, scaleModel: val })
                        }
                      >
                        <SelectTrigger id="cfg-scale-model" className="h-9 text-xs">
                          <SelectValue placeholder="Modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TOLEDO_PRIX3">Toledo Prix 3 / 9094</SelectItem>
                          <SelectItem value="FILIZOLA_PLATINA">Filizola Platina / CS</SelectItem>
                          <SelectItem value="ELGIN_DP30">Elgin DP30 / DP15</SelectItem>
                          <SelectItem value="URANO_POP">Urano POP / TopMAX</SelectItem>
                          <SelectItem value="GENERIC">Genérico / Padrão NCI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cfg-scale-port" className="text-xs font-semibold">
                        Porta Serial / COM
                      </Label>
                      <Input
                        id="cfg-scale-port"
                        value={settings.scalePort}
                        onChange={(e) => setSettings({ ...settings, scalePort: e.target.value })}
                        placeholder="COM1 ou /dev/ttyUSB0"
                        className="h-9 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cfg-baud" className="text-xs font-semibold">
                        Baud Rate (Velocidade)
                      </Label>
                      <Input
                        id="cfg-baud"
                        type="number"
                        value={settings.scaleBaudRate}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            scaleBaudRate: parseInt(e.target.value) || 9600,
                          })
                        }
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Fiscal & NFC-e */}
          <TabsContent value="fiscal">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Emissão Fiscal (NFC-e / SAT)</CardTitle>
                <CardDescription className="text-xs">
                  Credenciais de homologação e produção da SEFAZ para emissão do cupom eletrônico.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="cfg-env" className="text-xs font-semibold">
                      Ambiente de Emissão
                    </Label>
                    <Select
                      value={settings.nfceEnvironment}
                      onValueChange={(val: any) =>
                        setSettings({ ...settings, nfceEnvironment: val })
                      }
                    >
                      <SelectTrigger id="cfg-env" className="h-9 text-xs">
                        <SelectValue placeholder="Ambiente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOMOLOGACAO">Homologação (Testes)</SelectItem>
                        <SelectItem value="PRODUCAO">Produção (Validade Fiscal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-series" className="text-xs font-semibold">
                      Série da NFC-e
                    </Label>
                    <Input
                      id="cfg-series"
                      type="number"
                      value={settings.nfceSeries}
                      onChange={(e) =>
                        setSettings({ ...settings, nfceSeries: parseInt(e.target.value) || 1 })
                      }
                      className="h-9 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-last-num" className="text-xs font-semibold">
                      Último Número Emitido
                    </Label>
                    <Input
                      id="cfg-last-num"
                      type="number"
                      value={settings.nfceLastNumber}
                      onChange={(e) =>
                        setSettings({ ...settings, nfceLastNumber: parseInt(e.target.value) || 1 })
                      }
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-border pt-3">
                  <div className="space-y-1">
                    <Label htmlFor="cfg-csc-id" className="text-xs font-semibold">
                      ID do Token CSC (SEFAZ)
                    </Label>
                    <Input
                      id="cfg-csc-id"
                      value={settings.cscId}
                      onChange={(e) => setSettings({ ...settings, cscId: e.target.value })}
                      placeholder="000001"
                      className="h-9 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cfg-csc-token" className="text-xs font-semibold">
                      Código do Token CSC
                    </Label>
                    <Input
                      id="cfg-csc-token"
                      value={settings.cscToken}
                      onChange={(e) => setSettings({ ...settings, cscToken: e.target.value })}
                      placeholder="Chave alfanumérica fornecida pela SEFAZ"
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: Usuários e Operadores */}
          <TabsContent value="usuarios">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Usuários do Sistema</CardTitle>
                <CardDescription className="text-xs">
                  Controle de contas com permissões de Administrador e Operadores de Caixa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground">
                      <tr>
                        <th className="p-3">Usuário</th>
                        <th className="p-3">Login / E-mail</th>
                        <th className="p-3">Perfil de Acesso</th>
                        <th className="p-3">Senha Padrão (Demo)</th>
                        <th className="p-3">PIN Rápido</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/20">
                          <td className="p-3 flex items-center gap-2">
                            <span
                              className={`grid size-7 shrink-0 place-items-center rounded-md font-display text-xs font-bold ${
                                u.role === "admin"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-emerald-600 text-white"
                              }`}
                            >
                              {u.avatarText}
                            </span>
                            <span className="font-semibold text-foreground">{u.name}</span>
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">{u.email}</td>
                          <td className="p-3">
                            <Badge
                              variant={u.role === "admin" ? "default" : "secondary"}
                              className="text-[10px]"
                            >
                              {u.roleLabel}
                            </Badge>
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">{u.passwordHint}</td>
                          <td className="p-3 font-mono font-bold text-foreground">{u.pin}</td>
                          <td className="p-3 text-right">
                            <Badge className="bg-emerald-500/15 text-emerald-600">Ativo</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" className="gap-1.5">
            <Save className="size-4" />
            Salvar Todas as Configurações
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
