"use client";

import { useEffect, useState } from "react";
import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { useProductFilters } from "@/hooks/useProductFilters";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/ProductSearchBar.tsx
|--------------------------------------------------------------------------
| مستقل از مودال جستجوی هدر - همین‌جا هم می‌شه جستجو رو تغییر داد، بدون
| برگشتن به هدر.
*/

export function ProductSearchBar({ basePath }: { basePath?: string }) {
  const { search: urlSearch, setParam } = useProductFilters({ basePath });
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("search", search.trim());
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        p: 0.75,
        mb: 2,
      }}
    >
      <TextField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجو در محصولات..."
        size="small"
        fullWidth
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconButton type="submit" size="small" edge="start">
                  <Search fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearch("");
                    setParam("search", "");
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}
