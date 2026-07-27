import { notFound } from "next/navigation";
import {
  getCategories,
  getBrands,
  getProducts,
  getVehicleFilterOptions,
  getVehicleBrandImages,
  getFilterableAttributes,
  findCategoryBySlug,
  getCategoryAndDescendantIds,
  getDirectChildren,
} from "@/lib/serverApi";
import { FilterSidebar } from "@/app/_components/shop/products/FilterSidebar";
import { MobileFilterButton } from "@/app/_components/shop/products/MobileFilterButton";
import { SortAndPerPageControls } from "@/app/_components/shop/products/SortAndPerPageControls";
import { ActiveFilterChips } from "@/app/_components/shop/products/ActiveFilterChips";
import { ProductGridWithLoadMore } from "@/app/_components/shop/products/ProductGridWithLoadMore";
import { SubcategoryGallery } from "@/app/_components/shop/products/SubcategoryGallery";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/category/[slug]/page.tsx
|--------------------------------------------------------------------------
| صفحه‌ی مخصوص یه دسته‌بندی - فیلتر «دسته‌بندی» نشون داده نمی‌شه (خودِ
| صفحه قفل‌شده روی همین یه دسته‌ست). جعبه‌ی جستجو دیگه اینجا نیست - فقط
| توی هدر (طبق تصمیم اخیر).
|
| ⚠️ اگه این دسته زیرمجموعه داشته باشه (مثلاً «قطعات موتور»)، بالای
| فیلتر یه گالری از زیردسته‌ها (با عکس) نشون داده می‌شه.
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const categories = await getCategories();
  const category = findCategoryBySlug(categories, decodedSlug);

  return {
    title: category ? `${category.name} | یدکی` : "دسته‌بندی پیدا نشد | یدکی",
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const sp = await searchParams;

  const categories = await getCategories();

  const category = findCategoryBySlug(categories, decodedSlug);

  if (!category) {
    notFound();
  }

  const categoryIds = getCategoryAndDescendantIds(categories, category.id);
  const directChildren = getDirectChildren(categories, category.id);
  const [brands, vehicleOptions, filterableAttributes, vehicleBrandImages] =
    await Promise.all([
      getBrands(categoryIds),
      getVehicleFilterOptions(categoryIds),
      getFilterableAttributes(categoryIds),
      getVehicleBrandImages(),
    ]);

  const queryString = buildQueryString({
    ...Object.fromEntries(
      Object.entries(sp).filter(([key]) => key.startsWith("attr_"))
    ),
    category_id: categoryIds.join(","),
    vehicle_brand: sp.vehicle_brand,
    vehicle_model: sp.vehicle_model,
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
  const basePath = `/category/${slug}`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {category.name}
      </Typography>

      <SubcategoryGallery children={directChildren} />

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        <FilterSidebar
          categories={categories}
          brands={brands}
          vehicleBrandOptions={vehicleOptions.brands}
          vehicleModelOptions={vehicleOptions.models}
          vehicleBrandImages={vehicleBrandImages}
          filterableAttributes={filterableAttributes}
          attributeCategoryIds={categoryIds}
          showCategoryFilter={false}
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
                filterableAttributes={filterableAttributes}
                attributeCategoryIds={categoryIds}
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
