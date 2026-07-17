"use client";

import { useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronRight, ChevronLeft } from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/HorizontalCarousel.tsx
|--------------------------------------------------------------------------
| محوشدگی لبه‌ها با mask-image + دکمه‌های دایره‌ای با هاور نارنجی.
*/
export function HorizontalCarousel({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          pb: 1,
          px: 0.5,
          WebkitMaskImage:
            "linear-gradient(to left, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)",
          maskImage:
            "linear-gradient(to left, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)",
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 3 },
        }}
      >
        {children}
      </Box>

      <IconButton
        onClick={() => scrollBy(300)}
        sx={{
          display: { xs: "none", sm: "flex" },
          position: "absolute",
          top: "40%",
          right: -18,
          bgcolor: "background.paper",
          border: "1px solid rgba(15,23,42,0.1)",
          boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
          "&:hover": {
            bgcolor: "accent.main",
            color: "#fff",
            borderColor: "accent.main",
          },
        }}
        size="small"
      >
        <ChevronRight fontSize="small" />
      </IconButton>
      <IconButton
        onClick={() => scrollBy(-300)}
        sx={{
          display: { xs: "none", sm: "flex" },
          position: "absolute",
          top: "40%",
          left: -18,
          bgcolor: "background.paper",
          border: "1px solid rgba(15,23,42,0.1)",
          boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
          "&:hover": {
            bgcolor: "accent.main",
            color: "#fff",
            borderColor: "accent.main",
          },
        }}
        size="small"
      >
        <ChevronLeft fontSize="small" />
      </IconButton>
    </Box>
  );
}
