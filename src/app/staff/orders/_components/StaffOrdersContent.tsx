"use client";

import { AdminOrdersContent } from "@/app/admin/orders/_components/AdminOrdersContent";
import { useAuthStore } from "@/lib/store/authStore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/staff/_components/StaffOrdersContent.tsx
|--------------------------------------------------------------------------
*/

export function StaffOrdersContent() {
  const user = useAuthStore((s) => s.user);
  const readOnly = user?.role === "sales" || user?.role === "support";

  return <AdminOrdersContent readOnly={readOnly} />;
}
