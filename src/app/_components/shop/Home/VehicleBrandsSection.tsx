import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import type {
  getVehicleFilterOptions,
  getVehicleBrandImages,
} from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/VehicleBrandsSection.tsx
|--------------------------------------------------------------------------
| «خودروها» - دقیقاً مثل بخش «خودروها»ی سایت مرجع: فقط لوگو/عکسِ برند
| خودرو (نه مدل خاص). کلیک روی هرکدوم می‌ره /vehicle/[برند].
*/
type VehicleOptions = Awaited<ReturnType<typeof getVehicleFilterOptions>>;
type VehicleBrandImage = Awaited<
  ReturnType<typeof getVehicleBrandImages>
>[number];

export function VehicleBrandsSection({
  vehicleOptions,
  vehicleBrandImages,
}: {
  vehicleOptions: VehicleOptions;
  vehicleBrandImages: VehicleBrandImage[];
}) {
  if (vehicleOptions.brands.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
      >
        خودروها
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
        }}
      >
        {vehicleOptions.brands.slice(0, 12).map((brandName) => {
          const image = vehicleBrandImages.find((v) => v.name === brandName);
          return (
            <Box
              key={brandName}
              component={NextLink}
              href={`/vehicle/${encodeURIComponent(brandName)}`}
              sx={{
                width: 140,
                height: 70,
                bgcolor: "background.paper",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                px: 2,
                textDecoration: "none",
                color: "text.primary",
                transition: "border-color .15s",
                "&:hover": { borderColor: "accent.main" },
              }}
            >
              <Avatar
                variant="rounded"
                src={image?.thumbnail_url || undefined}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "rgba(249,115,22,0.1)",
                  color: "accent.main",
                }}
              >
                <DirectionsCar fontSize="small" />
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {brandName}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}
