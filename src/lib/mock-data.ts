import type { Customer, Order, Product } from "./types";
export { formatCurrency } from "./formatters/currency";
export { getMinDeliveryDate } from "./utils";

export const OCCASIONS = [
  { id: "all", name: "Todos" },
  { id: "aniversario", name: "Aniversário" },
  { id: "docinhos", name: "Docinhos" },
  { id: "cafe", name: "Café" },
  { id: "casamento", name: "Casamento" },
  { id: "corporativo", name: "Corporativo" },
  { id: "mesversario", name: "Mesversário" },
];

export const CATEGORIES = [
  { id: "bolos", name: "Bolos de Aniversário", slug: "bolos" },
  { id: "doces", name: "Doces & Docinhos", slug: "doces" },
  { id: "kits", name: "Kits & Coffee Break", slug: "kits" },
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Bolo Red Velvet",
    description: "Massa aveludada com cream cheese",
    categoryId: "bolos",
    categoryName: "Bolos de Aniversário",
    imageEmoji: "🎂",
    basePrice: 180,
    leadTimeDays: 3,
    featured: true,
    occasions: ["aniversario", "casamento"],
  },
  {
    id: "2",
    name: "Brigadeiro Gourmet",
    description: "Chocolate belga 50%",
    categoryId: "doces",
    categoryName: "Doces & Docinhos",
    imageEmoji: "🧁",
    basePrice: 3.5,
    leadTimeDays: 1,
    featured: true,
    occasions: ["docinhos", "aniversario", "corporativo", "cafe"],
  },
  {
    id: "3",
    name: "Bolo Chocolate 25cm",
    description: "Recheio ganache meio amargo",
    categoryId: "bolos",
    categoryName: "Bolos de Aniversário",
    imageEmoji: "🍫",
    basePrice: 145,
    leadTimeDays: 3,
    occasions: ["aniversario", "mesversario"],
  },
  {
    id: "4",
    name: "Naked Cake Frutas",
    description: "Frutas vermelhas frescas",
    categoryId: "bolos",
    categoryName: "Bolos de Aniversário",
    imageEmoji: "🍓",
    basePrice: 195,
    leadTimeDays: 4,
    occasions: ["casamento", "aniversario"],
  },
  {
    id: "5",
    name: "Mini Naked Cake",
    description: "Individual, perfeito para mesversário",
    categoryId: "bolos",
    categoryName: "Bolos de Aniversário",
    imageEmoji: "🎀",
    basePrice: 45,
    leadTimeDays: 2,
    occasions: ["mesversario", "aniversario"],
  },
  {
    id: "6",
    name: "Kit Coffee Break (20 pessoas)",
    description: "Doces, salgados doces e bebidas",
    categoryId: "kits",
    categoryName: "Kits & Coffee Break",
    imageEmoji: "☕",
    basePrice: 380,
    leadTimeDays: 2,
    occasions: ["cafe", "corporativo"],
  },
  {
    id: "7",
    name: "Caixa Casamento (100 doces)",
    description: "Mix tradicional premium",
    categoryId: "doces",
    categoryName: "Doces & Docinhos",
    imageEmoji: "💒",
    basePrice: 320,
    leadTimeDays: 5,
    occasions: ["casamento"],
  },
  {
    id: "8",
    name: "Bolo Corporativo Logo",
    description: "Personalização com logo da empresa",
    categoryId: "bolos",
    categoryName: "Bolos de Aniversário",
    imageEmoji: "🏢",
    basePrice: 220,
    leadTimeDays: 4,
    occasions: ["corporativo"],
  },
];

export const MOCK_CUSTOMER: Customer = {
  id: "c1",
  name: "Maria Silva",
  phone: "(11) 98765-4321",
  addresses: [
    {
      id: "a1",
      label: "Casa",
      street: "Rua Augusta",
      number: "500",
      neighborhood: "Consolação",
      city: "São Paulo",
      state: "SP",
      zipCode: "01305-000",
      isDefault: true,
    },
    {
      id: "a2",
      label: "Trabalho",
      street: "Av. Paulista",
      number: "1000",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
    },
  ],
};

export const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    orderNumber: 1842,
    status: "EM_PRODUCAO",
    deliveryType: "ENTREGA_GRATIS",
    deliveryDate: "2026-07-05",
    receiverName: "Maria Silva",
    items: [
      {
        productId: "1",
        productName: "Bolo Red Velvet",
        quantity: 1,
        unitPrice: 180,
        totalPrice: 180,
        observation: 'Escrever "Parabéns Ana" em chocolate',
      },
      {
        productId: "2",
        productName: "Brigadeiro Gourmet",
        quantity: 24,
        unitPrice: 3.5,
        totalPrice: 84,
      },
    ],
    subtotal: 264,
    deliveryFee: 0,
    total: 264,
    paymentMethod: "PIX_ONLINE",
    orderNotes: "Decoração tema unicórnio, cores pastel",
  },
  {
    id: "o2",
    orderNumber: 1798,
    status: "ENTREGUE",
    deliveryType: "ENTREGA_APP",
    deliveryDate: "2026-06-15",
    receiverName: "Maria Silva",
    items: [
      {
        productId: "5",
        productName: "Mini Naked Cake",
        quantity: 2,
        unitPrice: 45,
        totalPrice: 90,
      },
      {
        productId: "2",
        productName: "Brigadeiro Gourmet",
        quantity: 50,
        unitPrice: 3.5,
        totalPrice: 175,
      },
    ],
    subtotal: 420,
    deliveryFee: 18,
    total: 438,
    paymentMethod: "CARTAO_CREDITO",
  },
];

export function getMaxLeadTimeDays(productIds: string[]): number {
  const products = PRODUCTS.filter((p) => productIds.includes(p.id));
  return Math.max(0, ...products.map((p) => p.leadTimeDays));
}
