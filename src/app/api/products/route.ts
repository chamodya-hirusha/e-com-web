import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { tenantId } = getAuthContext();
    const data = await request.json();

    const product = await prisma.product.create({
      data: {
        ...data,
        tenantId,
        costPrice: data.costPrice || 0,
        sellPrice: data.sellPrice || 0,
        quantity: data.quantity || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("[PRODUCT_CREATE]", error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { tenantId } = getAuthContext();

    const products = await prisma.product.findMany({
      where: { tenantId },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("[PRODUCT_GET]", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}
