import Box from "@mui/material/Box";
import {
  getCategories,
  getBrands,
  getBanners,
  getProducts,
  getArticles,
  getVehicles,
} from "@/lib/serverApi";
import { Hero } from "./Home/Hero";
import { VehicleFinderSection } from "./Home/VehicleFinderSection";
import { IntroText } from "./Home/IntroText";
import { SpecialOffers } from "./Home/SpecialOffers";
import { FeaturedBanner } from "./Home/FeaturedBanner";
import { BestSellers } from "./Home/BestSellers";
import { BrandsSection } from "./Home/BrandsSection";
import { TipsSection } from "./Home/TipsSection";
import { TrustFeatures } from "./Home/TrustFeatures";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/HomeContent.tsx
|--------------------------------------------------------------------------
| Server Component async - فقط fetch داده و ارکستراسیونِ کامپوننت‌های
| بخش‌بندی‌شده‌ی زیرِ پوشه‌ی Home/.
*/
export async function HomeContent() {
  const [categories, brands, banners, discounted, bestSellers, articles, vehicles] = await Promise.all([
    getCategories(),
    getBrands(),
    getBanners(),
    getProducts("per_page=20", 60),
    getProducts("per_page=10&sort=best_selling", 60),
    getArticles(6),
    getVehicles(),
  ]);

  const discountedProducts = discounted.data
    .filter((p) => p.compare_price && p.compare_price > p.final_price)
    .slice(0, 3);

  return (
    <Box sx={{ bgcolor: "#F8FAFC" }}>
      <Hero productCount={discounted.total} />
      <VehicleFinderSection vehicles={vehicles} categories={categories} />
      <IntroText />
      <SpecialOffers products={discountedProducts} />
      <FeaturedBanner banners={banners} />
      <BestSellers products={bestSellers.data} />
      <BrandsSection brands={brands} />
      <TipsSection articles={articles} />
      {/* <TrustFeatures /> */}
    </Box>
  );
}