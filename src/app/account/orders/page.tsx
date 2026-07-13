import { Suspense } from "react";
import { OrdersContent } from "../_components/OrdersContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/orders/page.tsx
|--------------------------------------------------------------------------
*/

export const metadata = {
  title: "سفارش‌های من | یدکی",
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<p>در حال بارگذاری...</p>}>
      <OrdersContent />
    </Suspense>
  );
}
