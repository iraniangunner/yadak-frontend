import NextLink from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import type { ServerVehicle } from "@/lib/serverApi";
import { CardCarousel } from "../home/CardCarousel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/VehicleModelGallery.tsx
|--------------------------------------------------------------------------
| گالری مدل‌ها - بالای صفحه‌ی /vehicle/[brand]، دقیقاً هم‌سبک با کاروسل‌های
| هومپیج (Embla): عکس بالا، «لوازم یدکی [مدل]» پایین.
*/
export function VehicleModelGallery({
  brand,
  models,
}: {
  brand: string;
  models: ServerVehicle[];
}) {
  if (models.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <CardCarousel>
        {models.map((vehicle) => (
          <Box
            key={vehicle.id}
            component={NextLink}
            href={`/vehicle/${encodeURIComponent(
              `لوازم-یدکی-${vehicle.model}`
            )}`}
            sx={{
              width: 110,
              textDecoration: "none",
              color: "text.primary",
              display: "block",
            }}
          >
            <Box
              sx={{
                width: 110,
                height: 110,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                p: 1.5,
                mb: 1,
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
                <DirectionsCar sx={{ fontSize: 36, color: "text.disabled" }} />
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
              لوازم یدکی {vehicle.model}
            </Typography>
          </Box>
        ))}
      </CardCarousel>
    </Box>
  );
}
