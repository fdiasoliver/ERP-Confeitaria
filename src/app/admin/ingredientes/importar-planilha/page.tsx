"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { HeaderMinimal } from "@/components/layout/Header";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as ingredientApi from "@/lib/api/ingredientApi";
import { ApiRequestError, type ImportReport } from "@/lib/api/ingredientApi";

// Mesmo padrão estrutural de /admin/ingredientes/importar-nota (PageContainer +
// Card + Button, link "← Voltar" para /admin/ingredientes) — fluxo de import
// distinto (planilha Excel preenchida manualmente vs. QR Code de nota fiscal),
// por isso página própria, não abas da mesma tela.

export default function ImportarPlanilhaPage() {
  const [downloading, setDownloading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownloadTemplate() {
    setDownloading(true);
    try {
      await ingredientApi.downloadImportTemplate();
    } catch {
      toast.error("Erro ao gerar o template.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleImport() {
    if (!file || importing) return;
    setImporting(true);
    setError(null);
    setReport(null);
    const toastId = toast.loading("Importando planilha…");
    try {
      const result = await ingredientApi.importIngredients(file);
      setReport(result);
      const processed = result.created + result.updated;
      if (result.failed === 0) {
        toast.success(
          `${processed} ingrediente${processed !== 1 ? "s" : ""} processado${processed !== 1 ? "s" : ""} com sucesso.`,
          { id: toastId },
        );
      } else {
        toast.error(`${result.failed} linha${result.failed !== 1 ? "s" : ""} com erro. Veja o relatório abaixo.`, {
          id: toastId,
        });
      }
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Erro ao importar a planilha.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setImporting(false);
    }
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Importar planilha" />

      <div className="space-y-4 p-5">
        <Link href="/admin/ingredientes" className="text-sm font-medium text-chocolate underline">
          ← Voltar para Ingredientes
        </Link>

        <Card className="gap-3 rounded-2xl p-4">
          <p className="text-sm text-muted">
            Baixe o template, preencha os ingredientes no Excel e envie o arquivo de volta. Ingredientes com o mesmo
            nome de um já cadastrado têm preço/estoque/categoria atualizados; os demais são criados. A aba
            &quot;Referência&quot; do template lista as unidades e categorias já cadastradas no sistema.
          </p>
          <Button type="button" variant="outline" onClick={handleDownloadTemplate} disabled={downloading}>
            {downloading ? "Gerando…" : "Baixar template (.xlsx)"}
          </Button>
        </Card>

        <Card className="gap-3 rounded-2xl p-4">
          <input
            type="file"
            accept=".xlsx"
            aria-label="Selecionar planilha de ingredientes"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setReport(null);
              setError(null);
            }}
            disabled={importing}
            className="text-sm text-chocolate file:mr-3 file:rounded-lg file:border-0 file:bg-sand file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-chocolate"
          />
          {error && <p className="text-sm text-rose">{error}</p>}
          <Button type="button" onClick={handleImport} disabled={!file || importing}>
            {importing ? "Importando…" : "Importar planilha"}
          </Button>
        </Card>

        {report && (
          <Card className="gap-3 rounded-2xl p-4">
            <p className="text-sm text-chocolate">
              <strong>{report.totalRows}</strong> linha{report.totalRows !== 1 ? "s" : ""} lida
              {report.totalRows !== 1 ? "s" : ""} · <strong className="text-sage">{report.created}</strong> criado
              {report.created !== 1 ? "s" : ""} · <strong className="text-caramel">{report.updated}</strong>{" "}
              atualizado{report.updated !== 1 ? "s" : ""} · <strong className="text-rose">{report.failed}</strong> com
              erro
            </p>
            {report.errors.length > 0 && (
              <div className="space-y-2">
                {report.errors.map((e, i) => (
                  <div key={i} className="rounded-lg bg-rose/10 px-3 py-2 text-xs text-rose">
                    Linha {e.row} ({e.name}): {e.message}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
