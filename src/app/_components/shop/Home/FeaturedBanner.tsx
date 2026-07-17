import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { ArrowForward } from "@mui/icons-material";
import type { getBanners } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/FeaturedBanner.tsx
|--------------------------------------------------------------------------
*/
type Banner = Awaited<ReturnType<typeof getBanners>>[number];

export function FeaturedBanner({ banner }: { banner?: Banner }) {
  if (!banner) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexWrap: "wrap",
          bgcolor: "background.paper",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "rgba(15,23,42,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <Box
          component="img"
          src={banner.image_url || undefined}
          alt={banner.title}
          sx={{
            width: { xs: "100%", md: 320 },
            height: { xs: 180, md: 260 },
            objectFit: "cover",
            display: "block",
          }}
        />
        <Box sx={{ p: { xs: 3, md: 0 }, flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
            {banner.title}
          </Typography>
          <Button
            component={NextLink}
            href={
              banner.product
                ? `/products/${banner.product.slug}`
                : banner.link_url || "#"
            }
            variant="contained"
            disableElevation
            startIcon={<ArrowForward sx={{ transform: "scaleX(-1)" }} />}
          >
            مشاهده‌ی محصول
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
