export type AssetType =
  | "logo"
  | "favicon"
  | "product"
  | "category"
  | "banner"
  | "client"
  | "supplier";

export interface UploadResult {
  url: string;
}

export async function uploadAsset(file: File, type: AssetType): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);

  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data: { url?: string; error?: string } = await res.json();

  if (!res.ok) throw new Error(data.error ?? "Falha no upload.");
  return { url: data.url! };
}
