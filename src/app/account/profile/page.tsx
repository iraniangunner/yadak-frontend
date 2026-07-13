import AuthSuspense from "@/app/_components/auth/AuthSuspense";
import { ProfileContent } from "@/app/account/_components/ProfileContent";

export const metadata = {
  title: "پروفایل کاربری | یدکی",
};

export default function ProfilePage() {
  return (
    <AuthSuspense>
      <ProfileContent />
    </AuthSuspense>
  );
}