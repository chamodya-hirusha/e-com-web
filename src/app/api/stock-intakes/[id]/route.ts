import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();
    const data = await prisma.stockIntake.findUnique({ 
      where: { id: params.id, tenantId },
      include: { items: true }
    });
    
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...data,
      timestamp: Number(data.timestamp)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();
    const body = await req.json();
    const { items, ...intakeData } = body;

    const data = await prisma.stockIntake.update({
      where: { id: params.id, tenantId },
      data: {
        ...intakeData,
        timestamp: intakeData.timestamp ? BigInt(intakeData.timestamp) : undefined,
      },
      include: { items: true }
    });

    return NextResponse.json({
      ...data,
      timestamp: Number(data.timestamp)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getAuthContext();
    await prisma.stockIntake.delete({
      where: { id: params.id, tenantId }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
