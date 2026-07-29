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
| واقعاً توی همین دسته محصول دارن. کلیک روی هرکدوم، صفحه‌ی مستقل دسته+مدل
| رو باز می‌کنه. متن هر کارت «[اسم دسته] [مدل]» ـه - همیشه فقط مدل،
| بدون اسم برند خودرو (عمداً برند نشون داده نمی‌شه).
*/
type Vehicle = Awaited<ReturnType<typeof getVehicles>>[number];

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
          const label = `${categoryName} ${vehicle.model}`;

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
