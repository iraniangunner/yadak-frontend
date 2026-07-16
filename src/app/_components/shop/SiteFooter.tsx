import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/SiteFooter.tsx
|--------------------------------------------------------------------------
*/

export function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        mt: 8,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ justifyContent: "space-between", gap: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} یدکی — فروشگاه اینترنتی قطعات خودرو
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box
              component={NextLink}
              href="/products"
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              محصولات
            </Box>
            <Box
              component={NextLink}
              href="/articles"
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              مقالات
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
