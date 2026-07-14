/*
|--------------------------------------------------------------------------
| مسیر فایل: src/lib/format.ts
|--------------------------------------------------------------------------
| برای جلوگیری از تکرار این دو تابع توی هر کامپوننتی که قیمت/تاریخ نشون
| می‌ده (OrdersContent, AdminOrdersContent, و بقیه‌ی صفحاتی که می‌سازیم).
*/

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
    new Date(dateStr),
  );
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}
