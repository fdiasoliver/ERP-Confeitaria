import { NextResponse } from "next/server";
import {
  getStoreConfig,
  upsertStoreConfig,
  AuthError,
  ValidationFailedError,
} from "@/lib/storeConfigService";
import type { StoreConfigInput } from "@/lib/types";

export async function GET() {
  try {
    const config = await getStoreConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar configuração." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  try {
    const config = await upsertStoreConfig(body as StoreConfigInput);
    return NextResponse.json(config);
  } catch (err) {
    if (err instanceof ValidationFailedError) {
      return NextResponse.json({ errors: err.errors }, { status: 400 });
    }
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Erro ao salvar configuração." }, { status: 500 });
  }
}
