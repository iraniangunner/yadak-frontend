"use client";

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductFilterPanel.tsx
|--------------------------------------------------------------------------
*/

export type ProductFilters = {
  category_id: string;
  brand_id: string;
  stock_status: string;
};

type Option = { id: number; name: string };

const stockStatusOptions = [
  { value: "available", label: "موجود" },
  { value: "incoming", label: "در حال تأمین" },
  { value: "stopped", label: "متوقف‌شده" },
  { value: "out_of_stock", label: "ناموجود" },
];

export function ProductFilterPanel({
  filters,
  categories,
  brands,
  onChange,
  onClear,
}: {
  filters: ProductFilters;
  categories: Option[];
  brands: Option[];
  onChange: (filters: ProductFilters) => void;
  onClear: () => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography sx={{ fontWeight: 700 }}>فیلترها</Typography>

      <FormControl size="small" fullWidth>
        <InputLabel>دسته‌بندی</InputLabel>
        <Select
          label="دسته‌بندی"
          value={filters.category_id}
          onChange={(e) =>
            onChange({ ...filters, category_id: e.target.value })
          }
        >
          <MenuItem value="">همه</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>برند</InputLabel>
        <Select
          label="برند"
          value={filters.brand_id}
          onChange={(e) => onChange({ ...filters, brand_id: e.target.value })}
        >
          <MenuItem value="">همه</MenuItem>
          {brands.map((b) => (
            <MenuItem key={b.id} value={String(b.id)}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>وضعیت موجودی</InputLabel>
        <Select
          label="وضعیت موجودی"
          value={filters.stock_status}
          onChange={(e) =>
            onChange({ ...filters, stock_status: e.target.value })
          }
        >
          <MenuItem value="">همه</MenuItem>
          {stockStatusOptions.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button color="inherit" onClick={onClear} size="small">
        پاک کردن فیلترها
      </Button>
    </Box>
  );
}
