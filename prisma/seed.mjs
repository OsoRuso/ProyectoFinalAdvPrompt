import prismaPackage from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
import { readFile } from "node:fs/promises";

const { PrismaClient, UserRole } = prismaPackage;

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${digest}`;
}

async function main() {
  const articles = JSON.parse(
    await readFile(new URL("./demo-knowledge.json", import.meta.url), "utf8"),
  );
  await prisma.knowledgeArticle.createMany({
    data: articles,
    skipDuplicates: true,
  });

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) {
    if (password.length < 12) {
      throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres.");
    }
    await prisma.user.upsert({
      where: { email },
      update: { role: UserRole.ADMIN, passwordHash: hashPassword(password) },
      create: {
        name: "Administración IP Conecta",
        email,
        role: UserRole.ADMIN,
        passwordHash: hashPassword(password),
      },
    });
  } else {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD no configurados; no se creó usuario administrador.");
  }
}

main()
  .catch((error) => {
    console.error("No se pudo completar el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
