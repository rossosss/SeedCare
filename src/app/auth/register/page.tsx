import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Регистрация"
      subtitle="Создайте аккаунт, чтобы SeedCare помнил ваши растения и задачи."
      footerText="Уже есть аккаунт?"
      footerHref="/auth/login"
      footerLinkText="Войти"
    >
      <RegisterForm />
    </AuthCard>
  );
}
