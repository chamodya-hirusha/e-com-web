import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { tenantId } = getAuthContext();
    const data = await request.json();

    const expense = await prisma.expense.create({
      data: {
        ...data,
        tenantId,
        amount: data.amount ? parseFloat(data.amount) : 0,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error("[EXPENSE_CREATE]", error);
    return NextResponse.json({ error: error.message || 'Failed to create expense' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { tenantId } = getAuthContext();

    const expenses = await prisma.expense.findMany({
      where: { tenantId },
    });
    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("[EXPENSE_GET]", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch expenses' }, { status: 500 });
  }
}
