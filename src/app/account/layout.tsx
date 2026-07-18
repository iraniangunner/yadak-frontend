import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AccountLayoutClient from "../_components/AccountLayoutClient";
import { SiteHeader } from "@/app/_components/shop/SiteHeader";
import { SiteFooter } from "@/app/_components/shop/SiteFooter";
import { MobileBottomNav } from "@/app/_components/shop/MobileBottomNav";
import { getCategories } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/layout.tsx
|--------------------------------------------------------------------------
| چک لاگین‌بودن اینجا سمت سرور انجام می‌شه (قبل از رندر شدن هر چیزی)،
| تا کاربر مهمان اصلاً یه لحظه هم محتوای این صفحات رو نبینه.
| رندر UI (Box/Container/Grid) رفته تو AccountLayoutClient چون
| کامپوننت‌های MUI نمی‌تونن مستقیم داخل Server Component رندر بشن.
|
| چون /account یه route group جدا از (shop) ـه، هدر/فوتر/نوار پایین
| خودکار اعمال نمی‌شه - باید همینجا دستی اضافه بشه.
*/

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await cookies();
  const hasSession =
    c.get("access_token")?.value || c.get("refresh_token")?.value;

  if (!hasSession) {
    redirect("/login?redirect=/account/profile");
  }

  const categories = await getCategories();

  return (
    <>
      <SiteHeader categories={categories} />
      <AccountLayoutClient>{children}</AccountLayoutClient>
      <SiteFooter />
      <MobileBottomNav categories={categories} />
    </>
  );
}
