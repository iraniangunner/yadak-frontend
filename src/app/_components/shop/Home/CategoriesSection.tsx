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
| سطح ۱ به بعد (parent_id داره - یعنی نه ریشه/سطح ۰) که «مؤثراً» محصول
| دارن - چه خودش مستقیم (برگ)، چه از طریق زیرمجموعه‌هاش (سطح میانی
| توی ساختار ۳سطحی).
*/
type Category = Awaited<ReturnType<typeof getCategories>>[number];

// Fisher-Yates - بدون تغییر آرایه‌ی اصلی (immutable)
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// آیا این دسته «مؤثراً» محصول داره؟ برای برگ‌ها یعنی خودش مستقیم؛ برای
// سطح‌های میانی یعنی حداقل یکی از زیرمجموعه‌هاش (به هر عمقی، بازگشتی)
// محصول داشته باشه.
function hasEffectiveProducts(
  category: Category,
  allCategories: Category[]
): boolean {
  if (category.products_count > 0) return true;
  return allCategories.some(
    (c) => c.parent_id === category.id && hasEffectiveProducts(c, allCategories)
  );
}

export function CategoriesSection({ categories }: { categories: Category[] }) {
  // فقط سطح ۱ به بعد (نه ریشه/سطح ۰) + مؤثراً محصول داره
  const level1Plus = categories.filter(
    (c) => c.parent_id !== null && hasEffectiveProducts(c, categories)
  );
  const selected = shuffle(level1Plus).slice(0, 24);

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
