export type DeliveryType = "RETIRADA" | "ENTREGA_APP" | "ENTREGA_GRATIS";

export type PaymentMethod =
  | "PIX_ONLINE"
  | "PIX_ENTREGA"
  | "DINHEIRO"
  | "CARTAO_CREDITO";

export type OrderStatus =
  | "RASCUNHO"
  | "CONFIRMADO"
  | "EM_PRODUCAO"
  | "PRONTO"
  | "SAIU_ENTREGA"
  | "ENTREGUE"
  | "CANCELADO";

export type PaymentStatus =
  | "PENDENTE"
  | "PAGO"
  | "PARCIAL"
  | "ESTORNADO";

export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "ALEATORIA";

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  color: string;
  icon: string;
  isActive: boolean;
}

export type ProductCategoryInput = {
  name: string;
  sortOrder?: number;
  color?: string;
  icon?: string;
  isActive?: boolean;
};

export type ProductCategoryWithCount = ProductCategory & { productCount: number };

export interface OccasionTag {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OccasionTagInput = {
  name: string;
  sortOrder?: number;
  color?: string;
  icon?: string;
  isActive?: boolean;
};

export type OccasionTagWithCount = OccasionTag & { productCount: number };

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  imageEmoji: string;
  imageUrl?: string;   // URL real (Supabase/S3); quando disponível, tem prioridade sobre imageEmoji
  basePrice: number;
  leadTimeDays: number;
  featured?: boolean;
  occasions: string[];
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  observation?: string;
}

export interface Address {
  id: string;
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

// Usado no checkout para criar um novo endereço — sem id, label ou isDefault
// que são definidos pela API. Compatível com Address ao omitir campos gerenciados pelo servidor.
export interface DeliveryAddressInput {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  addresses: Address[];
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observation?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryDate: string;
  receiverName?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  orderNotes?: string;
}

export interface StoreConfig {
  id: string;
  name: string;
  legalName: string | null;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string;
  addressState: string;
  addressZip: string | null;
  ibgeCode: string | null;
  latitude: number | null;
  longitude: number | null;
  freeDeliveryRadiusKm: number;
  pixKeyType: PixKeyType | null;
  pixKey: string | null;
  laborCostPerHour: number;
  fixedCostMonthly: number;
  monthlyProductionUnits: number;
  monthlyProductionMinutes: number;
  targetMarginPercent: number;
  // Identidade visual — armazenados em ThemeConfig, expostos aqui pela camada de serviço
  logoUrl: string | null;
  faviconUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Campos editáveis pelo formulário — exclui id, timestamps, coordenadas e ibgeCode (readonly)
export type StoreConfigInput = {
  name: string;
  legalName: string | null;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string;
  addressState: string;
  addressZip: string | null;
  freeDeliveryRadiusKm: number;
  pixKeyType: PixKeyType | null;
  pixKey: string | null;
  laborCostPerHour: number;
  fixedCostMonthly: number;
  monthlyProductionUnits: number;
  monthlyProductionMinutes: number;
  targetMarginPercent: number;
  logoUrl: string | null;
  faviconUrl: string | null;
};

export const DELIVERY_LABELS: Record<DeliveryType, { title: string; description: string }> = {
  RETIRADA: {
    title: "Retirada na loja",
    description: "Sem custo",
  },
  ENTREGA_GRATIS: {
    title: "Entrega gratuita",
    description: "Até 3 km — custo da confeitaria",
  },
  ENTREGA_APP: {
    title: "Uber / 99 Entregas",
    description: "Taxa paga pelo cliente",
  },
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  PIX_ONLINE: "PIX agora",
  PIX_ENTREGA: "PIX na entrega",
  DINHEIRO: "Dinheiro",
  CARTAO_CREDITO: "Cartão de crédito",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  RASCUNHO: "Rascunho",
  CONFIRMADO: "Confirmado",
  EM_PRODUCAO: "Em produção",
  PRONTO: "Pronto",
  SAIU_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const PIX_KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  TELEFONE: "Telefone",
  ALEATORIA: "Chave aleatória",
};
