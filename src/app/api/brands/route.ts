import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await prisma.brand.findMany();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    
    // Check if brand already exists to avoid unique constraint error
    let data = await prisma.brand.findUnique({
      where: { name: body.name }
    });
    
    if (!data) {
      data = await prisma.brand.create({
        data: { name: body.name }
      });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
