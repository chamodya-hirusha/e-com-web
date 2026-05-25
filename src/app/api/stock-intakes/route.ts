import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { tenantId } = getAuthContext();
    const data = await prisma.stockIntake.findMany({
      where: { tenantId },
      include: { items: true },
      orderBy: { timestamp: 'desc' }
    });
    
    // Convert BigInt to string to avoid JSON serialization errors
    const sanitizedData = data.map(item => ({
      ...item,
      timestamp: Number(item.timestamp)
    }));

    return NextResponse.json(sanitizedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tenantId } = getAuthContext();
    const body = await req.json();
    
    const { items, ...intakeData } = body;
    
    const data = await prisma.stockIntake.create({
      data: { 
        ...intakeData, 
        tenantId,
        timestamp: BigInt(intakeData.timestamp || Date.now()),
        items: items ? { create: items } : undefined
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
