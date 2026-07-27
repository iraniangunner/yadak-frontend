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
| «خرید بر اساس دسته‌بندی» - آیکون گرد بالا، اسم پایین. برخلاف قبل که
| فقط دسته‌های سطح بالا رو نشون می‌داد، الان یه ترکیب تصادفی از هر دو
| سطح (والد + زیردسته) - نه همه‌شون، فقط یه تعداد معقول.
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

export function CategoriesSection({ categories }: { categories: Category[] }) {
  // هم والدها هم زیردسته‌ها - همه با هم قاطی، فقط یه انتخاب تصادفی از کل
  const selected = shuffle(categories).slice(0, 24);

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
