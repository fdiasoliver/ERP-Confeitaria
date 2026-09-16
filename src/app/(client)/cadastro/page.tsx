"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { HeaderMinimal } from "@/components/layout/Header";
import {
  getMyProfile,
  updateMyProfile,
  listMyAddresses,
  createMyAddress,
  ApiRequestError,
  type SavedAddress,
} from "@/services/customerProfileApi";
import type { ValidationError } from "@/lib/types";

interface AddressFormState {
  label: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  zipCode: string;
}

const EMPTY_ADDRESS_FORM: AddressFormState = {
  label: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  zipCode: "",
};

// Extrai a primeira mensagem de erro de validação relevante do servidor,
// caindo em fallback para a mensagem genérica do ApiRequestError.
function firstErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiRequestError) {
    if (Array.isArray(e.details) && e.details.length > 0) {
      const first = e.details[0] as ValidationError;
      if (first?.message) return first.message;
    }
    return e.message || fallback;
  }
  return e instanceof Error ? e.message : fallback;
}

function CadastroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/pedidos";
  const { data: session, status } = useSession();

  const isCustomer = status === "authenticated" && session?.user.userType === "customer";

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [concludeError, setConcludeError] = useState<string | null>(null);
  const [concluding, setConcluding] = useState(false);

  // Guarda de sessão: aguarda a sessão carregar; se não estiver autenticado
  // como cliente, redireciona ao login (mesmo padrão de checkout/page.tsx,
  // adaptado à ausência de carrinho nesta página).
  useEffect(() => {
    if (status === "loading") return;
    if (!isCustomer) {
      router.push("/login?callbackUrl=/cadastro");
    }
  }, [status, isCustomer, router]);

  // Pré-carrega nome/data de nascimento/endereços já existentes — uma única vez,
  // mesmo espírito do `initializedFromSession` de checkout/page.tsx.
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!isCustomer || loadedRef.current) return;
    loadedRef.current = true;
    setLoadingProfile(true);
    Promise.all([getMyProfile(), listMyAddresses()])
      .then(([profile, myAddresses]) => {
        setName(profile.name);
        setBirthDate(profile.birthDate ?? "");
        setAddresses(myAddresses);
      })
      .catch((e) => {
        console.error("Erro ao carregar cadastro:", e);
      })
      .finally(() => setLoadingProfile(false));
  }, [isCustomer]);

  const handleAddressFieldChange = (field: keyof AddressFormState, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = async () => {
    setAddressError(null);
    if (
      !addressForm.street.trim() ||
      !addressForm.number.trim() ||
      !addressForm.neighborhood.trim() ||
      !addressForm.zipCode.trim()
    ) {
      setAddressError("Preencha Rua, Número, Bairro e CEP.");
      return;
    }
    setSavingAddress(true);
    try {
      const created = await createMyAddress({
        label: addressForm.label.trim() || undefined,
        street: addressForm.street.trim(),
        number: addressForm.number.trim(),
        complement: addressForm.complement.trim() || undefined,
        neighborhood: addressForm.neighborhood.trim(),
        zipCode: addressForm.zipCode.trim(),
      });
      setAddresses((prev) => [...prev, created]);
      setAddressForm(EMPTY_ADDRESS_FORM);
      setShowAddressForm(false);
    } catch (e) {
      setAddressError(firstErrorMessage(e, "Erro ao salvar endereço. Tente novamente."));
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setAddressError(null);
  };

  const handleConclude = async () => {
    if (name.trim().length === 0 || concluding) return;
    setConcludeError(null);
    setConcluding(true);
    try {
      await updateMyProfile({ name: name.trim(), birthDate: birthDate || null });
      router.push(callbackUrl);
    } catch (e) {
      setConcludeError(firstErrorMessage(e, "Erro ao salvar cadastro. Tente novamente."));
    } finally {
      setConcluding(false);
    }
  };

  if (status === "loading" || !isCustomer) {
    return (
      <div className="mx-auto min-h-screen max-w-app bg-cream">
        <HeaderMinimal title="Complete seu cadastro" />
        <div className="p-8 text-center text-muted text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream pb-8">
      <HeaderMinimal title="Complete seu cadastro" />

      <div className="px-5 py-4">
        <p className="text-muted mb-6 text-sm">Só mais um passo para finalizar sua conta.</p>

        {loadingProfile ? (
          <div className="space-y-3">
            <div className="shadow-card h-14 animate-pulse rounded-xl bg-white" />
            <div className="shadow-card h-14 animate-pulse rounded-xl bg-white" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold">Nome *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="input-field"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-semibold">Data de nascimento (opcional)</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input-field"
              />
            </div>

            <hr className="my-6 border-sand" />

            <h3 className="font-display mb-3 font-semibold">Endereços</h3>

            {addresses.length > 0 && (
              <div className="mb-4 space-y-2">
                {addresses.map((addr) => (
                  <div key={addr.id} className="rounded-xl border border-sand p-3">
                    <p className="text-sm font-semibold">
                      {addr.label ? addr.label : `${addr.street}, ${addr.number}`}
                    </p>
                    {addr.label && (
                      <p className="text-muted text-xs">
                        {addr.street}, {addr.number}
                      </p>
                    )}
                    <p className="text-muted text-xs">{addr.neighborhood}</p>
                  </div>
                ))}
              </div>
            )}

            {!showAddressForm ? (
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="mb-6 w-full rounded-xl border border-dashed border-sand py-3 text-sm font-semibold text-chocolate"
              >
                + Adicionar endereço
              </button>
            ) : (
              <div className="mb-6 rounded-xl border border-sand p-4">
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-semibold">Rua / Avenida *</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => handleAddressFieldChange("street", e.target.value)}
                    placeholder="Ex: Rua Augusta"
                    className="input-field"
                  />
                </div>

                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Número *</label>
                    <input
                      type="text"
                      value={addressForm.number}
                      onChange={(e) => handleAddressFieldChange("number", e.target.value)}
                      placeholder="123"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">CEP *</label>
                    <input
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) => handleAddressFieldChange("zipCode", e.target.value)}
                      placeholder="00000-000"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-semibold">Bairro *</label>
                  <input
                    type="text"
                    value={addressForm.neighborhood}
                    onChange={(e) => handleAddressFieldChange("neighborhood", e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-semibold">Complemento (opcional)</label>
                  <input
                    type="text"
                    value={addressForm.complement}
                    onChange={(e) => handleAddressFieldChange("complement", e.target.value)}
                    placeholder="Apto, bloco, referência..."
                    className="input-field"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-semibold">Rótulo (opcional)</label>
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => handleAddressFieldChange("label", e.target.value)}
                    placeholder="Ex: Casa, Trabalho"
                    className="input-field"
                  />
                </div>

                {addressError && (
                  <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{addressError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelAddress}
                    disabled={savingAddress}
                    className="flex-1 rounded-xl border border-sand py-3 text-sm font-semibold disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                    className="flex-1 rounded-xl bg-chocolate py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {savingAddress ? "Salvando…" : "Salvar endereço"}
                  </button>
                </div>
              </div>
            )}

            {concludeError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{concludeError}</p>
            )}

            <button
              type="button"
              onClick={handleConclude}
              disabled={name.trim().length === 0 || concluding}
              className="w-full rounded-xl bg-chocolate py-4 font-semibold text-white disabled:opacity-60"
            >
              {concluding ? "Salvando…" : "Concluir"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Carregando...</div>}>
      <CadastroContent />
    </Suspense>
  );
}
