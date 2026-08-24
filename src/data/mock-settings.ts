import { DEFAULT_THEME, type ThemeId } from "./theme-palettes";

export type StoreSettings = {
  // Aparência
  theme: ThemeId;

  // Dados da Empresa

  companyName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  taxRegime: "SIMPLES_NACIONAL" | "LUCRO_PRESUMIDO" | "MEI";

  // Frente de Caixa
  receiptFooterMessage: string;
  askCustomerIdentification: boolean;
  allowManualDiscount: boolean;
  maxDiscountPercent: number;
  autoPrintReceipt: boolean;

  // Impressora & Balança
  printerType: "THERMAL_80MM" | "THERMAL_58MM" | "A4_DESKTOP" | "NONE";
  printerPort: string;
  scaleModel: "TOLEDO_PRIX3" | "FILIZOLA_PLATINA" | "ELGIN_DP30" | "URANO_POP" | "GENERIC";
  scalePort: string;
  scaleBaudRate: number;

  // Fiscal NFC-e
  nfceEnvironment: "HOMOLOGACAO" | "PRODUCAO";
  nfceSeries: number;
  nfceLastNumber: number;
  cscId: string;
  cscToken: string;
  approximateTaxPercentage: number;
};

const INITIAL_SETTINGS: StoreSettings = {
  companyName: "Mercadinho Central de Alimentos Ltda",
  tradeName: "MeuPDV - Mercadinho Central",
  cnpj: "12.345.678/0001-90",
  stateRegistration: "123.456.789.000",
  phone: "(11) 3234-5678",
  email: "contato@mercadinhocentral.com.br",
  address: "Rua do Comércio, 100",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
  zipCode: "01001-000",
  taxRegime: "SIMPLES_NACIONAL",

  receiptFooterMessage: "Obrigado pela preferência! Volte sempre ao MeuPDV.",
  askCustomerIdentification: false,
  allowManualDiscount: true,
  maxDiscountPercent: 15,
  autoPrintReceipt: true,

  printerType: "THERMAL_80MM",
  printerPort: "USB001 / EPSON TM-T20X",
  scaleModel: "TOLEDO_PRIX3",
  scalePort: "COM1",
  scaleBaudRate: 9600,

  nfceEnvironment: "HOMOLOGACAO",
  nfceSeries: 1,
  nfceLastNumber: 105,
  cscId: "000001",
  cscToken: "A1B2C3D4E5F678901234567890ABCDEF",
  approximateTaxPercentage: 18.25,
};

const STORAGE_KEY = "meupdv_mock_settings_v1";

export function getStoredSettings(): StoreSettings {
  if (typeof window === "undefined") return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: StoreSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("meupdv_settings_updated"));
  } catch (err) {
    console.error("Error saving settings to localStorage", err);
  }
}
