import { SiteHeader } from "@/app/_components/shop/SiteHeader";
import { SiteFooter } from "@/app/_components/shop/SiteFooter";
import { MobileBottomNav } from "@/app/_components/shop/MobileBottomNav";
import { getCategories } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/layout.tsx
|--------------------------------------------------------------------------
*/

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader categories={categories} />
      <main>{children}</main>
      <SiteFooter />
      <MobileBottomNav categories={categories} />
    </>
  );
}
