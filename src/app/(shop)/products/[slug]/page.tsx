import { notFound } from "next/navigation";
import NextLink from "next/link";
import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { getProduct, getProducts } from "@/lib/serverApi";
import { ProductGalleryEmbla } from "@/app/_components/shop/product/ProductGalleryEmbla";
import { ProductInfoCard } from "@/app/_components/shop/product/ProductInfoCard";
import { ProductTabsSection } from "@/app/_components/shop/product/ProductTabsSection";
import { RelatedProductsCarousel } from "@/app/_components/shop/RelatedProductsCarousel";
import Container from "@mui/material/Container";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/products/[slug]/page.tsx
|--------------------------------------------------------------------------
| Server Component async - جزئیات محصول کاملاً SSR. فقط تعامل‌های شخصی
| (افزودن به سبد، علاقه‌مندی، نظرات، انتخاب تعداد، گالری) کلاینتی‌ان.
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  return {
    title: product ? `${product.title} | یدکی` : "محصول پیدا نشد | یدکی",
    description: product?.description?.slice(0, 150),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const related = product.category
    ? await getProducts(`category_id=${product.category.id}&per_page=10`, 60)
    : { data: [] };

  const relatedProducts = related.data.filter((p) => p.id !== product.id);
  const images =
    product.images.length > 0
      ? product.images.map((i) => i.url)
      : [product.thumbnail_url || ""];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateBefore fontSize="small" />} sx={{ mb: 3 }}>
        <Box
          component={NextLink}
          href="/"
          sx={{ color: "text.secondary", textDecoration: "none" }}
        >
          خانه
        </Box>
        <Box
          component={NextLink}
          href="/products"
          sx={{ color: "text.secondary", textDecoration: "none" }}
        >
          محصولات
        </Box>
        {product.category && (
          <Box
            component={NextLink}
            href={`/products?category_id=${product.category.id}`}
            sx={{ color: "text.secondary", textDecoration: "none" }}
          >
            {product.category.name}
          </Box>
        )}
        <Typography color="text.primary">{product.title}</Typography>
      </Breadcrumbs>

      {/* دو ستون: گالری + کارت جزئیات (مثل دیجی‌کالا) */}
      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 4 }}>
        <Box sx={{ width: { xs: "100%", md: 440 }, flexShrink: 0 }}>
          <ProductGalleryEmbla images={images} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 280 }}>
          <ProductInfoCard product={product} />
        </Box>
      </Box>

      {/* Tab های جدا: توضیحات / ویژگی‌ها / نظرات */}
      <Box sx={{ mb: 5 }}>
        <ProductTabsSection
          productId={product.id}
          description={product.description}
          attributes={product.product_attributes}
          averageRating={product.average_rating}
          reviewsCount={product.reviews_count}
        />
      </Box>

      {/* محصولات مرتبط */}
      {relatedProducts.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            محصولات مرتبط
          </Typography>
          <RelatedProductsCarousel products={relatedProducts} />
        </Box>
      )}
    </Container>
  );
}
