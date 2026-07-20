import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedProductionChain } from "./seeds/production-chain";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Categorias de produtos
  const catBolos = await prisma.productCategory.upsert({
    where: { slug: "bolos" },
    update: {},
    create: { name: "Bolos de Aniversário", slug: "bolos", sortOrder: 1 },
  });

  const catDoces = await prisma.productCategory.upsert({
    where: { slug: "doces" },
    update: {},
    create: { name: "Doces & Docinhos", slug: "doces", sortOrder: 2 },
  });

  const catKits = await prisma.productCategory.upsert({
    where: { slug: "kits" },
    update: {},
    create: { name: "Kits & Coffee Break", slug: "kits", sortOrder: 3 },
  });

  // ─── Ocasiões
  const occasions = await Promise.all([
    prisma.occasionTag.upsert({ where: { slug: "aniversario" }, update: {}, create: { name: "Aniversário", slug: "aniversario" } }),
    prisma.occasionTag.upsert({ where: { slug: "docinhos" }, update: {}, create: { name: "Docinhos", slug: "docinhos" } }),
    prisma.occasionTag.upsert({ where: { slug: "cafe" }, update: {}, create: { name: "Café", slug: "cafe" } }),
    prisma.occasionTag.upsert({ where: { slug: "casamento" }, update: {}, create: { name: "Casamento", slug: "casamento" } }),
    prisma.occasionTag.upsert({ where: { slug: "corporativo" }, update: {}, create: { name: "Corporativo", slug: "corporativo" } }),
    prisma.occasionTag.upsert({ where: { slug: "mesversario" }, update: {}, create: { name: "Mesversário", slug: "mesversario" } }),
  ]);

  const occ = Object.fromEntries(occasions.map((o) => [o.slug, o.id]));

  // ─── Produtos
  const productsData = [
    { name: "Bolo Red Velvet", description: "Massa aveludada com cream cheese", cat: catBolos.id, price: 180, lead: 3, featured: true, occs: ["aniversario", "casamento"] },
    { name: "Brigadeiro Gourmet", description: "Chocolate belga 50%", cat: catDoces.id, price: 3.5, lead: 1, featured: true, occs: ["docinhos", "aniversario", "corporativo", "cafe"] },
    { name: "Bolo Chocolate 25cm", description: "Recheio ganache meio amargo", cat: catBolos.id, price: 145, lead: 3, occs: ["aniversario", "mesversario"] },
    { name: "Naked Cake Frutas", description: "Frutas vermelhas frescas", cat: catBolos.id, price: 195, lead: 4, occs: ["casamento", "aniversario"] },
    { name: "Mini Naked Cake", description: "Individual, perfeito para mesversário", cat: catBolos.id, price: 45, lead: 2, occs: ["mesversario", "aniversario"] },
    { name: "Kit Coffee Break (20 pessoas)", description: "Doces, salgados doces e bebidas", cat: catKits.id, price: 380, lead: 2, occs: ["cafe", "corporativo"] },
    { name: "Caixa Casamento (100 doces)", description: "Mix tradicional premium", cat: catDoces.id, price: 320, lead: 5, occs: ["casamento"] },
    { name: "Bolo Corporativo Logo", description: "Personalização com logo da empresa", cat: catBolos.id, price: 220, lead: 4, occs: ["corporativo"] },
  ];

  for (const p of productsData) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          categoryId: p.cat,
          basePrice: p.price,
          leadTimeDays: p.lead,
          featured: p.featured ?? false,
          active: true,
          occasions: {
            create: p.occs.map((slug) => ({ occasionId: occ[slug] })),
          },
        },
      });
    }
  }

  console.log("✅ Produtos criados");

  // ─── Usuário ADMIN
  const password = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@doceatelier.com.br" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@doceatelier.com.br",
      passwordHash: password,
      role: "ADMIN",
      active: true,
    },
  });

  console.log("✅ Usuário admin criado — email: admin@doceatelier.com.br / senha: admin123");

  // ─── Configuração da loja
  const configCount = await prisma.storeConfig.count();
  if (configCount === 0) {
    await prisma.storeConfig.create({
      data: {
        name: "Doce Atelier",
        addressCity: "São Paulo",
        addressState: "SP",
        freeDeliveryRadiusKm: 3,
        laborCostPerHour: 35,
        monthlyProductionUnits: 200,
        targetMarginPercent: 50,
      },
    });
    console.log("✅ StoreConfig criada");
  }

  // ─── Cadeia produtiva: Unidades → Ingredientes → Receita (Sprint I.2 — Frente B)
  await seedProductionChain(prisma);

  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
