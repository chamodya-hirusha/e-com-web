import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId } = getAuthContext();

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id, tenantId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error("[INVOICE_GET]", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId } = getAuthContext();
    const data = await request.json();

    // Verify ownership
    const existing = await prisma.invoice.findUnique({
      where: { id: params.id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // In a real scenario, you might also need to update items.
    // For simplicity, we'll just update the invoice properties here.
    const { items, payments, ...invoiceData } = data;

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: invoiceData,
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error("[INVOICE_UPDATE]", error);
    return NextResponse.json({ error: error.message || 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId } = getAuthContext();

    // Verify ownership
    const existing = await prisma.invoice.findUnique({
      where: { id: params.id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Delete related items first (if cascade is not enabled in DB)
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: params.id },
    });
    
    await prisma.payment.deleteMany({
      where: { invoiceId: params.id },
    });

    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[INVOICE_DELETE]", error);
    return NextResponse.json({ error: error.message || 'Failed to delete invoice' }, { status: 500 });
  }
}
