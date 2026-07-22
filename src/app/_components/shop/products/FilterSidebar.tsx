"use client";

import { Box } from "@mui/material";
import { useProductFilters } from "@/hooks/useProductFilters";
import { ProductFilterPanel } from "@/app/_components/shop/ProductFilterPanel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/FilterSidebar.tsx
|--------------------------------------------------------------------------
*/

type Option = { id: number; name: string };
type CategoryOption = Option & { parent_id: number | null };

export function FilterSidebar({
  categories,
  brands,
  vehicleBrandOptions,
  vehicleModelOptions,
  filterableAttributes,
  attributeCategoryIds,
  showCategoryFilter = true,
  basePath,
}: {
  categories: CategoryOption[];
  brands: Option[];
  vehicleBrandOptions?: string[];
  vehicleModelOptions?: string[];
  filterableAttributes?: { name: string; values: string[] }[];
  attributeCategoryIds?: number[];
  showCategoryFilter?: boolean;
  basePath?: string;
}) {
  const { filters, updateFilters, clearFilters } = useProductFilters({
    basePath,
    includeCategoryFilter: showCategoryFilter,
  });

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        display: { xs: "none", md: "block" },
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        p: 2.5,
        position: "sticky",
        top: 90,
        maxHeight: "calc(100vh - 110px)",
        overflowY: "auto",
      }}
    >
      <ProductFilterPanel
        filters={filters}
        categories={categories}
        brands={brands}
        vehicleBrandOptions={vehicleBrandOptions}
        vehicleModelOptions={vehicleModelOptions}
        onChange={updateFilters}
        onClear={clearFilters}
        showCategoryFilter={showCategoryFilter}
        filterableAttributes={filterableAttributes}
        attributeCategoryIds={attributeCategoryIds}
      />
    </Box>
  );
}
