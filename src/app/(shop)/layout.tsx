import { SiteHeader } from "@/app/_components/shop/SiteHeader";
import { SiteFooter } from "@/app/_components/shop/SiteFooter";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/layout.tsx
|--------------------------------------------------------------------------
| این لایوت روی همه‌ی صفحات عمومی سایت (هومپیج، لیست/جزئیات محصول، مقالات)
| اعمال می‌شه. چون (shop) یه route group هست (پرانتزی)، روی خودِ آدرس URL
| تأثیری نداره - یعنی صفحه‌ی داخلش (page.tsx) دقیقاً همون / اصلی می‌مونه.
| /account، /admin، /staff هرکدوم لایوت جدای خودشون رو دارن و از این
| تأثیر نمی‌گیرن.
*/

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}