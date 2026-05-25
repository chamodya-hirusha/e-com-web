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

    const expense = await prisma.expense.findUnique({
      where: { id: params.id, tenantId },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error: any) {
    console.error("[EXPENSE_GET]", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch expense' }, { status: 500 });
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
    const existing = await prisma.expense.findUnique({
      where: { id: params.id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        ...data,
        amount: data.amount ? parseFloat(data.amount) : existing.amount,
        date: data.date ? new Date(data.date) : existing.date,
      },
    });

    return NextResponse.json(expense);
  } catch (error: any) {
    console.error("[EXPENSE_UPDATE]", error);
    return NextResponse.json({ error: error.message || 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId } = getAuthContext();

    // Verify ownership
    const existing = await prisma.expense.findUnique({
      where: { id: params.id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[EXPENSE_DELETE]", error);
    return NextResponse.json({ error: error.message || 'Failed to delete expense' }, { status: 500 });
  }
}
