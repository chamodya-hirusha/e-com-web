import { NextResponse } from "next/server";
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
