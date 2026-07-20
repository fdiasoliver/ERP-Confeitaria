import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { AssetType } from "@/lib/storage/StorageService";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "image/x-icon"];
const ALLOWED_ASSET_TYPES: AssetType[] = ["logo", "favicon", "product", "category", "banner", "client", "supplier"];
const MAX_SIZE_LOGO = 2 * 1024 * 1024;    // 2 MB — também o limite padrão para os demais tipos
const MAX_SIZE_FAVICON = 512 * 1024;       // 512 KB
const BUCKET = "store-assets";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== "admin") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Armazenamento não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Falha ao ler os dados do arquivo." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!type || !ALLOWED_ASSET_TYPES.includes(type as AssetType)) {
    return NextResponse.json(
      { error: `Tipo inválido. Use um de: ${ALLOWED_ASSET_TYPES.join(", ")}.` },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato não suportado. Use JPEG, PNG, SVG, WebP ou ICO." },
      { status: 400 },
    );
  }

  const maxSize = type === "favicon" ? MAX_SIZE_FAVICON : MAX_SIZE_LOGO;
  if (file.size > maxSize) {
    const limit = type === "favicon" ? "512 KB" : "2 MB";
    return NextResponse.json({ error: `Arquivo muito grande. Limite: ${limit}.` }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${type}/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: arrayBuffer,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[upload] Supabase error:", res.status, detail);
    return NextResponse.json({ error: "Falha ao enviar arquivo para o armazenamento." }, { status: 502 });
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
  return NextResponse.json({ url: publicUrl });
}
