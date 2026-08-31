const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning existing data...');
  
  // Clean tables in reverse order of relationships to prevent FK constraint issues
  await prisma.stockIntakeItem.deleteMany({});
  await prisma.stockIntake.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.warranty.deleteMany({});
  await prisma.repair.deleteMany({});
  await prisma.cheque.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.supplierBill.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.product.deleteMany({});
  
  // Clean base entities
  await prisma.model.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('Seeding baseline roles and repair statuses...');

  // Default Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: { name: 'Super Admin' },
  });

  // Default Repair Statuses
  const statuses = ['Pending', 'Diagnosing', 'Repairing', 'Completed', 'Delivered'];
  const repairStatuses = {};
  for (const status of statuses) {
    repairStatuses[status] = await prisma.repairStatus.upsert({
      where: { name: status },
      update: {},
      create: { name: status },
    });
  }

  console.log('Seeding demo tenant, branch, and user...');

  // Create/Upsert Demo Tenant with correct hardcoded ID
  const tenantId = 'cmpc620w20007ezgn2axsmt9p';
  const demoTenant = await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      name: 'Demo Business',
      slug: 'demo',
    },
  });

  // Create a Demo Branch
  const mainBranch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      tenantId: tenantId,
    },
  });

  // Create Demo User
  await prisma.user.create({
    data: {
      id: 'mock-user-id',
      email: 'admin@demobusiness.com',
      password: '$2b$10$T872Vd7N5lJ5t36a992zUOB.m4tXn25.a4cE9y63yK56eOef80JmS', // password: admin123
      name: 'Demo Admin',
      roleId: adminRole.id,
      tenantId: tenantId,
    }
  });

  console.log('Seeding categories, brands, and models...');

  // 1. Categories
  const categoriesData = [
    { name: 'Smartphones' },
    { name: 'Laptops' },
    { name: 'Tablets' },
    { name: 'Smartwatches' },
    { name: 'Accessories' }
  ];
  const categories = {};
  for (const cat of categoriesData) {
    categories[cat.name] = await prisma.category.create({ data: cat });
  }

  // 2. Brands
  const brandsData = [
    { name: 'Apple' },
    { name: 'Samsung' },
    { name: 'Dell' },
    { name: 'HP' },
    { name: 'Xiaomi' }
  ];
  const brands = {};
  for (const b of brandsData) {
    brands[b.name] = await prisma.brand.create({ data: b });
  }

  // 3. Models
  const modelsData = [
    { name: 'iPhone 15 Pro' },
    { name: 'Galaxy S24 Ultra' },
    { name: 'XPS 13' },
    { name: 'Spectre x360' },
    { name: 'Redmi Note 13' },
    { name: 'iPad Air' },
    { name: 'Apple Watch Series 9' },
    { name: 'Galaxy Watch 6' },
    { name: 'USB-C Charger 30W' },
    { name: 'Wireless Earbuds' }
  ];
  const models = {};
  for (const m of modelsData) {
    models[m.name] = await prisma.model.create({ data: m });
  }

  console.log('Seeding suppliers and customers...');

  // 4. Suppliers
  const suppliersData = [
    {
      name: 'Apex Tech Distribution',
      company: 'Apex Tech Inc',
      phone: '0771234567',
      email: 'sales@apextech.com',
      taxId: 'TX-98765',
      paymentTerms: 'Net 30',
      tenantId: tenantId
    },
    {
      name: 'Vertex Electronics',
      company: 'Vertex Ltd',
      phone: '0719876543',
      email: 'info@vertex.com',
      taxId: 'TX-12345',
      paymentTerms: 'Net 15',
      tenantId: tenantId
    }
  ];
  const suppliers = {};
  for (const sup of suppliersData) {
    suppliers[sup.name] = await prisma.supplier.create({ data: sup });
  }

  // 5. Customers
  const customersData = [
    {
      name: 'Hirusha Chamodya',
      phone: '0761234567',
      email: 'hirusha@example.com',
      address: 'Colombo, Sri Lanka',
      tenantId: tenantId
    },
    {
      name: 'John Doe',
      phone: '0777654321',
      email: 'john.doe@example.com',
      address: 'Kandy, Sri Lanka',
      tenantId: tenantId
    },
    {
      name: 'Jane Smith',
      phone: '0711122334',
      email: 'jane.smith@example.com',
      address: 'Galle, Sri Lanka',
      tenantId: tenantId
    },
    {
      name: 'Aruni Perera',
      phone: '0722233445',
      email: 'aruni@example.com',
      address: 'Negombo, Sri Lanka',
      tenantId: tenantId
    }
  ];
  const customers = {};
  for (const cust of customersData) {
    customers[cust.name] = await prisma.customer.create({ data: cust });
  }

  console.log('Seeding products...');

  // 6. Products
  const productsData = [
    {
      name: 'iPhone 15 Pro',
      sku: 'SKU-IPH15P',
      serial: 'SN-IPH15P-001',
      barcode: '190199223344',
      costPrice: 1000,
      sellPrice: 1200,
      quantity: 15,
      warrantyPeriod: 12,
      categoryId: categories['Smartphones'].id,
      brandId: brands['Apple'].id,
      modelId: models['iPhone 15 Pro'].id,
      supplierId: suppliers['Apex Tech Distribution'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    },
    {
      name: 'Galaxy S24 Ultra',
      sku: 'SKU-S24U',
      serial: 'SN-S24U-001',
      barcode: '880609001122',
      costPrice: 950,
      sellPrice: 1150,
      quantity: 10,
      warrantyPeriod: 12,
      categoryId: categories['Smartphones'].id,
      brandId: brands['Samsung'].id,
      modelId: models['Galaxy S24 Ultra'].id,
      supplierId: suppliers['Apex Tech Distribution'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    },
    {
      name: 'XPS 13',
      sku: 'SKU-XPS13',
      serial: 'SN-XPS13-001',
      barcode: '539718400223',
      costPrice: 1200,
      sellPrice: 1450,
      quantity: 8,
      warrantyPeriod: 24,
      categoryId: categories['Laptops'].id,
      brandId: brands['Dell'].id,
      modelId: models['XPS 13'].id,
      supplierId: suppliers['Vertex Electronics'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    },
    {
      name: 'Spectre x360',
      sku: 'SKU-SPEC360',
      serial: 'SN-SPEC360-001',
      barcode: '197029003344',
      costPrice: 1100,
      sellPrice: 1350,
      quantity: 5,
      warrantyPeriod: 24,
      categoryId: categories['Laptops'].id,
      brandId: brands['HP'].id,
      modelId: models['Spectre x360'].id,
      supplierId: suppliers['Vertex Electronics'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    },
    {
      name: 'Redmi Note 13',
      sku: 'SKU-RED13',
      serial: 'SN-RED13-001',
      barcode: '694181200445',
      costPrice: 200,
      sellPrice: 250,
      quantity: 25,
      warrantyPeriod: 6,
      categoryId: categories['Smartphones'].id,
      brandId: brands['Xiaomi'].id,
      modelId: models['Redmi Note 13'].id,
      supplierId: suppliers['Vertex Electronics'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    },
    {
      name: 'iPad Air',
      sku: 'SKU-IPADAIR',
      serial: 'SN-IPADAIR-001',
      barcode: '190199556677',
      costPrice: 500,
      sellPrice: 600,
      quantity: 12,
      warrantyPeriod: 12,
      categoryId: categories['Tablets'].id,
      brandId: brands['Apple'].id,
      modelId: models['iPad Air'].id,
      supplierId: suppliers['Apex Tech Distribution'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    },
    {
      name: 'Apple Watch Series 9',
      sku: 'SKU-AWS9',
      serial: 'SN-AWS9-001',
      barcode: '195949007788',
      costPrice: 350,
      sellPrice: 420,
      quantity: 20,
      warrantyPeriod: 12,
      categoryId: categories['Smartwatches'].id,
      brandId: brands['Apple'].id,
      modelId: models['Apple Watch Series 9'].id,
      supplierId: suppliers['Apex Tech Distribution'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    },
    {
      name: 'Galaxy Watch 6',
      sku: 'SKU-GW6',
      serial: 'SN-GW6-001',
      barcode: '880609558899',
      costPrice: 250,
      sellPrice: 300,
      quantity: 15,
      warrantyPeriod: 12,
      categoryId: categories['Smartwatches'].id,
      brandId: brands['Samsung'].id,
      modelId: models['Galaxy Watch 6'].id,
      supplierId: suppliers['Apex Tech Distribution'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    },
    {
      name: 'USB-C Charger 30W',
      sku: 'SKU-USBC30W',
      serial: 'SN-USBC30W-001',
      barcode: '190199334455',
      costPrice: 15,
      sellPrice: 25,
      quantity: 100,
      warrantyPeriod: 6,
      categoryId: categories['Accessories'].id,
      brandId: brands['Apple'].id,
      modelId: models['USB-C Charger 30W'].id,
      supplierId: suppliers['Vertex Electronics'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    },
    {
      name: 'Wireless Earbuds',
      sku: 'SKU-WEARBUD',
      serial: 'SN-WEARBUD-001',
      barcode: '694181223344',
      costPrice: 40,
      sellPrice: 65,
      quantity: 40,
      warrantyPeriod: 6,
      categoryId: categories['Accessories'].id,
      brandId: brands['Xiaomi'].id,
      modelId: models['Wireless Earbuds'].id,
      supplierId: suppliers['Vertex Electronics'].id,
      tenantId: tenantId,
      branchId: mainBranch.id
    }
  ];
  const products = {};
  for (const prod of productsData) {
    products[prod.name] = await prisma.product.create({ data: prod });
  }

  console.log('Seeding invoices, payments, warranties, and stock movements...');

  // 7. Invoices, InvoiceItems, Payments & Warranties
  const invoiceData = [
    {
      number: 'INV-2026-001',
      customerName: 'Hirusha Chamodya',
      items: [
        { product: 'iPhone 15 Pro', quantity: 1, price: 1200 },
        { product: 'USB-C Charger 30W', quantity: 1, price: 25 }
      ],
      paymentType: 'CASH',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    },
    {
      number: 'INV-2026-002',
      customerName: 'John Doe',
      items: [
        { product: 'Spectre x360', quantity: 1, price: 1350 }
      ],
      paymentType: 'CHEQUE',
      chequeNumber: '123456',
      bankName: 'Bank of Ceylon',
      chequeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    },
    {
      number: 'INV-2026-003',
      customerName: 'Jane Smith',
      items: [
        { product: 'iPad Air', quantity: 1, price: 600 }
      ],
      paymentType: 'CASH',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      number: 'INV-2026-004',
      customerName: 'Aruni Perera',
      items: [
        { product: 'Galaxy Watch 6', quantity: 1, price: 300 },
        { product: 'Wireless Earbuds', quantity: 1, price: 65 }
      ],
      paymentType: 'CASH',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      number: 'INV-2026-005',
      customerName: 'Hirusha Chamodya',
      items: [
        { product: 'Redmi Note 13', quantity: 1, price: 250 }
      ],
      paymentType: 'CASH',
      date: new Date() // Today
    }
  ];

  for (const inv of invoiceData) {
    const cust = customers[inv.customerName];
    const total = inv.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const invoice = await prisma.invoice.create({
      data: {
        number: inv.number,
        customerId: cust.id,
        tenantId: tenantId,
        branchId: mainBranch.id,
        total: total,
        date: inv.date
      }
    });

    for (const item of inv.items) {
      const prod = products[item.product];
      await prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          productId: prod.id,
          quantity: item.quantity,
          price: item.price
        }
      });

      // Create Stock Movement for invoice items (outflow)
      await prisma.stockMovement.create({
        data: {
          productId: prod.id,
          quantity: item.quantity,
          type: 'OUT',
          reason: `Sold in Invoice ${inv.number}`
        }
      });

      // Create Warranty if product has warranty period
      if (prod.warrantyPeriod) {
        const expiryDate = new Date(inv.date);
        expiryDate.setMonth(expiryDate.getMonth() + prod.warrantyPeriod);
        await prisma.warranty.create({
          data: {
            productId: prod.id,
            customerId: cust.id,
            purchaseDate: inv.date,
            expiryDate: expiryDate,
            tenantId: tenantId
          }
        });
      }
    }

    // Create Payment
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: total,
        type: inv.paymentType,
        date: inv.date,
        chequeNumber: inv.chequeNumber,
        bankName: inv.bankName,
        chequeDate: inv.chequeDate,
        status: inv.paymentType === 'CHEQUE' ? 'PENDING' : 'CLEARED'
      }
    });
  }

  console.log('Seeding repairs...');

  // 8. Repairs
  const repairsData = [
    {
      customerName: 'John Doe',
      deviceName: 'Dell XPS 13',
      problem: 'Screen flickering issue',
      statusName: 'Repairing',
      cost: 120,
      techNotes: 'Needs replacement display panel. Panel ordered from Vertex Electronics.',
      receivedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      customerName: 'Jane Smith',
      deviceName: 'iPhone 15 Pro',
      problem: 'Battery degrading quickly',
      statusName: 'Completed',
      cost: 80,
      techNotes: 'Battery health was at 76%. Replaced with original OEM Apple battery.',
      receivedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      customerName: 'Aruni Perera',
      deviceName: 'Galaxy Watch 6',
      problem: 'Stuck on boot loop logo screen',
      statusName: 'Pending',
      cost: 0,
      techNotes: 'Will attempt factory reset and firmware re-flash.',
      receivedDate: new Date()
    }
  ];

  for (const rep of repairsData) {
    const cust = customers[rep.customerName];
    const status = repairStatuses[rep.statusName];

    await prisma.repair.create({
      data: {
        customerId: cust.id,
        deviceName: rep.deviceName,
        problem: rep.problem,
        statusId: status.id,
        cost: rep.cost,
        techNotes: rep.techNotes,
        tenantId: tenantId,
        branchId: mainBranch.id,
        receivedDate: rep.receivedDate,
        deliveryDate: rep.deliveryDate
      }
    });
  }

  console.log('Seeding expenses...');

  // 9. Expenses
  const expensesData = [
    {
      title: 'Office Space Rental (September)',
      category: 'Rent',
      amount: 500,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      tenantId: tenantId
    },
    {
      title: 'Electricity & Water Bill (August)',
      category: 'Utilities',
      amount: 150,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tenantId: tenantId
    },
    {
      title: 'Social Media Ads Campaign',
      category: 'Marketing',
      amount: 300,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tenantId: tenantId
    },
    {
      title: 'Coffee and Snacks pantry restocking',
      category: 'Office Supplies',
      amount: 40,
      date: new Date(),
      tenantId: tenantId
    }
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp });
  }

  console.log('Seeding cheques...');

  // 10. Cheques
  const chequesData = [
    {
      number: 'CHQ-998877',
      bank: 'Bank of Ceylon',
      amount: 1350,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
      tenantId: tenantId
    },
    {
      number: 'CHQ-112233',
      bank: 'Commercial Bank',
      amount: 500,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'cleared',
      tenantId: tenantId
    }
  ];

  for (const chq of chequesData) {
    await prisma.cheque.create({ data: chq });
  }

  console.log('Seeding settings...');

  // 11. Settings
  const settingsData = [
    { key: 'companyName', value: 'Demo Business', tenantId: tenantId },
    { key: 'currency', value: 'LKR', tenantId: tenantId },
    { key: 'taxRate', value: '0', tenantId: tenantId },
    { key: 'theme', value: 'dark', tenantId: tenantId }
  ];

  for (const set of settingsData) {
    await prisma.setting.create({ data: set });
  }

  console.log('Seeding stock intakes...');

  // 12. StockIntakes & StockIntakeItems
  const stockIntakesData = [
    {
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timestamp: BigInt(Date.now() - 15 * 24 * 60 * 60 * 1000),
      supplierId: suppliers['Apex Tech Distribution'].id,
      supplierName: 'Apex Tech Distribution',
      totalBillAmount: 19500, // 10 * 1000 + 10 * 950
      paymentStatus: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      items: [
        {
          brandName: 'Apple',
          modelName: 'iPhone 15 Pro',
          categoryName: 'Smartphones',
          serial: 'SN-IPH15P-001',
          warrantyPeriod: '12',
          costPrice: 1000,
          sellPrice: 1200,
          quantity: 10
        },
        {
          brandName: 'Samsung',
          modelName: 'Galaxy S24 Ultra',
          categoryName: 'Smartphones',
          serial: 'SN-S24U-001',
          warrantyPeriod: '12',
          costPrice: 950,
          sellPrice: 1150,
          quantity: 10
        }
      ]
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timestamp: BigInt(Date.now() - 5 * 24 * 60 * 60 * 1000),
      supplierId: suppliers['Vertex Electronics'].id,
      supplierName: 'Vertex Electronics',
      totalBillAmount: 10000, // 5 * 1200 + 20 * 200
      paymentStatus: 'PARTIAL',
      paymentMethod: 'CASH',
      advancePayment: 4000,
      remainingBalance: 6000,
      items: [
        {
          brandName: 'Dell',
          modelName: 'XPS 13',
          categoryName: 'Laptops',
          serial: 'SN-XPS13-001',
          warrantyPeriod: '24',
          costPrice: 1200,
          sellPrice: 1450,
          quantity: 5
        },
        {
          brandName: 'Xiaomi',
          modelName: 'Redmi Note 13',
          categoryName: 'Smartphones',
          serial: 'SN-RED13-001',
          warrantyPeriod: '6',
          costPrice: 200,
          sellPrice: 250,
          quantity: 20
        }
      ]
    }
  ];

  for (const intake of stockIntakesData) {
    const dbIntake = await prisma.stockIntake.create({
      data: {
        date: intake.date,
        timestamp: intake.timestamp,
        supplierId: intake.supplierId,
        supplierName: intake.supplierName,
        totalBillAmount: intake.totalBillAmount,
        paymentStatus: intake.paymentStatus,
        paymentMethod: intake.paymentMethod,
        advancePayment: intake.advancePayment,
        remainingBalance: intake.remainingBalance,
        tenantId: tenantId
      }
    });

    for (const item of intake.items) {
      await prisma.stockIntakeItem.create({
        data: {
          stockIntakeId: dbIntake.id,
          brandName: item.brandName,
          modelName: item.modelName,
          categoryName: item.categoryName,
          serial: item.serial,
          warrantyPeriod: item.warrantyPeriod,
          costPrice: item.costPrice,
          sellPrice: item.sellPrice,
          quantity: item.quantity
        }
      });

      // Also create stock movements for the intakes (inflow)
      const matchedProd = products[item.modelName];
      if (matchedProd) {
        await prisma.stockMovement.create({
          data: {
            productId: matchedProd.id,
            quantity: item.quantity,
            type: 'IN',
            reason: `Restocked via Intake ${dbIntake.id}`
          }
        });
      }
    }
  }

  console.log('Seeding complete successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
