import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();

    const items = await prisma.stockIntakeItem.findMany({
      where: {
        stockIntake: {
          supplierId: params.id,
          tenantId
        }
      },
      include: {
        stockIntake: {
          select: { date: true, timestamp: true }
        }
      },
      orderBy: {
        stockIntake: { timestamp: 'desc' }
      }
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
