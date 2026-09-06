"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { HeaderMinimal } from "@/components/layout/Header";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { Field } from "@/components/admin/config/FormPrimitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters/currency";
import * as ingredientApi from "@/lib/api/ingredientApi";
import type { Ingredient } from "@/lib/api/ingredientApi";
import * as nfceApi from "@/lib/api/nfceApi";
import { ApiRequestError, type NfceImportPreview } from "@/lib/api/nfceApi";

interface RowMapping {
  ingredientId: string;
  price: string;
}

export default function ImportarNotaFiscalPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [qrCodeContent, setQrCodeContent] = useState("");
  const [consulting, setConsulting] = useState(false);
  const [consultError, setConsultError] = useState<string | null>(null);
  const [preview, setPreview] = useState<NfceImportPreview | null>(null);
  const [mappings, setMappings] = useState<RowMapping[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    ingredientApi.listIngredients().then(setIngredients).catch(() => {});
  }, []);

  async function handleConsultar() {
    if (!qrCodeContent.trim() || consulting) return;
    setConsulting(true);
    setConsultError(null);
    setPreview(null);
    try {
      const result = await nfceApi.previewNfce(qrCodeContent.trim());
      setPreview(result);
      setMappings(
        result.items.map((item) => ({
          ingredientId: item.suggestedIngredientId ?? "",
          price: String(item.unitPrice),
        })),
      );
      setRowErrors({});
    } catch (err) {
      setConsultError(err instanceof ApiRequestError ? err.message : "Erro ao consultar a nota fiscal.");
    } finally {
      setConsulting(false);
    }
  }

  function updateMapping(index: number, field: keyof RowMapping, value: string) {
    setMappings((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  async function handleImportar() {
    if (!preview || importing) return;

    const toImport = mappings
      .map((m, index) => ({ index, ingredientId: m.ingredientId, price: Number(m.price) }))
      .filter((m) => m.ingredientId !== "");

    if (toImport.length === 0) {
      toast.error("Vincule ao menos um item a um ingrediente antes de importar.");
      return;
    }

    setImporting(true);
    const toastId = toast.loading("Importando itens da nota…");
    try {
      const results = await nfceApi.importNfce(
        preview.accessKey,
        toImport.map((m) => ({ ingredientId: m.ingredientId, price: m.price })),
      );

      const newRowErrors: Record<number, string> = {};
      let successCount = 0;
      results.forEach((result, i) => {
        const { index } = toImport[i];
        if (result.success) {
          successCount++;
        } else {
          newRowErrors[index] = result.error ?? "Erro ao importar este item.";
        }
      });
      setRowErrors(newRowErrors);

      if (successCount === results.length) {
        toast.success(`${successCount} item${successCount !== 1 ? "s" : ""} importado${successCount !== 1 ? "s" : ""} com sucesso.`, { id: toastId });
      } else if (successCount > 0) {
        toast.error(`${successCount} de ${results.length} itens importados. Veja os erros na tabela.`, { id: toastId });
      } else {
        toast.error("Nenhum item foi importado. Veja os erros na tabela.", { id: toastId });
      }
    } catch {
      toast.error("Erro ao importar os itens.", { id: toastId });
    } finally {
      setImporting(false);
    }
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Importar nota fiscal" />

      <div className="space-y-4 p-5">
        <Link href="/admin/ingredientes" className="text-sm font-medium text-chocolate underline">
          ← Voltar para Ingredientes
        </Link>

        <Card className="gap-3 rounded-2xl p-4">
          <p className="text-sm text-muted">
            Escaneie o QR Code do cupom fiscal com a câmera do celular e cole aqui o link completo (precisa incluir o
            hash de validação, não só a chave de 44 dígitos). Só cobre notas emitidas em São Paulo.
          </p>
          <Field label="Link ou payload do QR Code" htmlFor="qr-content">
            <textarea
              id="qr-content"
              className="input-field min-h-[80px] font-mono text-xs"
              value={qrCodeContent}
              onChange={(e) => setQrCodeContent(e.target.value)}
              placeholder="https://www.nfce.fazenda.sp.gov.br/qrcode?p=..."
              disabled={consulting}
            />
          </Field>
          {consultError && <p className="text-sm text-rose">{consultError}</p>}
          <Button type="button" onClick={handleConsultar} disabled={consulting || !qrCodeContent.trim()}>
            {consulting ? "Consultando…" : "Consultar nota"}
          </Button>
        </Card>

        {preview && (
          <Card className="gap-3 rounded-2xl p-4">
            <div>
              <p className="font-semibold text-chocolate">{preview.issuerName}</p>
              {preview.emittedAt && (
                <p className="text-xs text-muted">
                  Emitida em {new Date(preview.emittedAt).toLocaleString("pt-BR")}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {preview.items.map((item, index) => {
                const mapping = mappings[index];
                const alreadyImported = mapping?.ingredientId
                  ? preview.alreadyImportedIngredientIds.includes(mapping.ingredientId)
                  : false;
                return (
                  <div key={index} className="rounded-xl border border-sand p-3">
                    <p className="text-sm font-semibold text-chocolate">{item.description}</p>
                    <p className="text-xs text-muted">
                      Qtde.: {item.quantity} {item.unit} · Vl. Unit.: {formatCurrency(item.unitPrice)} · Total:{" "}
                      {formatCurrency(item.totalPrice)}
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <Field label="Ingrediente">
                        <select
                          className="input-field"
                          value={mapping?.ingredientId ?? ""}
                          onChange={(e) => updateMapping(index, "ingredientId", e.target.value)}
                          disabled={importing}
                        >
                          <option value="">Ignorar este item</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Preço a registrar">
                        <input
                          type="number"
                          step="any"
                          min={0}
                          className="input-field"
                          value={mapping?.price ?? ""}
                          onChange={(e) => updateMapping(index, "price", e.target.value)}
                          disabled={importing || !mapping?.ingredientId}
                        />
                      </Field>
                    </div>

                    {alreadyImported && (
                      <p className="mt-1 text-xs text-caramel">Este ingrediente já recebeu um preço importado dessa mesma nota.</p>
                    )}
                    {rowErrors[index] && <p className="mt-1 text-xs text-rose">{rowErrors[index]}</p>}
                  </div>
                );
              })}
            </div>

            <Button type="button" onClick={handleImportar} disabled={importing}>
              {importing ? "Importando…" : "Confirmar importação"}
            </Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
