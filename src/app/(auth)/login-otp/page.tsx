import AuthSuspense from "@/app/_components/auth/AuthSuspense";
import { OtpLoginContent } from "@/app/_components/auth/OtpLoginContent";

export const metadata = {
  title: "ورود با کد پیامکی | یدکی",
};

export default function OtpLoginPage() {
  return (
    <AuthSuspense>
      <OtpLoginContent />
    </AuthSuspense>
  );
}
