import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const plant = await prisma.plantCatalog.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!plant) {
    return NextResponse.json({ error: "Растение не найдено." }, { status: 404 });
  }

  return NextResponse.json({ plant });
}
