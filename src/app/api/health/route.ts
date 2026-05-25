import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "ok"
    });
  } catch (error) {
    console.error("Healthcheck database error", error);

    return NextResponse.json(
      {
        status: "error",
        database: "error"
      },
      { status: 503 }
    );
  }
}
