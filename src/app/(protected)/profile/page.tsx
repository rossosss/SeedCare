import { LogoutButton } from "@/components/auth/logout-button";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Профиль"
        description="Настройте город и режим подсказок. Так SeedCare сможет давать более полезные советы."
        action={<LogoutButton />}
      />
      <Card>
        <ProfileForm user={user} />
      </Card>
    </div>
  );
}
