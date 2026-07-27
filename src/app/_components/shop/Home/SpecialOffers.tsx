"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { ChevronRight, ChevronLeft } from "@mui/icons-material";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCard } from "@/app/_components/shop/ProductCard";
import type { getProducts } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/SpecialOffers.tsx
|--------------------------------------------------------------------------
| نوار قرمز/صورتی با کارت‌های سفید محصول. اولین آیتم (سمت راست توی RTL)
| کارت «فروش ویژه» (آیکون شعله)، آخرین آیتم (سمت چپ) کارت «مشاهده
| بیشتر» (آیکون فلش). دکمه‌های قبلی/بعدی بیرون از نوار قرمز، کنارش.
*/

type Product = Awaited<ReturnType<typeof getProducts>>["data"][number];

const OFFER_RED = "#EF3E5C";

export function SpecialOffers({ products }: { products: Product[] }) {
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
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{ bgcolor: OFFER_RED, borderRadius: 2, p: { xs: 1.5, sm: 2.5 } }}
        >
          <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* اول (راست توی RTL): فروش ویژه */}
              <Box
                sx={{
                  flex: "0 0 auto",
                  width: 150,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LocalFireDepartmentIcon
                    sx={{ color: "#fff", fontSize: 30 }}
                  />
                </Box>
                <Typography
                  sx={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem" }}
                >
                  فروش ویژه
                </Typography>
              </Box>

              {products.map((product) => (
                <Box
                  key={product.id}
                  sx={{
                    flex: "0 0 auto",
                    width: 210,
                    bgcolor: "#fff",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <ProductCard product={product} />
                </Box>
              ))}

              {/* آخر (چپ توی RTL): مشاهده‌ی بیشتر */}
              <Box
                component={NextLink}
                href="/special-offers"
                sx={{
                  flex: "0 0 auto",
                  width: 210,
                  bgcolor: "#fff",
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                  textDecoration: "none",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronLeft sx={{ color: "primary.main" }} />
                </Box>
                <Typography sx={{ color: "primary.main", fontWeight: 700 }}>
                  مشاهده بیشتر
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {canScroll && (
          <>
            <IconButton
              onClick={() => emblaApi?.scrollNext()}
              size="small"
              sx={{
                display: { xs: "none", sm: "flex" },
                position: "absolute",
                top: "50%",
                insetInlineStart: 12,
                transform: "translateY(-50%)",
                bgcolor: "rgba(0,0,0,0.35)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => emblaApi?.scrollPrev()}
              size="small"
              sx={{
                display: { xs: "none", sm: "flex" },
                position: "absolute",
                top: "50%",
                insetInlineEnd: 12,
                transform: "translateY(-50%)",
                bgcolor: "rgba(0,0,0,0.35)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
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
