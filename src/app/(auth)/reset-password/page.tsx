import AuthSuspense from "@/app/_components/auth/AuthSuspense";
import { ResetPasswordContent } from "@/app/_components/auth/ResetPasswordContent";

export const metadata = {
  title: "تنظیم رمز عبور جدید | یدکی",
};

export default function ResetPasswordPage() {
  return (
    <AuthSuspense>
      <ResetPasswordContent />
    </AuthSuspense>
  );
}