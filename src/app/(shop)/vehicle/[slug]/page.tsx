import { notFound } from "next/navigation";
import NextLink from "next/link";
import { NavigateBefore, DirectionsCar } from "@mui/icons-material";
import {
  getCategories,
  getBrands,
  getProducts,
  getVehicleFilterOptions,
  getVehicleBrandImages,
  getVehiclesByBrand,
  getVehicleByModel,
} from "@/lib/serverApi";
import { FilterSidebar } from "@/app/_components/shop/products/FilterSidebar";
import { MobileFilterButton } from "@/app/_components/shop/products/MobileFilterButton";
import { SortAndPerPageControls } from "@/app/_components/shop/products/SortAndPerPageControls";
import { ActiveFilterChips } from "@/app/_components/shop/products/ActiveFilterChips";
import { ProductGridWithLoadMore } from "@/app/_components/shop/products/ProductGridWithLoadMore";
import { VehicleModelGallery } from "@/app/_components/shop/products/VehicleModelGallery";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/vehicle/[slug]/page.tsx
|--------------------------------------------------------------------------
| ⚠️ این یه مسیر واحده که هم برند خودرو هم مدل رو پوشش می‌ده - چون
| Next.js اجازه نمی‌ده هم‌زمان /vehicle/[brand] و /vehicle/[model] جدا
| تعریف بشن (تناقض routing).
|
| تشخیص نوع اسلاگ:
|   - اگه با پیشوند "لوازم-یدکی-" شروع بشه → صفحه‌ی مستقل یه مدل خاص
|     (مثلاً /vehicle/لوازم-یدکی-تیبا) - برند خودش از روی دیتابیس
|     پیدا می‌شه، توی آدرس نمیاد.
|   - در غیر این صورت → صفحه‌ی کل یه برند (مثلاً /vehicle/سایپا)
*/

const MODEL_SLUG_PREFIX = "لوازم-یدکی-";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  if (decoded.startsWith(MODEL_SLUG_PREFIX)) {
    const modelName = decoded.slice(MODEL_SLUG_PREFIX.length);
    return { title: `لوازم یدکی ${modelName} | یدکی` };
  }

  return { title: `قطعات ${decoded} | یدکی` };
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

export default async function VehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const decoded = decodeURIComponent(slug);
  const isModelPage = decoded.startsWith(MODEL_SLUG_PREFIX);

  // ------------------------------------------------------------------
  // حالت ۱: صفحه‌ی یه مدل خاص («لوازم یدکی تیبا») - برند خودش از
  // دیتابیس پیدا می‌شه، اسکوپ روی برند+مدل هردو.
  // ------------------------------------------------------------------
  if (isModelPage) {
    const modelName = decoded.slice(MODEL_SLUG_PREFIX.length);
    const vehicle = await getVehicleByModel(modelName);

    if (!vehicle) {
      notFound();
    }

    const vehicleBrandName = vehicle.brand;

    const [categories, brands, vehicleBrandImages] = await Promise.all([
      getCategories({
        vehicleBrand: vehicleBrandName,
        vehicleModel: modelName,
      }),
      getBrands(undefined, {
        vehicleBrand: vehicleBrandName,
        vehicleModel: modelName,
      }),
      getVehicleBrandImages(),
    ]);
    const brandImage = vehicleBrandImages.find(
      (v) => v.name === vehicleBrandName
    );

    const queryString = buildQueryString({
      ...Object.fromEntries(
        Object.entries(sp).filter(([key]) => key.startsWith("attr_"))
      ),
      vehicle_brand: vehicleBrandName,
      vehicle_model: modelName,
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
    const basePath = `/vehicle/${slug}`;

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs
          separator={<NavigateBefore fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Box
            component={NextLink}
            href="/"
            sx={{ color: "text.secondary", textDecoration: "none" }}
          >
            خانه
          </Box>
          <Box
            component={NextLink}
            href={`/vehicle/${encodeURIComponent(vehicleBrandName)}`}
            sx={{ color: "text.secondary", textDecoration: "none" }}
          >
            {vehicleBrandName}
          </Box>
          <Typography color="text.primary">{modelName}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Avatar
            variant="rounded"
            src={brandImage?.thumbnail_url || undefined}
            sx={{ width: 40, height: 40, bgcolor: "background.default" }}
          >
            <DirectionsCar fontSize="small" />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            لوازم یدکی {modelName}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          <FilterSidebar
            categories={categories}
            brands={brands}
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
              fixedVehicleModel={modelName}
              basePath={basePath}
              showCategoryFilter={true}
            />
          </Box>
        </Box>
      </Container>
    );
  }

  // ------------------------------------------------------------------
  // حالت ۲: صفحه‌ی کل یه برند خودرو («سایپا») - همون رفتار قبلی.
  // ------------------------------------------------------------------
  const vehicleBrandName = decoded;

  const [categories, brands, vehicleOptions, vehicleBrandImages, brandModels] =
    await Promise.all([
      getCategories({ vehicleBrand: vehicleBrandName }),
      getBrands(undefined, { vehicleBrand: vehicleBrandName }),
      getVehicleFilterOptions(undefined, undefined, vehicleBrandName),
      getVehicleBrandImages(),
      getVehiclesByBrand(vehicleBrandName),
    ]);
  const brandImage = vehicleBrandImages.find(
    (v) => v.name === vehicleBrandName
  );

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
  const basePath = `/vehicle/${slug}`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        separator={<NavigateBefore fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Box
          component={NextLink}
          href="/"
          sx={{ color: "text.secondary", textDecoration: "none" }}
        >
          خانه
        </Box>
        <Typography color="text.primary">{vehicleBrandName}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Avatar
          variant="rounded"
          src={brandImage?.thumbnail_url || undefined}
          sx={{ width: 40, height: 40, bgcolor: "background.default" }}
        >
          <DirectionsCar fontSize="small" />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          قطعات مناسب {vehicleBrandName}
          {sp.vehicle_model && ` ${sp.vehicle_model}`}
        </Typography>
      </Box>

      <VehicleModelGallery brand={vehicleBrandName} models={brandModels} />

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
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
