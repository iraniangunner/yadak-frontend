import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminLayoutClient from "./_components/AdminLayoutClient";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/layout.tsx
|--------------------------------------------------------------------------
| چک اولیه‌ی لاگین‌بودن سمت سرور (وجود کوکی). چک دقیق نقش (admin/warehouse/
| sales/support) چون نیاز به دیکود کردن اطلاعات کاربر داره که سمت سرور
| این‌جا نداریمش، سمت کلاینت توی AdminLayoutClient (با GET /me) انجام می‌شه.
*/

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await cookies();
  const hasSession =
    c.get("access_token")?.value || c.get("refresh_token")?.value;

  if (!hasSession) {
    redirect("/login?redirect=/admin");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
