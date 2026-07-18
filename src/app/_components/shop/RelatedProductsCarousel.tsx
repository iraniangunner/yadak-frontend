"use client";

import { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronRight, ChevronLeft } from "@mui/icons-material";
import useEmblaCarousel from "embla-carousel-react";
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    direction: "rtl",
    align: "start",
    dragFree: true,
  });
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const updateCanScroll = () =>
      setCanScroll(emblaApi.scrollSnapList().length > 1);

    updateCanScroll();
    emblaApi.on("reInit", updateCanScroll);
    emblaApi.on("resize", updateCanScroll);

    return () => {
      emblaApi.off("reInit", updateCanScroll);
      emblaApi.off("resize", updateCanScroll);
    };
  }, [emblaApi]);

  if (products.length === 0) return null;

  return (
    <Box sx={{ position: "relative" }}>
      <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          {products.map((product) => (
            <Box key={product.id} sx={{ flex: "0 0 auto", width: 230 }}>
              <ProductCard product={product} />
            </Box>
          ))}
        </Box>
      </Box>

      {canScroll && (
        <>
          <IconButton
            onClick={() => emblaApi?.scrollNext()}
            size="small"
            sx={{
              display: "flex",
              position: "absolute",
              top: "35%",
              insetInlineStart: -8,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => emblaApi?.scrollPrev()}
            size="small"
            sx={{
              display: "flex",
              position: "absolute",
              top: "35%",
              insetInlineEnd: -8,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
}
