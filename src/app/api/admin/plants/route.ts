import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin";
import { type AdminPlantBody, validatePlantPayload } from "@/server/services/admin-plant.service";

export async function GET() {
  const admin = await requireAdminUser();

  if (!admin.ok) return admin.response;

  const plants = await prisma.plantCatalog.findMany({
    include: { stages: { orderBy: { order: "asc" } } },
    orderBy: [{ type: "asc" }, { name: "asc" }]
  });

  return NextResponse.json({ plants });
}

export async function POST(request: Request) {
  const admin = await requireAdminUser();

  if (!admin.ok) return admin.response;

  const payload = validatePlantPayload((await request.json().catch(() => null)) as AdminPlantBody);

  if (!payload.ok) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  try {
    const plant = await prisma.plantCatalog.create({
      data: {
        ...payload.data,
        stages: { create: payload.data.stages }
      },
      include: { stages: { orderBy: { order: "asc" } } }
    });

    return NextResponse.json({ plant }, { status: 201 });
  } catch (error) {
    console.error("Admin plant create error", error);
    return NextResponse.json(
      { error: "Не получилось создать растение. Возможно, такое название уже есть." },
      { status: 400 }
    );
  }
}
