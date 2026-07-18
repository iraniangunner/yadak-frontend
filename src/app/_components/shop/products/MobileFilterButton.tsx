"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FilterList, Close } from "@mui/icons-material";
import { useProductFilters } from "@/hooks/useProductFilters";
import { ProductFilterPanel } from "@/app/_components/shop/ProductFilterPanel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/MobileFilterButton.tsx
|--------------------------------------------------------------------------
| Drawer با تیک زدن هر چک‌باکس بسته نمی‌شه - کاربر می‌تونه چندتا فیلتر
| رو پشت سر هم انتخاب کنه و در آخر با دکمه‌ی «مشاهده‌ی نتایج» (ثابت
| پایین Drawer) ببندتش.
*/

type Option = { id: number; name: string };
type CategoryOption = Option & { parent_id: number | null };

export function MobileFilterButton({
  categories,
  brands,
}: {
  categories: CategoryOption[];
  brands: Option[];
}) {
  const { filters, updateFilters, clearFilters, activeFilterCount } =
    useProductFilters();
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: { xs: "block", md: "none" } }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<FilterList />}
        onClick={() => setOpen(true)}
      >
        فیلترها{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
      </Button>

      <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              p: 3,
              pb: 2,
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>فیلترها</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Stack>

          <Box sx={{ px: 3, overflowY: "auto", flex: 1 }}>
            <ProductFilterPanel
              filters={filters}
              categories={categories}
              brands={brands}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </Box>

          {/* دکمه‌ی ثابت پایین - فقط همین‌جا Drawer بسته می‌شه */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Button
              variant="contained"
              disableElevation
              fullWidth
              size="large"
              onClick={() => setOpen(false)}
            >
              مشاهده‌ی نتایج
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
