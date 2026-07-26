import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import type { getVehicleBrandImages } from "@/lib/serverApi";
import { CardCarousel } from "./CardCarousel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/VehicleBrandsSection.tsx
|--------------------------------------------------------------------------
| «خودروها» - همه‌ی برندهای فعالِ جدول vehicle_brands رو نشون می‌ده،
| صرف‌نظر از اینکه الان محصولی براشون هست یا نه (خودِ صفحه‌ی
| /vehicle/[برند] اگه محصولی نباشه، پیام «محصولی پیدا نشد» نشون می‌ده).
*/
type VehicleBrand = Awaited<ReturnType<typeof getVehicleBrandImages>>[number];

export function VehicleBrandsSection({ vehicleBrands }: { vehicleBrands: VehicleBrand[] }) {
  if (vehicleBrands.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>
        خودروها
      </Typography>
      <CardCarousel>
        {vehicleBrands.map((brand) => (
          <Box
            key={brand.name}
            component={NextLink}
            href={`/vehicle/${encodeURIComponent(brand.name)}`}
            sx={{ width: 130, textDecoration: "none", color: "text.primary", display: "block" }}
          >
            <Box
              sx={{
                width: 130,
                height: 130,
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
              {brand.thumbnail_url ? (
                <Box
                  component="img"
                  src={brand.thumbnail_url}
                  alt={brand.name}
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <DirectionsCar sx={{ fontSize: 40, color: "text.disabled" }} />
              )}
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "center" }}>
              لوازم {brand.name}
            </Typography>
          </Box>
        ))}
      </CardCarousel>
    </Container>
  );
}