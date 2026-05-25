import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 })
    };
  }

  if (user.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Доступ только для администратора." }, { status: 403 })
    };
  }

  return { ok: true as const, user };
}
