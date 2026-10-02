import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");

  const hashed = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email: email.toLowerCase() },
    update: { password: hashed },
    create: { name: "Admin", email: email.toLowerCase(), password: hashed },
  });

  console.log(`Admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
