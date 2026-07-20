import { NextResponse } from "next/server";
import type { ValidationError } from "@/lib/types";

export function ok<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function badRequest(errors: ValidationError[]): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: "VALIDATION_ERROR", message: "Dados inválidos.", details: errors } },
    { status: 400 },
  );
}

export function invalidBody(): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: "INVALID_BODY", message: "Corpo da requisição inválido." } },
    { status: 400 },
  );
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: "UNAUTHORIZED", message: "Não autenticado." } },
    { status: 401 },
  );
}

export function forbidden(): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: "FORBIDDEN", message: "Acesso negado." } },
    { status: 403 },
  );
}

export function notFound(message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: "NOT_FOUND", message } },
    { status: 404 },
  );
}

export function conflict(code: string, message: string, details?: unknown): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details !== undefined && { details }) } },
    { status: 409 },
  );
}

export function internalError(): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor." } },
    { status: 500 },
  );
}
