const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing demo data...');

  try {
    await prisma.invoiceItem.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    
    await prisma.stockMovement.deleteMany({});
    await prisma.warranty.deleteMany({});
    await prisma.product.deleteMany({});
    
    await prisma.repair.deleteMany({});
    await prisma.cheque.deleteMany({});
    await prisma.expense.deleteMany({});
    
    await prisma.customer.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.model.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.category.deleteMany({});
    
    console.log('Successfully cleared all demo data.');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
