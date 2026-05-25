import { NextResponse } from "next/server";
import { type SessionUser } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { getSessionCookieOptions, signSessionToken } from "@/lib/session";
import { getValidationError, loginSchema, parseJson } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await parseJson(request);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: getValidationError(parsed.error) }, { status: 400 });
  }

  const limit = rateLimit({
    key: getRateLimitKey(request, "login", parsed.data.email),
    limit: 10,
    windowMs: 15 * 60 * 1000
  });

  if (!limit.ok) {
    return NextResponse.json({ error: "Слишком много попыток входа. Попробуйте позже." }, { status: 429 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Пользователь с таким email не найден." }, { status: 401 });
  }

  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);

  if (!isPasswordCorrect) {
    return NextResponse.json({ error: "Пароль не подходит. Попробуйте ещё раз." }, { status: 401 });
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  const token = await signSessionToken(sessionUser);
  const response = NextResponse.json({ user: sessionUser });

  // The signed JWT is stored only in the httpOnly cookie, not in localStorage.
  response.cookies.set({ ...getSessionCookieOptions(), value: token });

  return response;
}
