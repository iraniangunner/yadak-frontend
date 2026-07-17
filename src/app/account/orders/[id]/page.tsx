import { OrderDetailContent } from "@/app/account/_components/OrderDetailContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/orders/[id]/page.tsx
|--------------------------------------------------------------------------
*/

export const metadata = {
  title: "جزئیات سفارش | پنل کاربری",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrderDetailContent orderId={Number(id)} />;
}
