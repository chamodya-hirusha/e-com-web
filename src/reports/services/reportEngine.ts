import { generateDailySales } from '../generators/dailySales';
import { generateMonthlyProfitLoss } from '../generators/monthlyProfitLoss';
import { generateBestSellingProducts } from '../generators/bestSellingProducts';
import { generateExpenseSummary } from '../generators/expenseSummary';
import { generateRepairIncome } from '../generators/repairIncome';
import { generateInventoryValuation } from '../generators/inventoryValuation';
import { generateSupplierLedger } from '../generators/supplierLedger';
import { generateDeadStock } from '../generators/deadStock';
import { generateWarrantyAnalytics } from '../generators/warrantyAnalytics';
import { ReportDataResponse } from '../types';

export async function executeReport(
  reportId: string,
  tenantId: string,
  filters: Record<string, any>
): Promise<ReportDataResponse> {
  switch (reportId) {
    case 'daily-sales':
      return generateDailySales(tenantId, filters);
    case 'monthly-profit-loss':
      return generateMonthlyProfitLoss(tenantId, filters);
    case 'best-selling-products':
      return generateBestSellingProducts(tenantId, filters);
    case 'expense-summary':
      return generateExpenseSummary(tenantId, filters);
    case 'repair-income':
      return generateRepairIncome(tenantId, filters);
    case 'inventory-valuation':
      return generateInventoryValuation(tenantId, filters);
    case 'supplier-ledger':
      return generateSupplierLedger(tenantId, filters);
    case 'dead-stock':
      return generateDeadStock(tenantId, filters);
    case 'warranty-analytics':
      return generateWarrantyAnalytics(tenantId, filters);
    default:
      throw new Error(`Report engine for '${reportId}' not found or implemented.`);
  }
}
