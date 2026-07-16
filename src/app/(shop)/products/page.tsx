import { Suspense } from "react";
import { ProductsPageContent } from "@/app/_components/shop/ProductsPageContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/products/page.tsx
|--------------------------------------------------------------------------
*/

export const metadata = {
  title: "محصولات | یدکی",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<p>در حال بارگذاری...</p>}>
      <ProductsPageContent />
    </Suspense>
  );
}
