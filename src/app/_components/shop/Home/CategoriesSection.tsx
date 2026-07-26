import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import type { getCategories } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/CategoriesSection.tsx
|--------------------------------------------------------------------------
| «خرید بر اساس دسته‌بندی» - آیکون گرد بالا، اسم پایین (مطابق سایت
| مرجع). بدون کاروسل - گرید ساده‌ی چندردیفی، چون توی عکس مرجع فلش
| قبلی/بعدی نداشت (برخلاف برند/خودرو که کاروسل بودن).
*/
type Category = Awaited<ReturnType<typeof getCategories>>[number];

export function CategoriesSection({ categories }: { categories: Category[] }) {
  const topLevel = categories.filter((c) => !c.parent_id).slice(0, 20);

  if (topLevel.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
      >
        خرید بر اساس دسته‌بندی
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
        }}
      >
        {topLevel.map((category) => (
          <Box
            key={category.id}
            component={NextLink}
            href={`/category/${category.slug}`}
            sx={{
              width: 96,
              textDecoration: "none",
              color: "text.primary",
              textAlign: "center",
              transition: "transform .15s",
              "&:hover": { transform: "translateY(-3px)" },
            }}
          >
            <Avatar
              src={category.thumbnail_url || undefined}
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                mb: 1,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, lineHeight: 1.4 }}
            >
              {category.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
