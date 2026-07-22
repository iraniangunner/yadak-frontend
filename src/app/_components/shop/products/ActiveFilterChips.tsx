"use client";

import { Box, Chip, Rating } from "@mui/material";
import { useProductFilters } from "@/hooks/useProductFilters";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/ActiveFilterChips.tsx
|--------------------------------------------------------------------------
| ⚠️ برند/مدل خودرو دیگه از رابطه‌ی Vehicle نمیان - مستقیم رشته‌های
| vehicle_brands/vehicle_models خودِ فیلترن (نه lookup روی یه لیست جدا).
*/

type Option = { id: number; name: string };
type CategoryOption = Option & { parent_id: number | null };

const stockStatusLabels: Record<string, string> = {
  available: "موجود",
  incoming: "در حال تأمین",
  stopped: "متوقف‌شده",
  out_of_stock: "ناموجود",
};

function getAncestorIds(categories: CategoryOption[], nodeId: number): string[] {
  const node = categories.find((c) => c.id === nodeId);
  if (!node || !node.parent_id) return [];
  return [String(node.parent_id), ...getAncestorIds(categories, node.parent_id)];
}

function getDescendantIds(categories: CategoryOption[], nodeId: number): string[] {
  const children = categories.filter((c) => c.parent_id === nodeId);
  let ids: string[] = [];
  for (const child of children) {
    ids.push(String(child.id));
    ids = ids.concat(getDescendantIds(categories, child.id));
  }
  return ids;
}

export function ActiveFilterChips({
  categories,
  brands,
  showCategoryFilter = true,
  basePath,
}: {
  categories: CategoryOption[];
  brands: Option[];
  showCategoryFilter?: boolean;
  basePath?: string;
}) {
  const { filters, updateFilters, clearFilters, removeFromArrayFilter, removeAttributeFilter } = useProductFilters({
    basePath,
    includeCategoryFilter: showCategoryFilter,
  });

  const chips: { key: string; label: React.ReactNode; onDelete: () => void }[] = [
    ...(filters.is_available
      ? [{ key: "is_available", label: "فقط موجود", onDelete: () => updateFilters({ ...filters, is_available: false }) }]
      : []),
    ...(filters.is_discounted
      ? [{ key: "is_discounted", label: "فقط تخفیف‌دار", onDelete: () => updateFilters({ ...filters, is_discounted: false }) }]
      : []),
    ...(filters.min_price || filters.max_price
      ? [
          {
            key: "price",
            label:
              filters.min_price && filters.max_price
                ? `${Number(filters.min_price).toLocaleString("fa-IR")} تا ${Number(filters.max_price).toLocaleString("fa-IR")} تومان`
                : filters.min_price
                ? `بیشتر از ${Number(filters.min_price).toLocaleString("fa-IR")} تومان`
                : `کمتر از ${Number(filters.max_price).toLocaleString("fa-IR")} تومان`,
            onDelete: () => updateFilters({ ...filters, min_price: "", max_price: "" }),
          },
        ]
      : []),
    ...Object.entries(filters.attributes).map(([name, value]) => ({
      key: `attr-${name}`,
      label: `${name}: ${value}`,
      onDelete: () => removeAttributeFilter(name),
    })),
    ...filters.vehicle_brands.map((brandName) => ({
      key: `vbrand-${brandName}`,
      label: `خودرو: ${brandName}`,
      onDelete: () => removeFromArrayFilter("vehicle_brands", brandName),
    })),
    ...filters.vehicle_models.map((modelName) => ({
      key: `vmodel-${modelName}`,
      label: `مدل: ${modelName}`,
      onDelete: () => removeFromArrayFilter("vehicle_models", modelName),
    })),
    ...filters.category_ids
      .map((id) => {
        const category = categories.find((c) => String(c.id) === id);
        if (!category) return null;

        const ancestorIds = getAncestorIds(categories, category.id);
        if (ancestorIds.some((ancestorId) => filters.category_ids.includes(ancestorId))) return null;

        return {
          key: `cat-${id}`,
          label: category.name,
          onDelete: () => {
            const descendantIds = getDescendantIds(categories, category.id);
            updateFilters({
              ...filters,
              category_ids: filters.category_ids.filter((cid) => cid !== id && !descendantIds.includes(cid)),
            });
          },
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null),
    ...filters.brand_ids
      .map((id) => {
        const brand = brands.find((b) => String(b.id) === id);
        if (!brand) return null;
        return { key: `brand-${id}`, label: brand.name, onDelete: () => removeFromArrayFilter("brand_ids", id) };
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
                <Rating value={Number(filters.min_rating)} readOnly size="small" sx={{ fontSize: "0.9rem" }} />
              </Box>
            ),
            onDelete: () => updateFilters({ ...filters, min_rating: "" }),
          },
        ]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} size="small" onDelete={chip.onDelete} />
      ))}
      <Chip label="پاک کردن همه" size="small" variant="outlined" onClick={clearFilters} />
    </Box>
  );
}
