import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import type { getCategories, getVehicles } from "@/lib/serverApi";
import { VehicleFinderWidget } from "./VehicleFinderWidget";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/VehicleFinderSection.tsx
|--------------------------------------------------------------------------
| اگه lib/serverApi.ts تایپ‌های export‌شده (مثل Category, ServerVehicle) داره،
| بهتره به‌جای این الگو مستقیم همونا رو import کنی.
*/
type Category = Awaited<ReturnType<typeof getCategories>>[number];
type Vehicle = Awaited<ReturnType<typeof getVehicles>>[number];

export function VehicleFinderSection({
  vehicles,
  categories,
}: {
  vehicles: Vehicle[];
  categories: Category[];
}) {
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

        <Box
          sx={{ maxWidth: 640, mx: "auto", mb: categories.length > 0 ? 5 : 0 }}
        >
          <VehicleFinderWidget vehicles={vehicles} />
        </Box>

        {categories.length > 0 && (
          <>
            <Typography sx={{ fontWeight: 700, textAlign: "center", mb: 2.5 }}>
              یا از دسته‌بندی انتخاب کنید
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "center",
              }}
            >
              {categories.map((category) => (
                <Box
                  key={category.id}
                  component={NextLink}
                  href={`/category/${category.slug}`}
                  sx={{
                    width: 130,
                    textDecoration: "none",
                    color: "text.primary",
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    p: 2,
                    textAlign: "center",
                    border: "1px solid transparent",
                    transition: "transform .15s, border-color .15s",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: "accent.main",
                    },
                  }}
                >
                  <Avatar
                    variant="rounded"
                    src={category.thumbnail_url || undefined}
                    sx={{
                      width: 44,
                      height: 44,
                      mx: "auto",
                      mb: 1,
                      bgcolor: "rgba(30,58,138,0.08)",
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
