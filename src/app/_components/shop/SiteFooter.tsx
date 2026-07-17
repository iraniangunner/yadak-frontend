import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { getCategories } from "@/lib/serverApi";
import { Instagram, Telegram, Twitter, WhatsApp } from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/SiteFooter.tsx
|--------------------------------------------------------------------------
*/

export async function SiteFooter() {
  const categories = await getCategories();
 
  return (
    <Box component="footer" sx={{ bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", mt: 4 }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 4 }}>
          {/* درباره‌ی برند */}
          <Box sx={{ flex: "2 1 240px" }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "primary.main", mb: 1 }}>
              یدکی
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 320 }}>
              فروشگاه اینترنتی تخصصی قطعات یدکی خودرو - قطعات اصلی، گارانتی‌دار، با ارسال سریع به سراسر کشور.
            </Typography>
            <Stack direction="row" spacing={1}>
              {[Telegram, Instagram, WhatsApp, Twitter].map((Icon, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    bgcolor: "background.default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
              ))}
            </Stack>
          </Box>
 
          {/* لینک‌های مهم */}
          <Box sx={{ flex: "1 1 160px" }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>لینک‌های مهم</Typography>
            <Stack spacing={1}>
              <FooterLink href="/articles">مقالات</FooterLink>
              <FooterLink href="/products">محصولات</FooterLink>
              <FooterLink href="/about">درباره‌ی ما</FooterLink>
              <FooterLink href="/contact">تماس با ما</FooterLink>
            </Stack>
          </Box>
 
          {/* دسته‌بندی‌ها */}
          {categories.length > 0 && (
            <Box sx={{ flex: "1 1 160px" }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>دسته‌بندی محصولات</Typography>
              <Stack spacing={1}>
                {categories.slice(0, 5).map((category) => (
                  <FooterLink key={category.id} href={`/products?category_id=${category.id}`}>
                    {category.name}
                  </FooterLink>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
 
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} یدکی — تمامی حقوق محفوظ است
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
 
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Box
      component={NextLink}
      href={href}
      sx={{ color: "text.secondary", fontSize: "0.875rem", textDecoration: "none", "&:hover": { color: "primary.main" } }}
    >
      {children}
    </Box>
  );
}
