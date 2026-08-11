import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateOtp } from "@/lib/otpService";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    // Provider para a equipe interna (admin)
    CredentialsProvider({
      id: "credentials",
      name: "Admin",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: "admin" as const,
        };
      },
    }),

    // Provider para clientes (identificados por celular) — login por código OTP
    // via WhatsApp (Módulo 5.B). validateOtp lança se o código for inválido,
    // expirado, já usado ou tiver excedido o número máximo de tentativas
    // (REGRAS_NEGOCIO.md 15.5, regra 14) — authorize() retorna null em todos
    // esses casos, sem distinguir o motivo para o cliente (mesmo padrão do
    // provider "credentials" acima).
    CredentialsProvider({
      id: "customer",
      name: "Cliente",
      credentials: {
        phone: { label: "Telefone", type: "text" },
        code: { label: "Código", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone?.trim();
        const code = credentials?.code?.trim();
        if (!phone || !code) return null;

        try {
          await validateOtp(phone, code);
        } catch {
          return null;
        }

        const customer = await prisma.customer.upsert({
          where: { phone },
          update: {},
          create: {
            name: "Cliente",
            phone,
          },
        });

        return {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          userType: "customer" as const,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.userType = user.userType ?? "admin";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string | undefined;
      session.user.phone = token.phone as string | undefined;
      session.user.userType = (token.userType ?? "admin") as "admin" | "customer";
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
