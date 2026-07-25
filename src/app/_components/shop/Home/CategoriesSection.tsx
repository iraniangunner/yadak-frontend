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
| «خرید بر اساس دسته‌بندی» - فقط چند تای اول (نه همه‌ی دسته‌ها)، هرکدوم
| با عکسِ خودِ دسته. فقط دسته‌های سطح بالا (parent_id=null) نشون داده
| می‌شن - چون زیردسته‌ها روی هومپیج معنی نداره، همون‌جا توی صفحه‌ی خودِ
| دسته‌ی والد قابل انتخابن.
*/
type Category = Awaited<ReturnType<typeof getCategories>>[number];

export function CategoriesSection({ categories }: { categories: Category[] }) {
  const topLevel = categories.filter((c) => !c.parent_id).slice(0, 12);

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
          gap: 2,
          justifyContent: "center",
        }}
      >
        {topLevel.map((category) => (
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
              transition: "transform .15s",
              "&:hover": { transform: "translateY(-3px)" },
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
    </Container>
  );
}
