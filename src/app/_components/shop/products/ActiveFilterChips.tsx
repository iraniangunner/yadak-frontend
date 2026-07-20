"use client";

import { Box, Chip, Rating } from "@mui/material";
import { useProductFilters } from "@/hooks/useProductFilters";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/ActiveFilterChips.tsx
|--------------------------------------------------------------------------

*/

type Option = { id: number; name: string };
type CategoryOption = Option & { parent_id: number | null };
type VehicleOption = {
  id: number;
  brand: string;
  model: string;
  generation?: string | null;
};

const stockStatusLabels: Record<string, string> = {
  available: "موجود",
  incoming: "در حال تأمین",
  stopped: "متوقف‌شده",
  out_of_stock: "ناموجود",
};

function getAncestorIds(
  categories: CategoryOption[],
  nodeId: number
): string[] {
  const node = categories.find((c) => c.id === nodeId);
  if (!node || !node.parent_id) return [];
  return [
    String(node.parent_id),
    ...getAncestorIds(categories, node.parent_id),
  ];
}

function getDescendantIds(
  categories: CategoryOption[],
  nodeId: number
): string[] {
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
  vehicles,
  showCategoryFilter = true,
  basePath,
}: {
  categories: CategoryOption[];
  brands: Option[];
  vehicles?: VehicleOption[];
  showCategoryFilter?: boolean;
  basePath?: string;
}) {
  const {
    filters,
    vehicleId,
    setParam,
    updateFilters,
    clearFilters,
    removeFromArrayFilter,
  } = useProductFilters({
    basePath,
    includeCategoryFilter: showCategoryFilter,
  });

  const selectedVehicle = vehicles?.find((v) => String(v.id) === vehicleId);

  const chips: { key: string; label: React.ReactNode; onDelete: () => void }[] =
    [
      ...(selectedVehicle
        ? [
            {
              key: "vehicle",
              label: `${selectedVehicle.brand} ${selectedVehicle.model}`,
              onDelete: () => setParam("vehicle_id", ""),
            },
          ]
        : []),
      ...filters.category_ids
        .map((id) => {
          const category = categories.find((c) => String(c.id) === id);
          if (!category) return null;

          const ancestorIds = getAncestorIds(categories, category.id);
          if (
            ancestorIds.some((ancestorId) =>
              filters.category_ids.includes(ancestorId)
            )
          )
            return null;

          return {
            key: `cat-${id}`,
            label: category.name,
            onDelete: () => {
              const descendantIds = getDescendantIds(categories, category.id);
              updateFilters({
                ...filters,
                category_ids: filters.category_ids.filter(
                  (cid) => cid !== id && !descendantIds.includes(cid)
                ),
              });
            },
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
