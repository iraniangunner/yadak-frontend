"use client";

import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { ArrowForward, ChevronRight, ChevronLeft, ArrowBack } from "@mui/icons-material";
import useEmblaCarousel from "embla-carousel-react";
import type { getBanners } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/FeaturedBanner.tsx
|--------------------------------------------------------------------------
| کاروسل تمام‌عرض همه‌ی بنرها، با Embla. هر اسلاید عکسِ کامل + گرادینت
| تیره‌ی پایین (برای خوانایی عنوان/دکمه) + نقطه‌های صفحه + دکمه‌ی قبلی/بعدی.
*/

type Banner = Awaited<ReturnType<typeof getBanners>>[number];

export function FeaturedBanner({ banners }: { banners: Banner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: "rtl" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (banners.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ position: "relative", borderRadius: 4, overflow: "hidden", boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}>
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex" }}>
            {banners.map((banner) => (
              <Box key={banner.id} sx={{ flex: "0 0 100%", minWidth: 0, position: "relative" }}>
                <Box
                  component={NextLink}
                  href={banner.product ? `/products/${banner.product.slug}` : banner.link_url || "#"}
                  sx={{ display: "block", position: "relative" }}
                >
                  <Box
                    component="img"
                    src={banner.image_url || undefined}
                    alt={banner.title}
                    sx={{
                      width: "100%",
                      height: { xs: 220, sm: 320, md: 400 },
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {/* گرادینت تیره‌ی پایین برای خوانایی متن روی عکس */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 45%, transparent 75%)",
                    }}
                  />

                  <Box sx={{ position: "absolute", bottom: 0, insetInline: 0, p: { xs: 3, md: 5 } }}>
                    <Typography
                      variant="h4"
                      sx={{ color: "#fff", fontWeight: 800, mb: 2, fontSize: { xs: "1.3rem", md: "1.9rem" } }}
                    >
                      {banner.title}
                    </Typography>
                    <Button
                      variant="contained"
                      disableElevation
                      color="secondary"
                      startIcon={<ArrowBack sx={{ transform: "scaleX(-1)" }} />}
                      sx={{ pointerEvents: "none" }}
                    >
                      مشاهده‌ی محصول
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {banners.length > 1 && (
          <>
            <IconButton
              onClick={() => emblaApi?.scrollNext()}
              sx={{
                position: "absolute",
                top: "50%",
                insetInlineStart: 12,
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.85)",
                boxShadow: 2,
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              <ChevronRight />
            </IconButton>
            <IconButton
              onClick={() => emblaApi?.scrollPrev()}
              sx={{
                position: "absolute",
                top: "50%",
                insetInlineEnd: 12,
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.85)",
                boxShadow: 2,
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              <ChevronLeft />
            </IconButton>

            {/* نقطه‌های صفحه */}
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                insetInlineEnd: 16,
                display: "flex",
                gap: 0.75,
              }}
            >
              {banners.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  sx={{
                    width: idx === selectedIndex ? 22 : 8,
                    height: 8,
                    borderRadius: 999,
                    bgcolor: idx === selectedIndex ? "#fff" : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "width .2s, background-color .2s",
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}