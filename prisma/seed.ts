import { PrismaClient } from "../lib/generated/prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("password", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      name: "Admin",
      password,
      role: "user",
    },
  });

  await prisma.leadStatus.upsert({
    where: { name: "Prospect" },
    update: {},
    create: {
      name: "Prospect",
    },
  });
  await prisma.leadStatus.upsert({
    where: { name: "Contacted" },
    update: {},
    create: {
      name: "Contacted",
    },
  });
  await prisma.leadStatus.upsert({
    where: { name: "Closed" },
    update: {},
    create: {
      name: "Closed",
    },
  });
  console.log({ user });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
