import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Storefront from "@mui/icons-material/Storefront";
import type { getBrands } from "@/lib/serverApi";
import { CardCarousel } from "./CardCarousel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/BrandsSection.tsx
|--------------------------------------------------------------------------
| «خرید بر اساس برند» - دقیقاً مثل سایت مرجع: خودِ کارت فقط لوگو (مربع
| سفید تمام‌عرض)، اسم برند جدا و بیرون از کارت، زیرش.
*/
type Brand = Awaited<ReturnType<typeof getBrands>>[number];

export function BrandsSection({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
      >
        خرید بر اساس برند
      </Typography>
      <CardCarousel>
        {brands.map((brand) => (
          <Box
            key={brand.id}
            component={NextLink}
            href={`/brand/${brand.slug}`}
            sx={{
              width: 130,
              textDecoration: "none",
              color: "text.primary",
              display: "block",
            }}
          >
            {/* کارت - فقط لوگو، مربع، بدون پدینگ اضافه */}
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
                <Storefront sx={{ fontSize: 40, color: "text.disabled" }} />
              )}
            </Box>

            {/* اسم - بیرون از کارت، زیرش */}
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, textAlign: "center" }}
            >
              {brand.name}
            </Typography>
          </Box>
        ))}
      </CardCarousel>
    </Container>
  );
}
