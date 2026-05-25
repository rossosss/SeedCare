import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const plants = await prisma.plantCatalog.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      difficulty: true,
      description: true,
      lightRequirement: true,
      waterRequirement: true,
      averageGerminationDays: true,
      averageHarvestDays: true,
      recommendedContainer: true,
      sowingDepth: true,
      temperature: true
    }
  });

  return NextResponse.json({ plants });
}
