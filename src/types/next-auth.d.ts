import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;        // UserRole do admin (ADMIN, ATENDIMENTO, PRODUCAO, FINANCEIRO)
      phone?: string;       // celular do cliente (Customer.phone)
      userType: "admin" | "customer";
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    phone?: string;
    userType: "admin" | "customer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    phone?: string;
    userType: "admin" | "customer";
  }
}
