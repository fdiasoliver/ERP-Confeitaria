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
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestCode = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Digite um celular válido com DDD.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (!res.ok) throw new Error();
      setStep("code");
    } catch {
      setError("Não foi possível enviar o código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (code.trim().length !== 6) {
      setError("Digite o código de 6 dígitos recebido no WhatsApp.");
      return;
    }
    setError(null);
    setIsLoading(true);

    const result = await signIn("customer", {
      phone: phone.trim(),
      code: code.trim(),
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Código incorreto ou expirado. Tente novamente.");
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
              onClick={requestCode}
              disabled={isLoading}
              className="w-full rounded-xl bg-chocolate py-4 font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? "Enviando…" : "Enviar código"}
            </button>
          </>
        ) : (
          <>
            <p className="text-muted mb-4 text-sm">
              Enviamos um código para <strong>{phone}</strong> via WhatsApp.
            </p>
            <label className="mb-1.5 block text-sm font-semibold">Código de 6 dígitos</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="mb-4 w-full rounded-xl border border-sand px-4 py-3 tracking-[0.3em]"
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
              onClick={requestCode}
              disabled={isLoading}
              className="mt-3 w-full text-sm text-rose"
            >
              Reenviar código
            </button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setCode(""); setError(null); }}
              className="mt-2 w-full text-sm text-muted"
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
