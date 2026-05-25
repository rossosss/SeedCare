import { cookies } from "next/headers";
import { cache } from "react";
import { SESSION_COOKIE_NAME, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
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

  return user;
});
