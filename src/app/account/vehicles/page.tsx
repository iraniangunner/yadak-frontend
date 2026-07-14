import { Suspense } from "react";
import { VehiclesContent } from "@/app/account/_components/VehiclesContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/vehicles/page.tsx
|--------------------------------------------------------------------------
*/

export const metadata = {
  title: "خودروهای من | یدکی",
};

export default function VehiclesPage() {
  return (
    <Suspense fallback={<p>در حال بارگذاری...</p>}>
      <VehiclesContent />
    </Suspense>
  );
}
