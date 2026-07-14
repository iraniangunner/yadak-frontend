/*
|--------------------------------------------------------------------------
| مسیر فایل: src/lib/orderStatus.ts
|--------------------------------------------------------------------------
*/

export type OrderStatusColor =
  | "default"
  | "warning"
  | "info"
  | "success"
  | "error";

export const orderStatusLabels: Record<
  string,
  { label: string; color: OrderStatusColor }
> = {
  pending_review: { label: "در انتظار بررسی", color: "warning" },
  needs_customer_confirmation: {
    label: "نیاز به تأیید مشتری",
    color: "warning",
  },
  awaiting_payment: { label: "در انتظار پرداخت", color: "info" },
  paid: { label: "پرداخت‌شده", color: "success" },
  cancelled: { label: "لغوشده", color: "default" },
  expired: { label: "منقضی‌شده", color: "error" },
};

export function getOrderStatusMeta(status: string) {
  return (
    orderStatusLabels[status] || {
      label: status,
      color: "default" as OrderStatusColor,
    }
  );
}
