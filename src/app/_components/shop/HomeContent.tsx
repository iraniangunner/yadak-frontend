import Box from "@mui/material/Box";
import {
  getCategories,
  getBrands,
  getBanners,
  getProducts,
  getArticles,
  getVehicles,
  getVehicleFilterOptions,
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
import { TrustFeatures } from "./home/TrustFeatures";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/HomeContent.tsx
|--------------------------------------------------------------------------
| Server Component async - فقط fetch داده و ارکستراسیونِ کامپوننت‌های
| بخش‌بندی‌شده‌ی زیرِ پوشه‌ی Home/.
|
| VehicleBrandsSection («خودروها») - فقط لوگوی برند خودرو، مثل سایت
| مرجع - نه مدل خاص.
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
    vehicleOptions,
    vehicleBrandImages,
  ] = await Promise.all([
    getCategories(),
    getBrands(),
    getBanners(),
    getProducts("per_page=20", 60),
    getProducts("per_page=10&sort=best_selling", 60),
    getArticles(6),
    getVehicles(),
    getVehicleFilterOptions(),
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
      <VehicleBrandsSection
        vehicleOptions={vehicleOptions}
        vehicleBrandImages={vehicleBrandImages}
      />
      <IntroText />
      <SpecialOffers products={discountedProducts} />
      <FeaturedBanner banners={banners} />
      <BestSellers products={bestSellers.data} />
      <TipsSection articles={articles} />
      {/* <TrustFeatures /> */}
    </Box>
  );
}
