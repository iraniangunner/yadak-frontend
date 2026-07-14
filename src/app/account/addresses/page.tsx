import { Suspense } from "react";
import { AddressesContent } from "@/app/account/_components/AddressesContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/addresses/page.tsx
|--------------------------------------------------------------------------
*/

export const metadata = {
  title: "آدرس‌های من | یدکی",
};

export default function AddressesPage() {
  return (
    <Suspense fallback={<p>در حال بارگذاری...</p>}>
      <AddressesContent />
    </Suspense>
  );
}
