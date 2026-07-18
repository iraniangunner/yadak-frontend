"use client";

import { Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useProductFilters } from "@/hooks/useProductFilters";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/SortAndPerPageControls.tsx
|--------------------------------------------------------------------------
*/

const sortOptions = [
  { value: "", label: "پیش‌فرض" },
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "rating", label: "بالاترین امتیاز" },
];

const perPageOptions = [12, 24, 48];

export function SortAndPerPageControls({
  basePath,
}: { basePath?: string } = {}) {
  const { sort, perPage, setParam } = useProductFilters({ basePath });

  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>مرتب‌سازی</InputLabel>
        <Select
          label="مرتب‌سازی"
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          {sortOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>تعداد در صفحه</InputLabel>
        <Select
          label="تعداد در صفحه"
          value={String(perPage)}
          onChange={(e) => setParam("per_page", e.target.value)}
        >
          {perPageOptions.map((n) => (
            <MenuItem key={n} value={String(n)}>
              {n} محصول
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
