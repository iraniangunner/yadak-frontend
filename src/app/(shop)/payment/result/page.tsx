import { Suspense } from "react";
import { PaymentResultContent } from "@/app/_components/shop/PaymentResultContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/payment/result/page.tsx
|--------------------------------------------------------------------------
*/

export const metadata = {
  title: "نتیجه‌ی پرداخت | یدکی",
};

export default function PaymentResultPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResultContent />
    </Suspense>
  );
}
