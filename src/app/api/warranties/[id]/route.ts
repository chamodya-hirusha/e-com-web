import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();
    const data = await prisma.warranty.findUnique({ where: { id: params.id, tenantId } });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();
    const body = await req.json();
    const { customerId, productId, purchaseDate, months } = body;

    const updateData: any = {};
    if (customerId) updateData.customerId = customerId;
    if (productId) updateData.productId = productId;
    
    if (purchaseDate) {
      updateData.purchaseDate = new Date(purchaseDate);
    }

    if (purchaseDate || months !== undefined) {
      let pDate = purchaseDate ? new Date(purchaseDate) : null;
      let m = months !== undefined ? Number(months) : null;

      if (!pDate || m === null) {
        const existing = await prisma.warranty.findUnique({
          where: { id: params.id, tenantId }
        });
        if (existing) {
          if (!pDate) pDate = new Date(existing.purchaseDate);
          if (m === null) {
            const exp = new Date(existing.expiryDate);
            const pur = new Date(existing.purchaseDate);
            m = (exp.getFullYear() - pur.getFullYear()) * 12 + (exp.getMonth() - pur.getMonth());
          }
        }
      }

      if (pDate && m !== null) {
        const expDate = new Date(pDate);
        expDate.setMonth(expDate.getMonth() + m);
        updateData.expiryDate = expDate;
      }
    }

    const data = await prisma.warranty.update({
      where: { id: params.id, tenantId },
      data: updateData
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();
    await prisma.warranty.delete({
      where: { id: params.id, tenantId }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
