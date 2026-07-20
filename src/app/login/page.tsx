"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeaderMinimal } from "@/components/layout/Header";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/pedidos";

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "name">("phone");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Digite um celular válido com DDD.");
      return;
    }
    setError(null);
    setStep("name");
  };

  const handleLogin = async () => {
    if (!name.trim()) {
      setError("Informe seu nome para continuar.");
      return;
    }
    setError(null);
    setIsLoading(true);

    // TODO (Fase 8): antes de chamar signIn, enviar OTP via WhatsApp e validar o código.
    // Por enquanto, o login é direto por telefone + nome (sem código de verificação).
    const result = await signIn("customer", {
      phone: phone.trim(),
      name: name.trim(),
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Não foi possível fazer login. Tente novamente.");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream">
      <HeaderMinimal title="Entrar" />

      <div className="px-5 py-6">
        <p className="text-muted mb-6 text-sm">
          Use seu celular com DDD para acessar ou criar sua conta.
        </p>

        {step === "phone" ? (
          <>
            <label className="mb-1.5 block text-sm font-semibold">Celular</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 98765-4321"
              className="mb-4 w-full rounded-xl border border-sand px-4 py-3"
            />
            {error && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <button
              type="button"
              onClick={handlePhoneSubmit}
              className="w-full rounded-xl bg-chocolate py-4 font-semibold text-white"
            >
              Continuar
            </button>
          </>
        ) : (
          <>
            <p className="text-muted mb-4 text-sm">
              Celular: <strong>{phone}</strong>
            </p>
            <label className="mb-1.5 block text-sm font-semibold">Seu nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como prefere ser chamado(a)?"
              className="mb-4 w-full rounded-xl border border-sand px-4 py-3"
              autoFocus
            />
            {error && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full rounded-xl bg-chocolate py-4 font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? "Entrando…" : "Confirmar e entrar"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setError(null); }}
              className="mt-3 w-full text-sm text-muted"
            >
              Alterar número
            </button>
          </>
        )}

        <p className="text-muted mt-8 text-center text-xs">
          Acesso seguro · Seus pedidos ficam vinculados ao seu celular
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
