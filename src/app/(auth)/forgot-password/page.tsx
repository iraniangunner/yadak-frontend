import AuthSuspense from "@/app/_components/auth/AuthSuspense";
import { ForgotPasswordContent } from "@/app/_components/auth/ForgotPasswordContent";

export const metadata = {
  title: "فراموشی رمز عبور | یدکی",
};

export default function ForgotPasswordPage() {
  return (
    <AuthSuspense>
      <ForgotPasswordContent />
    </AuthSuspense>
  );
}