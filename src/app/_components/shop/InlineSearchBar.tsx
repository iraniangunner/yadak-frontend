"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
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
| مسیر فایل: src/app/_components/shop/InlineSearchBar.tsx
|--------------------------------------------------------------------------
| نسخه‌ی «توکار» جستجو که داخل هدر می‌شینه؛ با کلیک روی فیلد، باکس نتایج
| دقیقاً زیرش باز می‌شه و پس‌زمینه‌ی پشتش (زیر هدر) تار/بلور می‌شه -
| دقیقاً مثل رفتار مگامنوی دسته‌بندی‌ها.
*/

type SearchResult = {
  id: number;
  slug: string;
  title: string;
  final_price: number;
  thumbnail_url: string | null;
};

export function InlineSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [anchorRect, setAnchorRect] = useState<{
    top: number;
    start: number;
    width: number;
    bottom: number;
  } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  useEffect(() => {
    setFocused(false);
  }, [pathname]);

  const measure = () => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const startOffset = document.documentElement.clientWidth - rect.right;
      setAnchorRect({
        top: rect.bottom + 8,
        start: startOffset,
        width: rect.width,
        bottom: rect.bottom,
      });
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    measure();
    setIsLoading(true);
    const timer = setTimeout(() => {
      productsAPI
        .list({ search: query.trim(), per_page: 8 })
        .then((res) => setResults(res.data.data))
        .finally(() => setIsLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = () => setFocused(false);

  // باکس فقط وقتی باز می‌شه که هم فوکوس باشه و هم چیزی تایپ شده باشه
  const open = focused && query.trim().length > 0;

  // قفل کردن اسکرول صفحه تا وقتی باکس جستجو بازه
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <Box ref={anchorRef} sx={{ position: "relative", flex: 1, minWidth: 0 }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="جستجو در یدکی"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="پاک کردن جستجو"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 999,
            bgcolor: "background.default",
            "& fieldset": { borderColor: "transparent" },
            "&:hover fieldset": { borderColor: "divider" },
            "&.Mui-focused fieldset": { borderColor: "primary.main" },
          },
        }}
      />

      {open &&
        anchorRect &&
        createPortal(
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 1250,
              pointerEvents: "none",
            }}
          >
            {/* پس‌زمینه‌ی تار پشت باکس؛ کلیک روش باکس رو می‌بنده */}
            <Box
              onClick={handleClose}
              sx={{
                position: "fixed",
                top: anchorRect.bottom,
                insetInline: 0,
                bottom: 0,
                bgcolor: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(6px)",
                pointerEvents: "auto",
              }}
            />

            <Box
              style={{
                position: "absolute",
                top: anchorRect.top,
                right: anchorRect.start,
                width: anchorRect.width,
                pointerEvents: "auto",
              }}
            >
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: "0 20px 48px rgba(0,0,0,0.35)",
                  maxHeight: 420,
                  overflowY: "auto",
                  animation: "searchBoxFadeIn .2s ease-out",
                  "@keyframes searchBoxFadeIn": {
                    from: { opacity: 0, transform: "translateY(-6px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                {isLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress size={22} />
                  </Box>
                ) : !results || results.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 3, fontSize: "0.875rem" }}
                  >
                    محصولی پیدا نشد
                  </Typography>
                ) : (
                  <Box sx={{ py: 1 }}>
                    {results.map((product) => (
                      <Box
                        key={product.id}
                        component={NextLink}
                        href={`/products/${product.slug}`}
                        onClick={handleClose}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 2,
                          py: 1,
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
                            width: 44,
                            height: 44,
                            objectFit: "cover",
                            borderRadius: 1.5,
                            bgcolor: "background.default",
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                            noWrap
                          >
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
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>,
          document.body
        )}
    </Box>
  );
}
