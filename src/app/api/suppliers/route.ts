import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { tenantId } = getAuthContext();
    const data = await request.json();

    const supplier = await prisma.supplier.create({
      data: {
        ...data,
        tenantId,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    console.error("[SUPPLIER_CREATE]", error);
    return NextResponse.json({ error: error.message || 'Failed to create supplier' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { tenantId } = getAuthContext();

    const suppliers = await prisma.supplier.findMany({
      where: { tenantId },
    });
    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error("[SUPPLIER_GET]", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch suppliers' }, { status: 500 });
  }
}
