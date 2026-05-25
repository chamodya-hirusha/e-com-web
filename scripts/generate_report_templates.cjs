const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../src/reports/templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

const templates = [
  {
    id: "daily-sales",
    title: "Daily Sales Report",
    description: "Summary of sales for a specific date range.",
    category: "Sales",
    icon: "BarChart3",
    filters: [
      { id: "dateRange", type: "date-range", label: "Date Range" }
    ],
    columns: [
      { id: "date", label: "Date", type: "date" },
      { id: "invoiceCount", label: "Invoices", type: "number" },
      { id: "totalSales", label: "Total Sales", type: "currency" }
    ],
    chart: { type: "bar", xAxis: "date", yAxis: ["totalSales"] },
    exportOptions: ["pdf", "excel", "csv"],
    apiEndpoint: "/api/reports/engine?report=daily-sales",
    permissions: ["admin", "manager"],
    defaultSort: { column: "date", direction: "desc" },
    summaryCards: [
      { id: "totalRevenue", label: "Total Revenue", type: "currency" },
      { id: "totalInvoices", label: "Total Invoices", type: "number" }
    ]
  },
  {
    id: "monthly-profit-loss",
    title: "Monthly Profit/Loss",
    description: "Detailed profit and loss statement.",
    category: "Finance",
    icon: "TrendingUp",
    filters: [
      { id: "dateRange", type: "date-range", label: "Date Range" }
    ],
    columns: [
      { id: "month", label: "Month", type: "string" },
      { id: "revenue", label: "Revenue", type: "currency" },
      { id: "expenses", label: "Expenses", type: "currency" },
      { id: "netProfit", label: "Net Profit", type: "currency" }
    ],
    chart: { type: "line", xAxis: "month", yAxis: ["revenue", "expenses", "netProfit"] },
    exportOptions: ["pdf", "excel", "csv"],
    apiEndpoint: "/api/reports/engine?report=monthly-profit-loss",
    permissions: ["admin", "manager"],
    defaultSort: { column: "month", direction: "desc" },
    summaryCards: [
      { id: "totalRevenue", label: "Total Revenue", type: "currency" },
      { id: "totalExpenses", label: "Total Expenses", type: "currency" },
      { id: "overallProfit", label: "Overall Profit", type: "currency" }
    ]
  },
  {
    id: "best-selling-products",
    title: "Best Selling Products",
    description: "Top products by sales volume.",
    category: "Inventory",
    icon: "PieChart",
    filters: [
      { id: "dateRange", type: "date-range", label: "Date Range" },
      { id: "limit", type: "select", label: "Show top", options: [{label: "10", value: "10"}, {label: "50", value: "50"}] }
    ],
    columns: [
      { id: "productName", label: "Product", type: "string" },
      { id: "quantitySold", label: "Quantity Sold", type: "number" },
      { id: "revenue", label: "Revenue", type: "currency" }
    ],
    chart: { type: "pie", xAxis: "productName", yAxis: ["quantitySold"] },
    exportOptions: ["pdf", "excel", "csv"],
    apiEndpoint: "/api/reports/engine?report=best-selling-products",
    permissions: ["admin", "manager", "staff"],
    defaultSort: { column: "quantitySold", direction: "desc" },
    summaryCards: [
      { id: "topProduct", label: "Top Product", type: "string" },
      { id: "totalUnitsSold", label: "Total Units Sold", type: "number" }
    ]
  },
  {
    id: "expense-summary",
    title: "Expense Summary",
    description: "Breakdown of expenses by category.",
    category: "Finance",
    icon: "FileText",
    filters: [
      { id: "dateRange", type: "date-range", label: "Date Range" }
    ],
    columns: [
      { id: "category", label: "Category", type: "string" },
      { id: "amount", label: "Amount", type: "currency" }
    ],
    chart: { type: "pie", xAxis: "category", yAxis: ["amount"] },
    exportOptions: ["pdf", "excel", "csv"],
    apiEndpoint: "/api/reports/engine?report=expense-summary",
    permissions: ["admin", "manager"],
    defaultSort: { column: "amount", direction: "desc" },
    summaryCards: [
      { id: "totalExpenses", label: "Total Expenses", type: "currency" }
    ]
  },
  {
    id: "repair-income",
    title: "Repair Income",
    description: "Income generated from repairs.",
    category: "Services",
    icon: "Wrench",
    filters: [
      { id: "dateRange", type: "date-range", label: "Date Range" }
    ],
    columns: [
      { id: "date", label: "Date", type: "date" },
      { id: "repairCount", label: "Repairs Completed", type: "number" },
      { id: "income", label: "Income", type: "currency" }
    ],
    chart: { type: "bar", xAxis: "date", yAxis: ["income"] },
    exportOptions: ["pdf", "excel", "csv"],
    apiEndpoint: "/api/reports/engine?report=repair-income",
    permissions: ["admin", "manager", "tech"],
    defaultSort: { column: "date", direction: "desc" },
    summaryCards: [
      { id: "totalIncome", label: "Total Repair Income", type: "currency" },
      { id: "totalRepairs", label: "Total Repairs", type: "number" }
    ]
  },
  {
    id: "inventory-valuation",
    title: "Inventory Valuation",
    description: "Total monetary value of current warehouse stock.",
    category: "Inventory",
    icon: "Boxes",
    filters: [],
    columns: [
      { id: "productName", label: "Product", type: "string" },
      { id: "quantity", label: "In Stock", type: "number" },
      { id: "costPrice", label: "Cost Price", type: "currency" },
      { id: "totalValue", label: "Total Value", type: "currency" }
    ],
    chart: null,
    exportOptions: ["pdf", "excel", "csv"],
    apiEndpoint: "/api/reports/engine?report=inventory-valuation",
    permissions: ["admin", "manager"],
    defaultSort: { column: "totalValue", direction: "desc" },
    summaryCards: [
      { id: "totalStockValue", label: "Total Stock Value (Cost)", type: "currency" },
      { id: "totalItems", label: "Total Items In Stock", type: "number" }
    ]
  },
  {
    id: "supplier-ledger",
    title: "Supplier Outstanding Ledger",
    description: "Summary of outstanding balances due to suppliers.",
    category: "Finance",
    icon: "CreditCard",
    filters: [],
    columns: [
      { id: "supplierName", label: "Supplier", type: "string" },
      { id: "totalPurchases", label: "Total Purchases", type: "currency" },
      { id: "amountPaid", label: "Amount Paid", type: "currency" },
      { id: "outstandingBalance", label: "Outstanding Balance", type: "currency" }
    ],
    chart: { type: "bar", xAxis: "supplierName", yAxis: ["outstandingBalance"] },
    exportOptions: ["pdf", "excel", "csv"],
    apiEndpoint: "/api/reports/engine?report=supplier-ledger",
    permissions: ["admin", "manager"],
    defaultSort: { column: "outstandingBalance", direction: "desc" },
    summaryCards: [
      { id: "totalOutstanding", label: "Total Outstanding", type: "currency" }
    ]
  },
  {
    id: "dead-stock",
    title: "Dead Stock & Slow-Moving Items",
    description: "Identify products with low or zero sales activity.",
    category: "Inventory",
    icon: "TrendingDown",
    filters: [
      { id: "monthsInactive", type: "select", label: "Months Inactive", options: [{label: "3 Months", value: "3"}, {label: "6 Months", value: "6"}] }
    ],
    columns: [
      { id: "productName", label: "Product", type: "string" },
      { id: "stockQuantity", label: "In Stock", type: "number" },
      { id: "lastSoldDate", label: "Last Sold Date", type: "date" },
      { id: "tiedCapital", label: "Tied Capital", type: "currency" }
    ],
    chart: null,
    exportOptions: ["pdf", "excel", "csv"],
    apiEndpoint: "/api/reports/engine?report=dead-stock",
    permissions: ["admin", "manager"],
    defaultSort: { column: "tiedCapital", direction: "desc" },
    summaryCards: [
      { id: "totalDeadStockValue", label: "Capital Tied in Dead Stock", type: "currency" },
      { id: "deadStockItems", label: "Dead Stock Items", type: "number" }
    ]
  },
  {
    id: "warranty-analytics",
    title: "Warranty Liability Analytics",
    description: "Track shop-guaranteed warranties versus claims.",
    category: "Analytics",
    icon: "ShieldCheck",
    filters: [
      { id: "status", type: "select", label: "Status", options: [{label: "Active", value: "active"}, {label: "Expired", value: "expired"}] }
    ],
    columns: [
      { id: "productName", label: "Product", type: "string" },
      { id: "activeWarranties", label: "Active Warranties", type: "number" },
      { id: "claimsMade", label: "Claims Made", type: "number" }
    ],
    chart: { type: "bar", xAxis: "productName", yAxis: ["activeWarranties", "claimsMade"] },
    exportOptions: ["pdf", "excel", "csv"],
    apiEndpoint: "/api/reports/engine?report=warranty-analytics",
    permissions: ["admin", "manager"],
    defaultSort: { column: "activeWarranties", direction: "desc" },
    summaryCards: [
      { id: "totalActiveWarranties", label: "Total Active Warranties", type: "number" },
      { id: "totalClaims", label: "Total Warranty Claims", type: "number" }
    ]
  }
];

templates.forEach(t => {
  fs.writeFileSync(path.join(templatesDir, `${t.id}.json`), JSON.stringify(t, null, 2));
});
console.log('Successfully generated JSON templates!');
