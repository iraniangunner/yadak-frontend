import NextLink from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import type { getVehicles } from "@/lib/serverApi";
import { CardCarousel } from "../home/CardCarousel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/CategoryVehicleGallery.tsx
|--------------------------------------------------------------------------
| گالری مدل‌های خودرو - بالای صفحه‌ی /category/[slug]، فقط مدل‌هایی که
| واقعاً توی همین دسته محصول دارن. کلیک روی هرکدوم، فیلتر مدل خودرو رو
| مستقیم روی همین صفحه‌ی دسته اعمال می‌کنه (query param، نه ناوبری به
| صفحه‌ی دیگه) - و متن هر کارت «[اسم دسته] [مدل]» ـه (مثلاً «فیلتر
| روغن پراید»)، نه فقط اسم مدل تنها.
*/
type Vehicle = Awaited<ReturnType<typeof getVehicles>>[number];

// فقط برای این برندها اسم برند هم توی متن کارت نشون داده می‌شه (چون
// اسم مدل به‌تنهایی ممکنه گمراه‌کننده باشه، مثلاً «۲۰۶» بدون «پژو»).
// بقیه‌ی برندها (سایپا، ایران‌خودرو، هیوندای، سیتروئن و...) فقط با
// اسم مدل تنها نمایش داده می‌شن.
const BRANDS_WITH_LABEL = ["پژو", "جک"];

export function CategoryVehicleGallery({
  vehicles,
  categoryName,
  categorySlug,
}: {
  vehicles: Vehicle[];
  categoryName: string;
  categorySlug: string;
}) {
  if (vehicles.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <CardCarousel>
        {vehicles.map((vehicle) => {
          const showBrand = BRANDS_WITH_LABEL.includes(vehicle.brand);
          const label = showBrand
            ? `${categoryName} ${vehicle.brand} ${vehicle.model}`
            : `${categoryName} ${vehicle.model}`;

          return (
            <Box
              key={vehicle.id}
              component={NextLink}
              href={`/vehicle/${encodeURIComponent(
                `${categorySlug}-${vehicle.model}`
              )}`}
              sx={{
                width: 100,
                textDecoration: "none",
                color: "text.primary",
                display: "block",
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  p: 1.25,
                  mb: 0.75,
                  transition: "border-color .15s",
                  "&:hover": { borderColor: "accent.main" },
                }}
              >
                {vehicle.thumbnail_url ? (
                  <Box
                    component="img"
                    src={vehicle.thumbnail_url}
                    alt={vehicle.model}
                    sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <DirectionsCar
                    sx={{ fontSize: 32, color: "text.disabled" }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  textAlign: "center",
                  display: "block",
                  lineHeight: 1.3,
                }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </CardCarousel>
    </Box>
  );
}
