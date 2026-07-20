import { notFound } from "next/navigation";
import {
  getCategories,
  getBrands,
  getProducts,
  getVehicles,
  findCategoryBySlug,
  getCategoryAndDescendantIds,
} from "@/lib/serverApi";
import { FilterSidebar } from "@/app/_components/shop/products/FilterSidebar";
import { MobileFilterButton } from "@/app/_components/shop/products/MobileFilterButton";
import { ProductSearchBar } from "@/app/_components/shop/products/ProductSearchBar";
import { SortAndPerPageControls } from "@/app/_components/shop/products/SortAndPerPageControls";
import { ActiveFilterChips } from "@/app/_components/shop/products/ActiveFilterChips";
import { ProductGridWithLoadMore } from "@/app/_components/shop/products/ProductGridWithLoadMore";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/category/[slug]/page.tsx
|--------------------------------------------------------------------------
| صفحه‌ی مخصوص یه دسته‌بندی. برخلاف /products، اینجا فیلتر «دسته‌بندی»
| نشون داده نمی‌شه - فقط برند/وضعیت‌موجودی/امتیاز/خودرو.
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = findCategoryBySlug(categories, slug);

  return {
    title: category ? `${category.name} | یدکی` : "دسته‌بندی پیدا نشد | یدکی",
  };
}

function buildQueryString(sp: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(sp).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const categories = await getCategories();
  const category = findCategoryBySlug(categories, slug);

  if (!category) {
    notFound();
  }

  const categoryIds = getCategoryAndDescendantIds(categories, category.id);
  const [brands, vehicles] = await Promise.all([
    getBrands(categoryIds),
    getVehicles(categoryIds),
  ]);

  const queryString = buildQueryString({
    category_id: categoryIds.join(","),
    vehicle_id: sp.vehicle_id,
    brand_id: sp.brand_id,
    stock_status: sp.stock_status,
    min_rating: sp.min_rating,
    sort: sp.sort,
    per_page: sp.per_page || "12",
    page: "1",
  });

  const products = await getProducts(queryString, 10);
  const basePath = `/category/${slug}`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {category.name}
      </Typography>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        <FilterSidebar
          categories={categories}
          brands={brands}
          vehicles={vehicles}
          showCategoryFilter={false}
          basePath={basePath}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ProductSearchBar basePath={basePath} />

          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              p: 1.5,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <MobileFilterButton
                categories={categories}
                brands={brands}
                vehicles={vehicles}
                showCategoryFilter={false}
                basePath={basePath}
              />
              <Box sx={{ ml: "auto" }}>
                <SortAndPerPageControls basePath={basePath} />
              </Box>
            </Box>

            <ActiveFilterChips
              categories={categories}
              brands={brands}
              vehicles={vehicles}
              showCategoryFilter={false}
              basePath={basePath}
            />
          </Box>

          <ProductGridWithLoadMore
            initialProducts={products.data}
            initialTotal={products.total}
            initialLastPage={products.lastPage}
            fixedCategoryIds={categoryIds}
            basePath={basePath}
            showCategoryFilter={false}
          />
        </Box>
      </Box>
    </Container>
  );
}
