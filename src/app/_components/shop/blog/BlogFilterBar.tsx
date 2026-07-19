"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/blog/BlogFilterBar.tsx
|--------------------------------------------------------------------------
| دقیقاً هم‌الگو با فیلترهای محصولات: فقط router.push ساده، بدون
| useTransition/loading.tsx. Skeleton (اگه لازم بشه) از همون مکانیزم
| ProductGridWithLoadMore/BlogGridWithLoadMore (key-remount) میاد.
*/

const sortOptions = [
  { value: "", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
];

export function BlogFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/blog?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", search.trim());
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        gap: 1.5,
        flexWrap: "wrap",
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        p: 1.5,
        mb: 3,
      }}
    >
      <TextField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجو در مقالات..."
        size="small"
        sx={{ flex: "1 1 220px" }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconButton type="submit" size="small" edge="start">
                  <SearchIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearch("");
                    updateParam("search", "");
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>مرتب‌سازی</InputLabel>
        <Select
          label="مرتب‌سازی"
          value={searchParams.get("sort") || ""}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          {sortOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
