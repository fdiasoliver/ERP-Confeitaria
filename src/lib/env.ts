const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${key}\n` +
        `Copie .env.example para .env e preencha os valores.`
    );
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL as string,
};
