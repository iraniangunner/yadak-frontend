import { notFound } from "next/navigation";
import {
  getCategories,
  getBrands,
  getProducts,
  getVehicleFilterOptions,
  findBrandBySlug,
} from "@/lib/serverApi";
import { FilterSidebar } from "@/app/_components/shop/products/FilterSidebar";
import { MobileFilterButton } from "@/app/_components/shop/products/MobileFilterButton";
import { SortAndPerPageControls } from "@/app/_components/shop/products/SortAndPerPageControls";
import { ActiveFilterChips } from "@/app/_components/shop/products/ActiveFilterChips";
import { ProductGridWithLoadMore } from "@/app/_components/shop/products/ProductGridWithLoadMore";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/brand/[slug]/page.tsx
|--------------------------------------------------------------------------
| «خرید بر اساس برند» - دقیقاً هم‌ساختار با /category/[slug]، فقط قفل‌شده
| روی یه برند به‌جای یه دسته‌بندی. فیلتر دسته‌بندی اینجا آزاده (چون یه
| برند می‌تونه توی چند دسته باشه)، ولی فیلتر برند خودش قفل و مخفیه.
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const brands = await getBrands();
  const brand = findBrandBySlug(brands, decodedSlug);

  return {
    title: brand ? `${brand.name} | یدکی` : "برند پیدا نشد | یدکی",
  };
}

function buildQueryString(sp: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(sp).forEach(([key, value]) => {
    if (!value) return;
    if (key.startsWith("attr_")) {
      params.set(`attributes[${key.slice(5)}]`, value);
    } else {
      params.set(key, value);
    }
  });
  return params.toString();
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const sp = await searchParams;

  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);
  const brand = findBrandBySlug(brands, decodedSlug);

  if (!brand) {
    notFound();
  }

  const vehicleOptions = await getVehicleFilterOptions(undefined, [brand.id]);

  const queryString = buildQueryString({
    ...Object.fromEntries(
      Object.entries(sp).filter(([key]) => key.startsWith("attr_"))
    ),
    brand_id: String(brand.id),
    category_id: sp.category_id,
    vehicle_brand: sp.vehicle_brand,
    vehicle_model: sp.vehicle_model,
    stock_status: sp.stock_status,
    min_rating: sp.min_rating,
    min_price: sp.min_price,
    max_price: sp.max_price,
    is_available: sp.is_available,
    is_discounted: sp.is_discounted,
    sort: sp.sort,
    per_page: sp.per_page || "12",
    page: "1",
  });

  const products = await getProducts(queryString, 10);
  const basePath = `/brand/${slug}`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        محصولات برند {brand.name}
      </Typography>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        {/* فیلتر برند اینجا مخفیه (قفل‌شده روی همین برند)؛ دسته‌بندی آزاده */}
        <FilterSidebar
          categories={categories}
          brands={[]}
          vehicleBrandOptions={vehicleOptions.brands}
          vehicleModelOptions={vehicleOptions.models}
          showCategoryFilter={true}
          basePath={basePath}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
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
                brands={[]}
                vehicleBrandOptions={vehicleOptions.brands}
                vehicleModelOptions={vehicleOptions.models}
                showCategoryFilter={true}
                basePath={basePath}
              />
              <Box sx={{ ml: "auto" }}>
                <SortAndPerPageControls basePath={basePath} />
              </Box>
            </Box>

            <ActiveFilterChips
              categories={categories}
              brands={[]}
              showCategoryFilter={true}
              basePath={basePath}
            />
          </Box>

          <ProductGridWithLoadMore
            initialProducts={products.data}
            initialTotal={products.total}
            initialLastPage={products.lastPage}
            fixedBrandId={brand.id}
            basePath={basePath}
            showCategoryFilter={true}
          />
        </Box>
      </Box>
    </Container>
  );
}
