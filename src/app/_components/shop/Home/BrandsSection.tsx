import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { getBrands } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/BrandsSection.tsx
|--------------------------------------------------------------------------
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
        برندهای مورد اعتماد
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
        }}
      >
        {brands.map((brand) => (
          <Box
            key={brand.id}
            sx={{
              width: 140,
              height: 70,
              bgcolor: "background.paper",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              transition: "border-color .15s",
              "&:hover": { borderColor: "accent.main" },
            }}
          >
            {brand.thumbnail_url ? (
              <Box
                component="img"
                src={brand.thumbnail_url}
                alt={brand.name}
                sx={{
                  maxWidth: "100%",
                  maxHeight: 36,
                  objectFit: "contain",
                  filter: "grayscale(1) opacity(0.55)",
                  transition: "filter .2s",
                  "&:hover": { filter: "none" },
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {brand.name}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Container>
  );
}
