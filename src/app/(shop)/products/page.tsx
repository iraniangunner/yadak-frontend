import {
  getCategories,
  getBrands,
  getProducts,
  getVehicles,
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
| مسیر فایل: src/app/(shop)/products/page.tsx
|--------------------------------------------------------------------------
| Server Component async - صفحه‌ی اول محصولات مستقیم سمت سرور (SSR) fetch
| می‌شه؛ فقط تعامل‌های بعدی (فیلتر، مرتب‌سازی، نمایش بیشتر) کلاینتی‌ان.
| هر بخش (سایدبار، دکمه‌ی فیلتر موبایل، Toolbar، چیپ‌ها، گرید) یه
| کامپوننت کوچیک مجزاست.
*/

export const metadata = {
  title: "محصولات | یدکی",
};

function buildQueryString(sp: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(sp).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const queryString = buildQueryString({
    search: sp.search,
    vehicle_id: sp.vehicle_id,
    category_id: sp.category_id,
    brand_id: sp.brand_id,
    stock_status: sp.stock_status,
    min_rating: sp.min_rating,
    sort: sp.sort,
    per_page: sp.per_page || "12",
    page: "1",
  });

  const [categories, brands, vehicles, products] = await Promise.all([
    getCategories(),
    getBrands(),
    getVehicles(),
    // per_page/sort/filter عوض می‌شن، پس این fetch نباید طولانی کش بشه
    getProducts(queryString, 10),
  ]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        محصولات
      </Typography>
      {sp.search && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          نتایج جستجو برای «{sp.search}»
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        <FilterSidebar
          categories={categories}
          brands={brands}
          vehicles={vehicles}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ProductSearchBar />
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
              />
              <Box sx={{ ml: "auto" }}>
                <SortAndPerPageControls />
              </Box>
            </Box>

            <ActiveFilterChips
              categories={categories}
              brands={brands}
              vehicles={vehicles}
            />
          </Box>

          <ProductGridWithLoadMore
            initialProducts={products.data}
            initialTotal={products.total}
            initialLastPage={products.lastPage}
          />
        </Box>
      </Box>
    </Container>
  );
}
