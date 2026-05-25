const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, '../src/app/api/suppliers/[id]'),
  path.join(__dirname, '../src/app/api/suppliers/[id]/products'),
  path.join(__dirname, '../src/app/api/suppliers/[id]/bills'),
];

dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

// PUT /api/suppliers/[id]
fs.writeFileSync(path.join(dirs[0], 'route.ts'), `import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();
    const body = await req.json();

    const data = await prisma.supplier.update({
      where: { id: params.id, tenantId },
      data: body
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// GET /api/suppliers/[id]/products (Fetch StockIntakeItems where stockIntake.supplierId == id)
fs.writeFileSync(path.join(dirs[1], 'route.ts'), `import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();

    const items = await prisma.stockIntakeItem.findMany({
      where: {
        stockIntake: {
          supplierId: params.id,
          tenantId
        }
      },
      include: {
        stockIntake: {
          select: { date: true, timestamp: true }
        }
      },
      orderBy: {
        stockIntake: { timestamp: 'desc' }
      }
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// GET & POST /api/suppliers/[id]/bills
fs.writeFileSync(path.join(dirs[2], 'route.ts'), `import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();

    const bills = await prisma.supplierBill.findMany({
      where: { supplierId: params.id, tenantId },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(bills);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();
    const body = await req.json();

    const bill = await prisma.supplierBill.create({
      data: {
        ...body,
        amount: Number(body.amount),
        supplierId: params.id,
        tenantId
      }
    });

    return NextResponse.json(bill);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

console.log("Successfully created API routes for Suppliers.");
