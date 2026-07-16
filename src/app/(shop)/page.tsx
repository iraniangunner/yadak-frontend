import { HomeContent } from "@/app/_components/shop/HomeContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/page.tsx
|--------------------------------------------------------------------------
| ⚠️ اگه از قبل یه src/app/page.tsx (پیش‌فرض Next.js) دارید، اون رو حذف
| کنید - چون این فایل جایگزینش می‌شه (هر دو روی همون آدرس / نشسته‌ن).
*/

export const metadata = {
  title: "یدکی | فروشگاه اینترنتی قطعات خودرو",
  description:
    "خرید آنلاین قطعات یدکی خودرو با جستجوی دقیق بر اساس برند و مدل خودرو",
};

export default function HomePage() {
  return <HomeContent />;
}
