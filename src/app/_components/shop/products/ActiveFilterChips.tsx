"use client";

import { Box, Chip, Rating } from "@mui/material";
import { useProductFilters } from "@/hooks/useProductFilters";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/ActiveFilterChips.tsx
|--------------------------------------------------------------------------
| چیپ فقط وقتی برای یه دسته/برند ساخته می‌شه که اسم واقعیش موجود باشه -
| تا هیچ‌وقت عدد ID خام (fallback) نمایش داده نشه.
*/

type Option = { id: number; name: string };

const stockStatusLabels: Record<string, string> = {
  available: "موجود",
  incoming: "در حال تأمین",
  stopped: "متوقف‌شده",
  out_of_stock: "ناموجود",
};

export function ActiveFilterChips({
  categories,
  brands,
}: {
  categories: Option[];
  brands: Option[];
}) {
  const { filters, updateFilters, clearFilters, removeFromArrayFilter } =
    useProductFilters();

  const chips: { key: string; label: React.ReactNode; onDelete: () => void }[] =
    [
      ...filters.category_ids
        .map((id) => {
          const category = categories.find((c) => String(c.id) === id);
          if (!category) return null;
          return {
            key: `cat-${id}`,
            label: category.name,
            onDelete: () => removeFromArrayFilter("category_ids", id),
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null),
      ...filters.brand_ids
        .map((id) => {
          const brand = brands.find((b) => String(b.id) === id);
          if (!brand) return null;
          return {
            key: `brand-${id}`,
            label: brand.name,
            onDelete: () => removeFromArrayFilter("brand_ids", id),
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null),
      ...filters.stock_statuses.map((s) => ({
        key: `stock-${s}`,
        label: stockStatusLabels[s] || s,
        onDelete: () => removeFromArrayFilter("stock_statuses", s),
      })),
      ...(filters.min_rating
        ? [
            {
              key: "rating",
              label: (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <span>ستاره و بالاتر</span>
                  <Rating
                    value={Number(filters.min_rating)}
                    readOnly
                    size="small"
                    sx={{ fontSize: "0.9rem" }}
                  />
                </Box>
              ),
              onDelete: () => updateFilters({ ...filters, min_rating: "" }),
            },
          ]
        : []),
    ];

  if (chips.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        mt: 1.5,
        pt: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          size="small"
          onDelete={chip.onDelete}
        />
      ))}
      <Chip
        label="پاک کردن همه"
        size="small"
        variant="outlined"
        onClick={clearFilters}
      />
    </Box>
  );
}
