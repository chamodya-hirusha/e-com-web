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

    const repair = await prisma.repair.findUnique({
      where: { id: params.id, tenantId },
      include: {
        status: true,
      }
    });

    if (!repair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }

    return NextResponse.json(repair);
  } catch (error: any) {
    console.error("[REPAIR_GET]", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch repair' }, { status: 500 });
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
    const existing = await prisma.repair.findUnique({
      where: { id: params.id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }

    // Map local status to statusId relation for Repair
    let statusId = existing.statusId;
    if (data.status) {
      const statusName = data.status;
      const capitalized = statusName.charAt(0).toUpperCase() + statusName.slice(1).toLowerCase();
      
      const statusObj = await prisma.repairStatus.findUnique({ where: { name: capitalized } });
      if (statusObj) {
        statusId = statusObj.id;
      }
    }

    const { status, ...rest } = data;

    const repair = await prisma.repair.update({
      where: { id: params.id },
      data: {
        ...rest,
        statusId,
        cost: data.cost ? parseFloat(data.cost) : existing.cost,
      },
    });

    return NextResponse.json(repair);
  } catch (error: any) {
    console.error("[REPAIR_UPDATE]", error);
    return NextResponse.json({ error: error.message || 'Failed to update repair' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId } = getAuthContext();

    // Verify ownership
    const existing = await prisma.repair.findUnique({
      where: { id: params.id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }

    await prisma.repair.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[REPAIR_DELETE]", error);
    return NextResponse.json({ error: error.message || 'Failed to delete repair' }, { status: 500 });
  }
}
