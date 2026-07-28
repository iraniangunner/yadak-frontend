import Box from "@mui/material/Box";
import {
  getCategories,
  getBrands,
  getBanners,
  getProducts,
  getArticles,
  getVehicles,
  getVehicleBrandImages,
} from "@/lib/serverApi";
import { Hero } from "./home/Hero";
import { VehicleFinderSection } from "./home/VehicleFinderSection";
import { CategoriesSection } from "./home/CategoriesSection";
import { VehicleBrandsSection } from "./home/VehicleBrandsSection";
import { IntroText } from "./home/IntroText";
import { SpecialOffers } from "./home/SpecialOffers";
import { FeaturedBanner } from "./home/FeaturedBanner";
import { BestSellers } from "./home/BestSellers";
import { NewestProductsSection } from "./home/NewestProductsSection";
import { BrandsSection } from "./home/BrandsSection";
import { TipsSection } from "./home/TipsSection";
import { StaticCategoryBanners } from "./home/StaticCategoryBanners";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/HomeContent.tsx
|--------------------------------------------------------------------------
| ⚠️ دو بخش «جدیدترین‌ها» (روغن موتور و پژو) اضافه شدن. چون فعلاً سیستم
| «دسته/برند خودروی ویژه» نداریم، اسم دسته و برند خودرو مستقیم پایین
| همین فایل هاردکد شده - اگه بعداً خواستید عوضش کنید، فقط همین دو ثابت
| (FEATURED_CATEGORY_NAME و FEATURED_VEHICLE_BRAND) رو تغییر بدید.
*/

const FEATURED_CATEGORY_NAME = "روغن موتور";
const FEATURED_VEHICLE_BRAND = "پژو";

export async function HomeContent() {
  const [
    categories,
    brands,
    banners,
    discounted,
    bestSellers,
    articles,
    vehicles,
    vehicleBrands,
  ] = await Promise.all([
    getCategories(),
    getBrands(undefined, undefined, true),
    getBanners(),
    getProducts("per_page=20", 60),
    getProducts("per_page=10&sort=best_selling", 60),
    getArticles(6),
    getVehicles(),
    getVehicleBrandImages(true),
  ]);

  const discountedProducts = discounted.data
    .filter((p) => p.compare_price && p.compare_price > p.final_price)
    .slice(0, 3);

  // دسته‌ی مشخص‌شده رو از روی اسم پیدا کن (اگه پیدا نشد، بخش نمایش داده نمی‌شه)
  const featuredCategory = categories.find(
    (c) => c.name === FEATURED_CATEGORY_NAME
  );

  const [newestInCategory, newestByVehicleBrand] = await Promise.all([
    featuredCategory
      ? getProducts(
          `category_id=${featuredCategory.id}&sort=newest&per_page=10`,
          60
        )
      : Promise.resolve({ data: [], total: 0, lastPage: 1, currentPage: 1 }),
    getProducts(
      `vehicle_brand=${encodeURIComponent(
        FEATURED_VEHICLE_BRAND
      )}&sort=newest&per_page=10`,
      60
    ),
  ]);

  return (
    <Box sx={{ bgcolor: "#F8FAFC" }}>
      <Hero banners={banners} />
      <VehicleFinderSection vehicles={vehicles} />
      <SpecialOffers products={discountedProducts} />
      <StaticCategoryBanners />
      <CategoriesSection categories={categories} />
      <BrandsSection brands={brands} />
      <VehicleBrandsSection vehicleBrands={vehicleBrands} />
      <IntroText />
      {featuredCategory && (
        <NewestProductsSection
          overline="تازه‌ها"
          title={`جدیدترین‌های ${FEATURED_CATEGORY_NAME}`}
          products={newestInCategory.data}
          viewAllHref={`/category/${featuredCategory.slug}?sort=newest`}
        />
      )}

      <NewestProductsSection
        overline="تازه‌ها"
        title={`جدیدترین‌های ${FEATURED_VEHICLE_BRAND}`}
        products={newestByVehicleBrand.data}
        viewAllHref={`/vehicle/${encodeURIComponent(
          FEATURED_VEHICLE_BRAND
        )}?sort=newest`}
      />

      <TipsSection articles={articles} />
    </Box>
  );
}
