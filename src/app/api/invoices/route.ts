import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { createInvoice } from "@/services/invoice.service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { tenantId, userId } = getAuthContext();
    const body = await req.json();

    const invoice = await createInvoice(body, tenantId, userId);
    
    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("[INVOICE_CREATE]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { tenantId } = getAuthContext();

    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      include: {
        items: true,
      },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error("[INVOICE_GET]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch invoices" }, { status: 500 });
  }
}
