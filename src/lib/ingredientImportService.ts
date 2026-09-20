import ExcelJS from "exceljs";
import {
  createIngredient,
  updateIngredient,
  IngredientValidationFailedError,
  DuplicateIngredientNameError,
  InvalidUnitReferenceError,
  InvalidCategoryReferenceError,
} from "@/lib/ingredientService";
import { findIngredientByName } from "@/lib/repositories/ingredientRepository";
import { findUnitByAbbreviation, findUnitByName, listActiveUnits } from "@/lib/repositories/unitRepository";
import { findIngredientCategoryByName, listAllIngredientCategories } from "@/lib/repositories/ingredientCategoryRepository";
import type { IngredientInput } from "@/lib/validators/ingredientValidator";

// ─── Template (exportação) ─────────────────────────────────────────────────
//
// Segunda aba de referência é gerada a partir do banco real (não estática) —
// lista as Unidades/Categorias já cadastradas, para o usuário preencher a
// coluna "Unidade"/"Categoria" sem erro de digitação. externalCode/
// externalSource ficam fora do template — são campos de sincronização
// CONAB/CEASA, de outro fluxo (ver ingredientService.ts).

const SHEET_NAME = "Ingredientes";
const REFERENCE_SHEET_NAME = "Referência (não editar)";

export async function generateIngredientTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet(SHEET_NAME);
  sheet.columns = [
    { header: "Nome", key: "name", width: 30 },
    { header: "Categoria", key: "category", width: 22 },
    { header: "Unidade", key: "unit", width: 18 },
    { header: "Preço atual", key: "price", width: 14 },
    { header: "Quantidade por embalagem", key: "packageQuantity", width: 20 },
    { header: "Preço da embalagem", key: "packagePrice", width: 18 },
    { header: "Estoque atual", key: "stock", width: 14 },
    { header: "Estoque mínimo", key: "minStock", width: 14 },
    { header: "Fornecedor", key: "supplier", width: 24 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.addRow({
    name: "Farinha de Trigo",
    category: "Farináceos",
    unit: "kg",
    price: 6.5,
    stock: 10,
    minStock: 2,
    supplier: "Distribuidora Central",
  });
  // Segunda linha de exemplo — mesmo ingrediente comprado por embalagem
  // (Preço atual fica em branco propositalmente: é calculado a partir das
  // duas colunas seguintes, mesmo espírito do alternador na tela de
  // ingredientes). Nome distinto para não colidir por upsert com a linha 1.
  sheet.addRow({
    name: "Leite Condensado",
    category: "",
    unit: "g",
    packageQuantity: 395,
    packagePrice: 8.5,
    stock: 0,
    minStock: 0,
    supplier: "",
  });

  const [units, categories] = await Promise.all([listActiveUnits(), listAllIngredientCategories()]);

  const refSheet = workbook.addWorksheet(REFERENCE_SHEET_NAME);
  refSheet.columns = [
    { header: "Unidades cadastradas (nome ou abreviação)", key: "unit", width: 42 },
    { header: "Categorias cadastradas", key: "category", width: 30 },
  ];
  refSheet.getRow(1).font = { bold: true };
  const refRowCount = Math.max(units.length, categories.length);
  for (let i = 0; i < refRowCount; i++) {
    refSheet.addRow({
      unit: units[i] ? `${units[i].name} (${units[i].abbreviation})` : "",
      category: categories[i]?.name ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// ─── Importação ─────────────────────────────────────────────────────────────
//
// Cada linha é processada de forma independente (decisão do Product Owner):
// uma linha com erro nunca aborta as demais. Nome já cadastrado (case-
// sensitive, mesmo critério de DuplicateIngredientNameError em
// ingredientService.ts) atualiza o ingrediente existente em vez de falhar
// (upsert, decisão do Product Owner) — reaproveita createIngredient/
// updateIngredient já existentes, nenhuma regra de negócio duplicada aqui.

export interface ImportRowError {
  row: number;
  name: string;
  message: string;
}

export interface ImportReportDTO {
  totalRows: number;
  created: number;
  updated: number;
  failed: number;
  errors: ImportRowError[];
}

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) return String((value as { text: unknown }).text ?? "");
  if (typeof value === "object" && "result" in value) return String((value as { result: unknown }).result ?? "");
  return String(value).trim();
}

function cellNumber(value: ExcelJS.CellValue): number | null {
  const text = cellText(value);
  if (text === "") return null;
  const normalized = text.replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : NaN;
}

export async function importIngredientsFromXlsx(buffer: Buffer): Promise<ImportReportDTO> {
  const workbook = new ExcelJS.Workbook();
  // exceljs resolve `Buffer` contra uma cópia de @types/node distinta da usada
  // neste arquivo (dependência transitiva via fast-csv) — mesmo objeto em
  // runtime; `any` aqui só contorna a incompatibilidade nominal entre as duas
  // declarações de tipo, não uma checagem real evitada.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);

  const sheet = workbook.getWorksheet(SHEET_NAME) ?? workbook.worksheets[0];
  if (!sheet) {
    return { totalRows: 0, created: 0, updated: 0, failed: 0, errors: [] };
  }

  // Mapeia coluna → índice pelo texto do cabeçalho (linha 1), robusto a
  // reordenação de colunas pelo usuário no Excel.
  const headerRow = sheet.getRow(1);
  const columnIndex: Record<string, number> = {};
  headerRow.eachCell((cell, colNumber) => {
    const header = cellText(cell.value).toLowerCase();
    // Ordem importa: variantes mais específicas de "preço"/"quantidade" (embalagem)
    // são checadas antes das genéricas ("preço atual"), senão o startsWith genérico
    // capturaria a coluna errada.
    if (header.startsWith("nome")) columnIndex.name = colNumber;
    else if (header.startsWith("categoria")) columnIndex.category = colNumber;
    else if (header.startsWith("unidade")) columnIndex.unit = colNumber;
    else if (header.startsWith("quantidade por embalagem")) columnIndex.packageQuantity = colNumber;
    else if (header.startsWith("preço da embalagem") || header.startsWith("preco da embalagem")) columnIndex.packagePrice = colNumber;
    else if (header.startsWith("preço") || header.startsWith("preco")) columnIndex.price = colNumber;
    else if (header.startsWith("estoque atual")) columnIndex.stock = colNumber;
    else if (header.startsWith("estoque mínimo") || header.startsWith("estoque minimo")) columnIndex.minStock = colNumber;
    else if (header.startsWith("fornecedor")) columnIndex.supplier = colNumber;
  });

  const report: ImportReportDTO = { totalRows: 0, created: 0, updated: 0, failed: 0, errors: [] };

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);

    const name = columnIndex.name ? cellText(row.getCell(columnIndex.name).value) : "";
    const categoryName = columnIndex.category ? cellText(row.getCell(columnIndex.category).value) : "";
    const unitText = columnIndex.unit ? cellText(row.getCell(columnIndex.unit).value) : "";
    const priceRaw = columnIndex.price ? cellNumber(row.getCell(columnIndex.price).value) : null;
    const packageQuantityRaw = columnIndex.packageQuantity ? cellNumber(row.getCell(columnIndex.packageQuantity).value) : null;
    const packagePriceRaw = columnIndex.packagePrice ? cellNumber(row.getCell(columnIndex.packagePrice).value) : null;
    const stockRaw = columnIndex.stock ? cellNumber(row.getCell(columnIndex.stock).value) : null;
    const minStockRaw = columnIndex.minStock ? cellNumber(row.getCell(columnIndex.minStock).value) : null;
    const supplierText = columnIndex.supplier ? cellText(row.getCell(columnIndex.supplier).value) : "";

    // Linha inteiramente vazia (fim dos dados reais, ou espaço deixado no
    // template) — ignorada silenciosamente, nunca contada no relatório.
    if (
      !name && !categoryName && !unitText && priceRaw === null &&
      packageQuantityRaw === null && packagePriceRaw === null && stockRaw === null && !supplierText
    ) {
      continue;
    }

    report.totalRows += 1;
    const rowLabel = name || `(linha ${rowNumber})`;

    try {
      if (!name) throw new Error("Nome é obrigatório.");
      if (!unitText) throw new Error("Unidade é obrigatória.");

      const hasPackage = packageQuantityRaw !== null || packagePriceRaw !== null;
      if (hasPackage) {
        if (packageQuantityRaw === null || packagePriceRaw === null) {
          throw new Error("Informe quantidade e preço da embalagem juntos, ou nenhum dos dois.");
        }
        if (Number.isNaN(packageQuantityRaw) || packageQuantityRaw <= 0) {
          throw new Error("Quantidade por embalagem deve ser maior que zero.");
        }
        if (Number.isNaN(packagePriceRaw) || packagePriceRaw <= 0) {
          throw new Error("Preço da embalagem deve ser maior que zero.");
        }
      } else {
        if (priceRaw === null) throw new Error("Preço atual é obrigatório (ou preencha as colunas de embalagem).");
        if (Number.isNaN(priceRaw)) throw new Error("Preço atual não é um número válido.");
      }
      if (stockRaw !== null && Number.isNaN(stockRaw)) throw new Error("Estoque atual não é um número válido.");
      if (minStockRaw !== null && Number.isNaN(minStockRaw)) throw new Error("Estoque mínimo não é um número válido.");

      const unit = (await findUnitByAbbreviation(unitText)) ?? (await findUnitByName(unitText));
      if (!unit) throw new Error(`Unidade "${unitText}" não encontrada.`);

      let categoryId: string | null = null;
      if (categoryName) {
        const category = await findIngredientCategoryByName(categoryName);
        if (!category) throw new Error(`Categoria "${categoryName}" não encontrada.`);
        categoryId = category.id;
      }

      const input: IngredientInput = {
        name,
        categoryId,
        unitId: unit.id,
        // Recalculado de novo pelo Service a partir de packageQuantity/
        // packagePrice quando presentes (ver resolvePriceFromPackage em
        // ingredientService.ts) — calculado aqui também só para satisfazer a
        // validação de "currentPrice > 0" (validateIngredientCreate/Update
        // nunca sabem sobre o modo de embalagem).
        currentPrice: hasPackage ? (packagePriceRaw as number) / (packageQuantityRaw as number) : (priceRaw as number),
        packageQuantity: hasPackage ? packageQuantityRaw : null,
        packagePrice: hasPackage ? packagePriceRaw : null,
        stockQuantity: stockRaw ?? 0,
        minStock: minStockRaw ?? 0,
        supplier: supplierText || null,
      };

      const existing = await findIngredientByName(name);
      if (existing) {
        await updateIngredient(existing.id, input);
        report.updated += 1;
      } else {
        await createIngredient(input);
        report.created += 1;
      }
    } catch (err) {
      report.failed += 1;
      report.errors.push({ row: rowNumber, name: rowLabel, message: extractErrorMessage(err) });
    }
  }

  return report;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof IngredientValidationFailedError) {
    return err.errors.map((e) => e.message).join(" ");
  }
  if (
    err instanceof DuplicateIngredientNameError ||
    err instanceof InvalidUnitReferenceError ||
    err instanceof InvalidCategoryReferenceError
  ) {
    return err.message;
  }
  return err instanceof Error ? err.message : "Erro desconhecido ao processar a linha.";
}
