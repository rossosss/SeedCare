import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Вход"
      subtitle="Введите email и пароль, чтобы открыть свою домашнюю ферму."
      footerText="Ещё нет аккаунта?"
      footerHref="/auth/register"
      footerLinkText="Зарегистрироваться"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
