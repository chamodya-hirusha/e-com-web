const fs = require('fs');
const path = require('path');

const models = [
  { name: 'customers', modelName: 'customer', hasTenant: true },
  { name: 'warranties', modelName: 'warranty', hasTenant: true },
  { name: 'cheques', modelName: 'cheque', hasTenant: true },
  { name: 'categories', modelName: 'category', hasTenant: false },
  { name: 'brands', modelName: 'brand', hasTenant: false },
  { name: 'models', modelName: 'model', hasTenant: false }
];

const apiDir = path.join(__dirname, '../src/app/api');

models.forEach(({ name, modelName, hasTenant }) => {
  const modelDir = path.join(apiDir, name);
  const idDir = path.join(modelDir, '[id]');
  
  if (!fs.existsSync(idDir)) {
    fs.mkdirSync(idDir, { recursive: true });
  }

  // Generate route.ts
  const routeContent = `import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
${hasTenant ? 'import { getAuthContext } from "@/lib/auth";' : ''}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    ${hasTenant ? `const { tenantId } = getAuthContext();\n    const data = await prisma.${modelName}.findMany({ where: { tenantId } });` : `const data = await prisma.${modelName}.findMany();`}
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ${hasTenant ? `const { tenantId } = getAuthContext();` : ''}
    const body = await req.json();
    const data = await prisma.${modelName}.create({
      data: ${hasTenant ? '{ ...body, tenantId }' : 'body'}
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;

  // Generate [id]/route.ts
  const idRouteContent = `import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
${hasTenant ? 'import { getAuthContext } from "@/lib/auth";' : ''}

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    ${hasTenant ? `const { tenantId } = getAuthContext();\n    const data = await prisma.${modelName}.findUnique({ where: { id: params.id, tenantId } });` : `const data = await prisma.${modelName}.findUnique({ where: { id: params.id } });`}
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    ${hasTenant ? `const { tenantId } = getAuthContext();` : ''}
    const body = await req.json();
    const data = await prisma.${modelName}.update({
      where: { id: params.id${hasTenant ? ', tenantId' : ''} },
      data: body
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    ${hasTenant ? `const { tenantId } = getAuthContext();` : ''}
    await prisma.${modelName}.delete({
      where: { id: params.id${hasTenant ? ', tenantId' : ''} }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;

  fs.writeFileSync(path.join(modelDir, 'route.ts'), routeContent);
  fs.writeFileSync(path.join(idDir, 'route.ts'), idRouteContent);
});

console.log("Successfully generated all missing APIs");
