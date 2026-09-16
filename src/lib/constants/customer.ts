// Placeholder de nome usado ao criar um Customer novo via login OTP — antes de o
// cliente preencher o cadastro complementar (Nome/Endereço/Data de nascimento).
// Centraliza o que antes era um literal duplicado em dois pontos:
// src/app/api/auth/[...nextauth]/route.ts (authorize do provider "customer") e
// src/app/api/orders/route.ts (upsert de customer dentro da transação de pedido).
// Também usado por customerProfileService.ts para derivar `isProfileComplete`.
export const NEW_CUSTOMER_PLACEHOLDER_NAME = "Cliente" as const;
