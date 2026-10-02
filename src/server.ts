import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function main() {
  await prisma.$connect();
  app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
