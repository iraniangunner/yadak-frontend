/*
|--------------------------------------------------------------------------
| مسیر فایل: src/lib/returnStatus.ts
|--------------------------------------------------------------------------
*/

import type { OrderStatusColor } from "@/lib/orderStatus";

export const returnStatusLabels: Record<
  string,
  { label: string; color: OrderStatusColor }
> = {
  requested: { label: "در انتظار بررسی", color: "warning" },
  approved: { label: "تأییدشده", color: "info" },
  rejected: { label: "ردشده", color: "error" },
  refunded: { label: "واریزشده", color: "success" },
};

export function getReturnStatusMeta(status: string) {
  return (
    returnStatusLabels[status] || {
      label: status,
      color: "default" as OrderStatusColor,
    }
  );
}
