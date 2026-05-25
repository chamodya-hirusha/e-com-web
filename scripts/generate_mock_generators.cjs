const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/reports/generators');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const generators = [
  'dailySales', 'monthlyProfitLoss', 'bestSellingProducts', 'expenseSummary',
  'repairIncome', 'inventoryValuation', 'supplierLedger', 'deadStock', 'warrantyAnalytics'
];

generators.forEach(name => {
  const content = `import { ReportDataResponse } from '../types';
import prisma from '@/lib/prisma';

export async function generate${name.charAt(0).toUpperCase() + name.slice(1)}(
  tenantId: string,
  filters: Record<string, any>
): Promise<ReportDataResponse> {
  // TODO: Implement actual Prisma logic here.
  // This is a mocked response to satisfy the report engine API.
  return {
    data: [],
    summary: {},
    chartData: [],
    total: 0
  };
}
`;
  fs.writeFileSync(path.join(dir, `${name}.ts`), content);
});

console.log('Mock generators created successfully.');
