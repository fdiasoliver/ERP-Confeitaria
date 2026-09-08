"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("E-mail ou senha incorretos.");
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-display mb-2 text-center text-2xl font-bold text-chocolate">
          Doce Atelier
        </h1>
        <p className="text-muted mb-8 text-center text-sm">Acesso exclusivo para a equipe</p>

        <form onSubmit={handleSubmit} className="shadow-card rounded-2xl bg-card p-6">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="atendente@docelelier.com.br"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-semibold">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-chocolate py-3 font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
