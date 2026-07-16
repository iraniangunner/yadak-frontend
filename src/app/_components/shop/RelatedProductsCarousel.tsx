"use client";

import { useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronRight, ChevronLeft } from "@mui/icons-material";
import {
  ProductCard,
  ProductCardData,
} from "@/app/_components/shop/ProductCard";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/RelatedProductsCarousel.tsx
|--------------------------------------------------------------------------
*/

export function RelatedProductsCarousel({
  products,
}: {
  products: ProductCardData[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (products.length === 0) return null;

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
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 3 },
        }}
      >
        {products.map((product) => (
          <Box
            key={product.id}
            sx={{ minWidth: 180, maxWidth: 180, scrollSnapAlign: "start" }}
          >
            <ProductCard product={product} />
          </Box>
        ))}
      </Box>

      <IconButton
        onClick={() => scrollBy(300)}
        sx={{
          display: { xs: "none", sm: "flex" },
          position: "absolute",
          top: "35%",
          right: -18,
          bgcolor: "background.paper",
          boxShadow: 2,
          "&:hover": { bgcolor: "background.paper" },
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
          top: "35%",
          left: -18,
          bgcolor: "background.paper",
          boxShadow: 2,
          "&:hover": { bgcolor: "background.paper" },
        }}
        size="small"
      >
        <ChevronLeft fontSize="small" />
      </IconButton>
    </Box>
  );
}
