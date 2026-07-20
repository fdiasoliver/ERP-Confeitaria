import { ok, internalError } from "@/lib/http/responses";
import { listActiveCategories } from "@/lib/productCategoryService";

export async function GET() {
  try {
    const categories = await listActiveCategories();
    return ok(categories);
  } catch {
    return internalError();
  }
}
