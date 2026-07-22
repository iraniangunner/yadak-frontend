import {
  getCategories,
  getBrands,
  getProducts,
  getVehicleFilterOptions,
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
| مسیر فایل: src/app/(shop)/vehicle/[brand]/page.tsx
|--------------------------------------------------------------------------
| «خرید بر اساس خودرو» - دقیقاً هم‌ساختار با /category و /brand، فقط
| قفل‌شده روی یه برند خودرو (نه برند محصول). چون vehicle_brand یه رشته‌ی
| ساده‌ست (نه یه موجودیت با id)، پارامتر مسیر خودِ اسم برند (URL-encode
| شده) هست، نه یه slug جدا.
|
| فیلتر «مدل خودرو» همچنان آزاده - یعنی مشتری می‌تونه بعد از ورود به
| صفحه‌ی «پژو»، مدل خاصی (مثلاً ۲۰۶) رو هم اضافه فیلتر کنه.
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  const brandName = decodeURIComponent(brand);
  return { title: `قطعات ${brandName} | یدکی` };
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

export default async function VehicleBrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { brand } = await params;
  const sp = await searchParams;
  const vehicleBrandName = decodeURIComponent(brand);

  const [categories, brands, vehicleOptions] = await Promise.all([
    getCategories(),
    getBrands(),
    getVehicleFilterOptions(),
  ]);

  // ⚠️ برخلاف قبل، اینجا notFound() صدا نمی‌زنیم حتی اگه فعلاً هیچ
  // محصولی با این برند خودرو نباشه - دقیقاً مثل /category و /brand،
  // نبود محصول یعنی نتیجه‌ی خالی (که خودِ ProductGridWithLoadMore
  // نمایشش می‌ده)، نه یعنی این صفحه اصلاً وجود نداره.

  const queryString = buildQueryString({
    ...Object.fromEntries(
      Object.entries(sp).filter(([key]) => key.startsWith("attr_"))
    ),
    vehicle_brand: vehicleBrandName,
    vehicle_model: sp.vehicle_model,
    category_id: sp.category_id,
    brand_id: sp.brand_id,
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
  const basePath = `/vehicle/${brand}`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        قطعات مناسب {vehicleBrandName}
      </Typography>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        {/* برند خودرو اینجا مخفیه (قفل‌شده روی همین برند)؛ مدل خودرو همچنان آزاده */}
        <FilterSidebar
          categories={categories}
          brands={brands}
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
                brands={brands}
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
              brands={brands}
              showCategoryFilter={true}
              basePath={basePath}
            />
          </Box>

          <ProductGridWithLoadMore
            initialProducts={products.data}
            initialTotal={products.total}
            initialLastPage={products.lastPage}
            fixedVehicleBrand={vehicleBrandName}
            basePath={basePath}
            showCategoryFilter={true}
          />
        </Box>
      </Box>
    </Container>
  );
}
