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
import { BrandsSection } from "./home/BrandsSection";
import { TipsSection } from "./home/TipsSection";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/HomeContent.tsx
|--------------------------------------------------------------------------
| Server Component async - فقط fetch داده و ارکستراسیونِ کامپوننت‌های
| بخش‌بندی‌شده‌ی زیرِ پوشه‌ی Home/.
|
| VehicleBrandsSection («خودروها») - همه‌ی برندهای فعالِ vehicle_brands،
| صرف‌نظر از اینکه الان محصولی دارن یا نه. دیگه به getVehicleFilterOptions
| نیازی نیست (اون فقط برای فیلتر صفحات دسته‌بندی/برند/خودروئه).
*/
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
    getBrands(),
    getBanners(),
    getProducts("per_page=20", 60),
    getProducts("per_page=10&sort=best_selling", 60),
    getArticles(6),
    getVehicles(),
    getVehicleBrandImages(),
  ]);

  const discountedProducts = discounted.data
    .filter((p) => p.compare_price && p.compare_price > p.final_price)
    .slice(0, 3);

  return (
    <Box sx={{ bgcolor: "#F8FAFC" }}>
      <Hero productCount={discounted.total} />
      <VehicleFinderSection vehicles={vehicles} />
      <CategoriesSection categories={categories} />
      <BrandsSection brands={brands} />
      <VehicleBrandsSection vehicleBrands={vehicleBrands} />
      <IntroText />
      <SpecialOffers products={discountedProducts} />
      <FeaturedBanner banners={banners} />
      <BestSellers products={bestSellers.data} />
      <TipsSection articles={articles} />
    </Box>
  );
}
