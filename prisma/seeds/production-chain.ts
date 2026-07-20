import { PrismaClient } from "@prisma/client";

/**
 * Dataset mínimo de homologação da cadeia produtiva (Unidades → Ingredientes → Receita → Produto).
 * Sprint I.2 — Frente B. Objetivo: validar a infraestrutura (schema × banco × módulos
 * já implementados), não popular o ERP com dados de demonstração — ver DEMO_DATASET.md
 * para o dataset de demonstração propriamente dito.
 *
 * Idempotente: upsert por chave única onde existe; findFirst+create onde o modelo não
 * declara @unique em nenhum campo de negócio (Ingredient.name, Recipe.name), mesmo padrão
 * já usado para Product em prisma/seed.ts.
 */
export async function seedProductionChain(prisma: PrismaClient) {
  console.log("🌱 Iniciando seed da cadeia produtiva (Unidades → Ingredientes → Receita)...");

  // ─── Unidades de medida
  const unitsData = [
    { name: "Unidade", abbreviation: "un", type: "UNIT" as const, sortOrder: 1 },
    { name: "Quilograma", abbreviation: "kg", type: "MASS" as const, sortOrder: 2 },
    { name: "Grama", abbreviation: "g", type: "MASS" as const, sortOrder: 3 },
    { name: "Litro", abbreviation: "l", type: "VOLUME" as const, sortOrder: 4 },
    { name: "Mililitro", abbreviation: "ml", type: "VOLUME" as const, sortOrder: 5 },
  ];

  const units = Object.fromEntries(
    await Promise.all(
      unitsData.map(async (u) => {
        const unit = await prisma.unitOfMeasure.upsert({
          where: { name: u.name },
          update: {},
          create: u,
        });
        return [u.abbreviation, unit] as const;
      }),
    ),
  );

  console.log(`✅ Unidades de medida (${Object.keys(units).length}/5)`);

  // ─── Conversões de unidade (necessárias: receita usa "g"/"ml", insumo é estocado em "kg"/"l")
  const conversionsData = [
    { fromAbbr: "kg", toAbbr: "g", factor: 1000, description: "1 kg = 1000 g" },
    { fromAbbr: "l", toAbbr: "ml", factor: 1000, description: "1 l = 1000 ml" },
  ];

  for (const c of conversionsData) {
    await prisma.unitConversion.upsert({
      where: {
        fromUnitId_toUnitId: { fromUnitId: units[c.fromAbbr].id, toUnitId: units[c.toAbbr].id },
      },
      update: {},
      create: {
        fromUnitId: units[c.fromAbbr].id,
        toUnitId: units[c.toAbbr].id,
        factor: c.factor,
        description: c.description,
      },
    });
  }

  console.log(`✅ Conversões de unidade (${conversionsData.length}/2)`);

  // ─── Categorias de ingredientes
  const catFarinhas = await prisma.ingredientCategory.upsert({
    where: { name: "Farinhas e Açúcares" },
    update: {},
    create: { name: "Farinhas e Açúcares" },
  });

  const catLaticinios = await prisma.ingredientCategory.upsert({
    where: { name: "Laticínios e Ovos" },
    update: {},
    create: { name: "Laticínios e Ovos" },
  });

  console.log("✅ Categorias de ingredientes (2/2)");

  // ─── Ingredientes
  const ingredientsData = [
    { name: "Farinha de Trigo", categoryId: catFarinhas.id, unitAbbr: "kg", currentPrice: 6.5 },
    { name: "Açúcar Refinado", categoryId: catFarinhas.id, unitAbbr: "kg", currentPrice: 5.2 },
    { name: "Chocolate em Pó 50%", categoryId: catFarinhas.id, unitAbbr: "kg", currentPrice: 32 },
    { name: "Manteiga sem Sal", categoryId: catLaticinios.id, unitAbbr: "kg", currentPrice: 38 },
    { name: "Ovos", categoryId: catLaticinios.id, unitAbbr: "un", currentPrice: 0.8 },
  ];

  const ingredients: Record<string, { id: string }> = {};
  for (const i of ingredientsData) {
    let ingredient = await prisma.ingredient.findFirst({ where: { name: i.name } });
    if (!ingredient) {
      ingredient = await prisma.ingredient.create({
        data: {
          name: i.name,
          categoryId: i.categoryId,
          unitId: units[i.unitAbbr].id,
          currentPrice: i.currentPrice,
          active: true,
        },
      });
    }
    ingredients[i.name] = ingredient;
  }

  console.log(`✅ Ingredientes (${ingredientsData.length}/5)`);

  // ─── Receita simples
  let recipe = await prisma.recipe.findFirst({ where: { name: "Massa de Chocolate Básica" } });
  if (!recipe) {
    recipe = await prisma.recipe.create({
      data: {
        name: "Massa de Chocolate Básica",
        description: "Massa base para bolo de chocolate 25cm — dataset de homologação",
        yieldQuantity: 1,
        yieldUnit: "bolo 25cm",
        prepTimeMinutes: 40,
        active: true,
      },
    });
  }

  const recipeItemsData = [
    { ingredient: "Farinha de Trigo", quantity: 500, unitAbbr: "g" },
    { ingredient: "Açúcar Refinado", quantity: 400, unitAbbr: "g" },
    { ingredient: "Chocolate em Pó 50%", quantity: 100, unitAbbr: "g" },
    { ingredient: "Manteiga sem Sal", quantity: 200, unitAbbr: "g" },
    { ingredient: "Ovos", quantity: 3, unitAbbr: "un" },
  ];

  for (const item of recipeItemsData) {
    await prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: { recipeId: recipe.id, ingredientId: ingredients[item.ingredient].id },
      },
      update: {},
      create: {
        recipeId: recipe.id,
        ingredientId: ingredients[item.ingredient].id,
        quantity: item.quantity,
        unitId: units[item.unitAbbr].id,
      },
    });
  }

  console.log(`✅ Receita "${recipe.name}" com ${recipeItemsData.length} ingredientes`);

  // ─── Vínculo com Produto existente (valida RecipeLinker / cálculo de costPrice — Módulo 2.J)
  const product = await prisma.product.findFirst({ where: { name: "Bolo Chocolate 25cm" } });
  if (product) {
    await prisma.productRecipe.upsert({
      where: { productId_recipeId: { productId: product.id, recipeId: recipe.id } },
      update: {},
      create: { productId: product.id, recipeId: recipe.id, quantity: 1 },
    });
    console.log(`✅ Receita vinculada ao produto "${product.name}" (ProductRecipe)`);
  } else {
    console.log('⚠️  Produto "Bolo Chocolate 25cm" não encontrado — vínculo ProductRecipe não criado');
  }

  console.log("🎉 Seed da cadeia produtiva concluído!");
}
