export interface NfceImportPreviewItem {
  description: string;
  code: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  suggestedIngredientId: string | null;
}

export interface NfceImportPreview {
  accessKey: string;
  issuerName: string;
  emittedAt: string | null;
  items: NfceImportPreviewItem[];
  alreadyImportedIngredientIds: string[];
}

export interface NfceImportMapping {
  ingredientId: string;
  price: number;
}

export interface NfceImportResultItem {
  ingredientId: string;
  success: boolean;
  error?: string;
}

export class ApiRequestError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

interface ApiSuccess<T> { success: true; data: T }
interface ApiError { success: false; error: { code: string; message: string; details?: unknown } }
type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new ApiRequestError(json.error.code, json.error.message, json.error.details);
  return json.data;
}

export async function previewNfce(qrCodeContent: string): Promise<NfceImportPreview> {
  return request<NfceImportPreview>("/api/admin/nfce/preview", {
    method: "POST",
    body: JSON.stringify({ qrCodeContent }),
  });
}

export async function importNfce(accessKey: string, mappings: NfceImportMapping[]): Promise<NfceImportResultItem[]> {
  return request<NfceImportResultItem[]>("/api/admin/nfce/import", {
    method: "POST",
    body: JSON.stringify({ accessKey, mappings }),
  });
}
