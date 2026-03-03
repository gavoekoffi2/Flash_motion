import { prisma } from "./config/prisma";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const hashed = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@flashmotion.dev" },
    update: {},
    create: {
      email: "demo@flashmotion.dev",
      password: hashed,
      name: "Demo User",
      role: "USER",
      plan: "PRO",
      quota: {
        create: {
          llmCallsLimit: 50,
          rendersLimit: 10,
          storageLimitMb: 1000,
        },
      },
    },
  });

  console.log(`Created demo user: ${user.email} (password: password123)`);

  // Create a sample project
  const project = await prisma.project.upsert({
    where: { id: "demo-project-001" },
    update: {},
    create: {
      id: "demo-project-001",
      userId: user.id,
      title: "Promo Produit X",
      script: `Découvrez le Produit X — révolutionnez votre quotidien.
Un design élégant. Des performances incroyables.
Disponible maintenant à -30%. Commandez sur notre site.`,
      aspectRatio: "9:16",
      status: "DRAFT",
      brandConfig: {
        primary_color: "#FF6B35",
        logo_id: null,
      },
    },
  });

  console.log(`Created demo project: ${project.title}`);
  console.log("Seed complete.");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
