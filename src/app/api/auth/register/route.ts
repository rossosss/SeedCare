import { NextResponse } from "next/server";
import { type SessionUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { getSessionCookieOptions, signSessionToken } from "@/lib/session";
import { getValidationError, parseJson, registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await parseJson(request);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: getValidationError(parsed.error) }, { status: 400 });
  }

  const limit = rateLimit({
    key: getRateLimitKey(request, "register", parsed.data.email),
    limit: 5,
    windowMs: 15 * 60 * 1000
  });

  if (!limit.ok) {
    return NextResponse.json({ error: "Слишком много попыток регистрации. Попробуйте позже." }, { status: 429 });
  }

  const { name, email, password } = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (existingUser) {
    return NextResponse.json({ error: "Пользователь с таким email уже есть." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password)
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  });

  const sessionUser: SessionUser = user;
  const token = await signSessionToken(sessionUser);
  const response = NextResponse.json({ user: sessionUser }, { status: 201 });

  // Session lives in an httpOnly cookie, so browser JavaScript cannot read or steal it.
  response.cookies.set({ ...getSessionCookieOptions(), value: token });

  return response;
}
