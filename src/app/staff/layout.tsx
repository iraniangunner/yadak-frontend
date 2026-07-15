import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import StaffLayoutClient from "./_components/StaffLayoutClient";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/staff/layout.tsx
|--------------------------------------------------------------------------
*/

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await cookies();
  const hasSession =
    c.get("access_token")?.value || c.get("refresh_token")?.value;

  if (!hasSession) {
    redirect("/login?redirect=/staff");
  }

  return <StaffLayoutClient>{children}</StaffLayoutClient>;
}
