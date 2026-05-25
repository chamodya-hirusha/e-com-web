import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { tenantId } = getAuthContext();
    const data = await prisma.customer.findMany({ where: { tenantId } });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tenantId } = getAuthContext();
    const body = await req.json();
    const data = await prisma.customer.create({
      data: { ...body, tenantId }
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
