import NextLink from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import type { ServerCategory } from "@/lib/serverApi";
import { CardCarousel } from "../home/CardCarousel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/SubcategoryGallery.tsx
|--------------------------------------------------------------------------
| گالری زیردسته‌ها - بالای صفحه‌ی /category/[slug]، دقیقاً هم‌سبک با
| کاروسل‌های هومپیج (Embla): عکس بالا، اسم پایین، کارت مربعی سفید.
| ⚠️ فقط زیردسته‌هایی که «مؤثراً» محصول دارن نشون داده می‌شن - چه خودشون
| مستقیم (برگ)، چه از طریق زیرمجموعه‌هاشون (سطح میانی توی ساختار
| ۳سطحی). برای همین allCategories (کل لیست) هم لازمه، نه فقط children.
*/

function hasEffectiveProducts(
  category: ServerCategory,
  allCategories: ServerCategory[]
): boolean {
  if (category.products_count > 0) return true;
  return allCategories.some(
    (c) => c.parent_id === category.id && hasEffectiveProducts(c, allCategories)
  );
}

export function SubcategoryGallery({
  children,
  allCategories,
}: {
  children: ServerCategory[];
  allCategories: ServerCategory[];
}) {
  const withProducts = children.filter((child) =>
    hasEffectiveProducts(child, allCategories)
  );

  if (withProducts.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <CardCarousel>
        {withProducts.map((child) => (
          <Box
            key={child.id}
            component={NextLink}
            href={`/category/${child.slug}`}
            sx={{
              width: 110,
              textDecoration: "none",
              color: "text.primary",
              display: "block",
            }}
          >
            <Box
              sx={{
                width: 110,
                height: 110,
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
              {child.thumbnail_url ? (
                <Box
                  component="img"
                  src={child.thumbnail_url}
                  alt={child.name}
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(30,58,138,0.08)",
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textAlign: "center",
                display: "block",
                lineHeight: 1.3,
              }}
            >
              {child.name}
            </Typography>
          </Box>
        ))}
      </CardCarousel>
    </Box>
  );
}
