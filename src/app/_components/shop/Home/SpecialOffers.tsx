import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { ArrowBackIos } from "@mui/icons-material";
import { ProductCard } from "@/app/_components/shop/ProductCard";
import type { getProducts } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/SpecialOffers.tsx
|--------------------------------------------------------------------------
*/
type Product = Awaited<ReturnType<typeof getProducts>>["data"][number];

export function SpecialOffers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "accent.main", fontWeight: 700, letterSpacing: 1.5 }}
          >
            امروز
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            پیشنهادهای ویژه
          </Typography>
        </Box>
        <Button
          component={NextLink}
          href="/products"
          endIcon={<ArrowBackIos sx={{ fontSize: "0.8rem" }} />}
        >
          مشاهده‌ی همه
        </Button>
      </Box>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {products.map((product) => (
          <Box key={product.id} sx={{ flex: "1 1 200px", maxWidth: 240 }}>
            <ProductCard product={product} />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
