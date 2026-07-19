"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { ArrowBackIos, ChevronRight, ChevronLeft } from "@mui/icons-material";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCard } from "@/app/_components/shop/ProductCard";
import type { getProducts } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/BestSellers.tsx
|--------------------------------------------------------------------------
| ⚠️ "use client" شد (قبلاً سرور بود) چون embla-carousel نیاز به
| هوک‌های کلاینتی داره. products همچنان prop ـه که از والدِ سرور میاد -
| خودِ داده هنوز SSR ـه، فقط چیدمانِ اسکرول‌شونده کلاینتیه.
*/

type Product = Awaited<ReturnType<typeof getProducts>>["data"][number];

export function BestSellers({ products }: { products: Product[] }) {
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "accent.main", fontWeight: 700, letterSpacing: 1.5 }}
          >
            محبوب
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            محصولات پرفروش
          </Typography>
        </Box>
        <Button
          component={NextLink}
          href="/products"
          endIcon={<ArrowBackIos sx={{ fontSize: "0.8rem" }} />}
        >
          مشاهده‌ی همه
        </Button>
      </Box>

      <Box sx={{ position: "relative" }}>
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {products.map((product) => (
              <Box key={product.id} sx={{ flex: "0 0 auto", width: 200 }}>
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
    </Container>
  );
}
