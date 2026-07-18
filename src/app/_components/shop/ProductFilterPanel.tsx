"use client";

import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Rating,
} from "@mui/material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductFilterPanel.tsx
|--------------------------------------------------------------------------
| همه‌ی فیلترها با چک‌باکس (چندانتخابی) هستن، به‌جز امتیاز که رفتارش شبیه
| فیلترهای فروشگاه‌های بزرگه: «۴ ستاره و بالاتر» رو انتخاب می‌کنید، نه
| یه عدد دقیق.
|
| ⚠️ فرض کردم بک‌اند از این پارامترهای جدید پشتیبانی می‌کنه:
| category_id/brand_id/stock_status به‌صورت رشته‌ی کاما-جدا (چندتایی)،
| min_rating (عدد)، price_min/price_max (عدد). اگه بک‌اند فعلاً این‌ها رو
| نداره، باید ProductController::index() رو هم آپدیت کنیم.
*/

export type ProductFilters = {
  category_ids: string[];
  brand_ids: string[];
  stock_statuses: string[];
  min_rating: string;
};

type Option = { id: number; name: string };

const stockStatusOptions = [
  { value: "available", label: "موجود" },
  { value: "incoming", label: "در حال تأمین" },
  { value: "stopped", label: "متوقف‌شده" },
  { value: "out_of_stock", label: "ناموجود" },
];

const ratingOptions = [4, 3, 2, 1];

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
  const toggleInArray = (key: keyof ProductFilters, value: string) => {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>فیلترها</Typography>

      {/* دسته‌بندی */}
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
        دسته‌بندی
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {categories.map((c) => (
          <FormControlLabel
            key={c.id}
            control={
              <Checkbox
                size="small"
                checked={filters.category_ids.includes(String(c.id))}
                onChange={() => toggleInArray("category_ids", String(c.id))}
              />
            }
            label={<Typography variant="body2">{c.name}</Typography>}
          />
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* برند */}
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        برند
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {brands.map((b) => (
          <FormControlLabel
            key={b.id}
            control={
              <Checkbox
                size="small"
                checked={filters.brand_ids.includes(String(b.id))}
                onChange={() => toggleInArray("brand_ids", String(b.id))}
              />
            }
            label={<Typography variant="body2">{b.name}</Typography>}
          />
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* وضعیت موجودی */}
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        وضعیت موجودی
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {stockStatusOptions.map((s) => (
          <FormControlLabel
            key={s.value}
            control={
              <Checkbox
                size="small"
                checked={filters.stock_statuses.includes(s.value)}
                onChange={() => toggleInArray("stock_statuses", s.value)}
              />
            }
            label={<Typography variant="body2">{s.label}</Typography>}
          />
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* امتیاز */}
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        امتیاز
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {ratingOptions.map((r) => (
          <FormControlLabel
            key={r}
            control={
              <Checkbox
                size="small"
                checked={filters.min_rating === String(r)}
                onChange={() =>
                  onChange({
                    ...filters,
                    min_rating:
                      filters.min_rating === String(r) ? "" : String(r),
                  })
                }
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating value={r} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  و بالاتر
                </Typography>
              </Box>
            }
          />
        ))}
      </Box>

      <Button color="inherit" onClick={onClear} size="small" sx={{ mt: 1 }}>
        پاک کردن فیلترها
      </Button>
    </Box>
  );
}
