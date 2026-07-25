import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { getVehicles } from "@/lib/serverApi";
import { VehicleFinderWidget } from "./VehicleFinderWidget";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/VehicleFinderSection.tsx
|--------------------------------------------------------------------------
| ⚠️ قبلاً یه گرید کامل از همه‌ی دسته‌بندی‌ها («یا از دسته‌بندی انتخاب
| کنید») هم اینجا بود که چون CategoriesSection.tsx (جدا، با محدودیت
| ۱۲ تا) الان همین کار رو می‌کنه، تکراری بود - حذف شد. این کامپوننت
| الان فقط مسئول فرم جستجوی برند/مدل خودروئه.
*/
type Vehicle = Awaited<ReturnType<typeof getVehicles>>[number];

export function VehicleFinderSection({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <Container maxWidth="lg" sx={{ mt: -2, mb: 6 }}>
      <Box
        sx={{
          bgcolor: "primary.main",
          borderRadius: 6,
          p: { xs: 3, md: 5 },
          color: "#fff",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, textAlign: "center", mb: 3 }}
        >
          قطعه‌ی خودروتون رو پیدا کنید
        </Typography>

        <Box sx={{ maxWidth: 640, mx: "auto" }}>
          <VehicleFinderWidget vehicles={vehicles} />
        </Box>
      </Box>
    </Container>
  );
}
