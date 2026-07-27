import { Container, Typography, Box } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import {
  getCategories,
  getBrands,
  getProducts,
  getVehicleFilterOptions,
  getVehicleBrandImages,
} from "@/lib/serverApi";
import { FilterSidebar } from "@/app/_components/shop/products/FilterSidebar";
import { MobileFilterButton } from "@/app/_components/shop/products/MobileFilterButton";
import { SortAndPerPageControls } from "@/app/_components/shop/products/SortAndPerPageControls";
import { ActiveFilterChips } from "@/app/_components/shop/products/ActiveFilterChips";
import { ProductGridWithLoadMore } from "@/app/_components/shop/products/ProductGridWithLoadMore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/special-offers/page.tsx
|--------------------------------------------------------------------------
| «تخفیف‌دارها» - بدون قید به هیچ دسته/برند/خودرو خاصی (برخلاف
| /category, /brand, /vehicle که هرکدوم یه بُعد رو قفل می‌کنن). فقط
| is_discounted همیشه true ـه (fixedIsDiscounted روی ProductGridWithLoadMore).
| بقیه‌ی فیلترها (دسته‌بندی، برند، خودرو، قیمت) کاملاً آزادن.
*/

export const metadata = {
  title: "تخفیف‌دارها | یدکی",
};

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

export default async function SpecialOffersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const [categories, brands, vehicleOptions, vehicleBrandImages] =
    await Promise.all([
      getCategories(),
      getBrands(),
      getVehicleFilterOptions(),
      getVehicleBrandImages(),
    ]);

  const queryString = buildQueryString({
    ...Object.fromEntries(
      Object.entries(sp).filter(([key]) => key.startsWith("attr_"))
    ),
    category_id: sp.category_id,
    brand_id: sp.brand_id,
    vehicle_brand: sp.vehicle_brand,
    vehicle_model: sp.vehicle_model,
    stock_status: sp.stock_status,
    min_rating: sp.min_rating,
    min_price: sp.min_price,
    max_price: sp.max_price,
    is_available: sp.is_available,
    is_discounted: "1", // ⚠️ همیشه قفل - این خودِ نکته‌ی این صفحه‌ست
    sort: sp.sort,
    per_page: sp.per_page || "12",
    page: "1",
  });

  const products = await getProducts(queryString, 10);
  const basePath = "/special-offers";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <LocalOfferIcon sx={{ color: "accent.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          تخفیف‌دارها
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        <FilterSidebar
          categories={categories}
          brands={brands}
          vehicleBrandOptions={vehicleOptions.brands}
          vehicleModelOptions={vehicleOptions.models}
          vehicleBrandImages={vehicleBrandImages}
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
                vehicleBrandOptions={vehicleOptions.brands}
                vehicleModelOptions={vehicleOptions.models}
                vehicleBrandImages={vehicleBrandImages}
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
            fixedIsDiscounted={true}
            basePath={basePath}
            showCategoryFilter={true}
          />
        </Box>
      </Box>
    </Container>
  );
}
