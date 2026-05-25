import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getValidationError, parseJson, profileUpdateSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const parsed = profileUpdateSchema.safeParse(await parseJson(request));

  if (!parsed.success) {
    return NextResponse.json({ error: getValidationError(parsed.error) }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      city: true,
      country: true,
      latitude: true,
      longitude: true,
      careMode: true
    }
  });

  return NextResponse.json({ user: updatedUser });
}
