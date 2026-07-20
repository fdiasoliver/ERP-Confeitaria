export interface ViaCepResult {
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  ibgeCode: string | null;
}

export class CepNotFoundError extends Error {
  constructor() {
    super("CEP não encontrado.");
  }
}

interface RawViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  erro?: boolean;
}

export async function lookupCEP(cep: string): Promise<ViaCepResult> {
  const digits = cep.replace(/\D/g, "");
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  const data: RawViaCepResponse = await res.json();

  if (data.erro) throw new CepNotFoundError();

  return {
    street: data.logradouro ?? null,
    neighborhood: data.bairro ?? null,
    city: data.localidade ?? null,
    state: data.uf ?? null,
    ibgeCode: data.ibge ?? null,
  };
}
