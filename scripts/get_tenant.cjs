const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.tenant.findFirst();
  console.log("TENANT_ID:", t?.id);
  process.exit(0);
}
main();
