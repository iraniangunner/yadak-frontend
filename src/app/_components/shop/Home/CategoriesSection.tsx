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
| «خرید بر اساس دسته‌بندی» - آیکون گرد بالا، اسم پایین. فقط دسته‌های
| «برگ» (بدون هیچ زیرمجموعه‌ای، در هر سطحی که باشن) که واقعاً محصول
| فعال مستقیم دارن - مسیر سریع و مستقیم به محصول، بدون نیاز به
| ناوبری بیشتر.
*/
type Category = Awaited<ReturnType<typeof getCategories>>[number];

export function CategoriesSection({ categories }: { categories: Category[] }) {
  // برگ = هیچ دسته‌ی دیگه‌ای parent_id ـش به این اشاره نکنه (در هر سطحی)
  const isLeaf = (category: Category) =>
    !categories.some((c) => c.parent_id === category.id);

  // ترتیب ثابت (همون ترتیبی که از بک‌اند میاد، بر اساس sort_order) -
  // نه تصادفی؛ هر بار رفرش، همون‌چیز رو نشون می‌ده.
  const leaves = categories.filter((c) => isLeaf(c) && c.products_count > 0);
  const selected = leaves.slice(0, 12);

  if (selected.length === 0) return null;

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
        {selected.map((category) => (
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
