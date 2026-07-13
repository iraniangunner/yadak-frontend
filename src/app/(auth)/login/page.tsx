import AuthSuspense from "@/app/_components/auth/AuthSuspense";
import { LoginContent } from "@/app/_components/auth/LoginContent";

export const metadata = {
  title: "ورود | یدکی",
};

export default function LoginPage() {
  return (
    <AuthSuspense>
      <LoginContent />
    </AuthSuspense>
  );
}