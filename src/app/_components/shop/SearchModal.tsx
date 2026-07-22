"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Dialog,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { productsAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/SearchModal.tsx
|--------------------------------------------------------------------------
| مودال وسط صفحه - تایپ می‌کنید، بعد از یه مکث کوتاه (debounce) نتایج
| زنده (عکس+عنوان+قیمت) زیرش لیست می‌شه. ⚠️ دیگه صفحه‌ی نتیجه‌ی کامل
| (/search) وجود نداره - جستجو فقط همینجا، درون همین مودال جواب می‌ده.
*/

type SearchResult = {
  id: number;
  slug: string;
  title: string;
  final_price: number;
  thumbnail_url: string | null;
};

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      productsAPI
        .list({ search: query.trim(), per_page: 10 })
        .then((res) => setResults(res.data.data))
        .finally(() => setIsLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3, position: "fixed", top: 80, m: 0 } },
      }}
    >
      <Box sx={{ p: 2 }}>
        <TextField
          autoFocus
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی قطعه، برند، خودرو..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={onClose}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {query.trim() && (
        <Box sx={{ px: 2, pb: 2, maxHeight: 420, overflowY: "auto" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : !results || results.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              محصولی پیدا نشد
            </Typography>
          ) : (
            results.map((product) => (
              <Box
                key={product.id}
                component={NextLink}
                href={`/products/${product.slug}`}
                onClick={onClose}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.25,
                  borderRadius: 2,
                  textDecoration: "none",
                  color: "text.primary",
                  "&:hover": { bgcolor: "background.default" },
                }}
              >
                <Box
                  component="img"
                  src={product.thumbnail_url || undefined}
                  alt=""
                  sx={{
                    width: 52,
                    height: 52,
                    objectFit: "cover",
                    borderRadius: 1.5,
                    bgcolor: "background.default",
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {product.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="primary.main"
                    sx={{ fontWeight: 700 }}
                  >
                    {formatPrice(product.final_price)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      )}
    </Dialog>
  );
}
