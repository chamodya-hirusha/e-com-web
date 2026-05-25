import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { tenantId } = getAuthContext();
    const data = await request.json();

    // Map local status to statusId relation for Repair
    const statusName = data.status || "Pending";
    const capitalized = statusName.charAt(0).toUpperCase() + statusName.slice(1).toLowerCase();
    
    let statusObj = await prisma.repairStatus.findUnique({ where: { name: capitalized } });
    if (!statusObj) {
      statusObj = await prisma.repairStatus.findFirst();
    }

    const { status, ...rest } = data;

    const repair = await prisma.repair.create({
      data: {
        ...rest,
        tenantId,
        statusId: statusObj?.id,
        cost: data.cost ? parseFloat(data.cost) : null,
      },
    });

    return NextResponse.json(repair, { status: 201 });
  } catch (error: any) {
    console.error("[REPAIR_CREATE]", error);
    return NextResponse.json({ error: error.message || 'Failed to create repair' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { tenantId } = getAuthContext();

    const repairs = await prisma.repair.findMany({
      where: { tenantId },
      include: {
        status: true,
      }
    });
    return NextResponse.json(repairs);
  } catch (error: any) {
    console.error("[REPAIR_GET]", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch repairs' }, { status: 500 });
  }
}
