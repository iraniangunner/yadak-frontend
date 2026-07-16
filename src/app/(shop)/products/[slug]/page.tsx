import { ProductDetailContent } from "@/app/_components/shop/ProductDetailContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/products/[slug]/page.tsx
|--------------------------------------------------------------------------
*/

export const metadata = {
  title: "جزئیات محصول | یدکی",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductDetailContent slug={slug} />;
}
