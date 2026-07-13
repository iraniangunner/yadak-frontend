import AuthSuspense from "@/app/_components/auth/AuthSuspense";
import { RegisterContent } from "@/app/_components/auth/RegisterContent";

export const metadata = {
  title: "ثبت‌نام | یدکی",
};

export default function RegisterPage() {
  return (
    <AuthSuspense>
      <RegisterContent />
    </AuthSuspense>
  );
}