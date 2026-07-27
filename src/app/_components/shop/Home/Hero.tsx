"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { ChevronRight, ChevronLeft } from "@mui/icons-material";
import useEmblaCarousel from "embla-carousel-react";
import type { ServerBanner } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/Hero.tsx
|--------------------------------------------------------------------------
| هیرو دیگه ایلوستریشن انتزاعی نیست - یه کاروسل Embla از banners واقعی
| (عکس محصول/برند + عنوان + لینک)، دقیقاً مثل سایت مرجع: تصویر تمام‌عرض
| تیره، متن پایین‌چپ، نقطه‌های صفحه پایین وسط.
*/
export function Hero({ banners }: { banners: ServerBanner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: "rtl",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    // اسلاید خودکار هر ۵ ثانیه
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, 5000);

    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(interval);
    };
  }, [emblaApi]);

  if (banners.length === 0) return null;

  return (
    <Box sx={{ position: "relative", bgcolor: "primary.main" }}>
      <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
        <Box sx={{ display: "flex" }}>
          {banners.map((banner) => {
            const href =
              banner.link_url ||
              (banner.product ? `/products/${banner.product.slug}` : "#");

            return (
              <Box
                key={banner.id}
                component={NextLink}
                href={href}
                sx={{
                  position: "relative",
                  flex: "0 0 100%",
                  minWidth: 0,
                  height: { xs: 260, md: 380 },
                  display: "block",
                  textDecoration: "none",
                }}
              >
                {banner.image_url && (
                  <Box
                    component="img"
                    src={banner.image_url}
                    alt={banner.title}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: 0.85,
                    }}
                  />
                )}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, rgba(30,58,138,0.8) 0%, rgba(30,58,138,0.2) 60%, transparent 100%)",
                  }}
                />
                <Container
                  maxWidth="lg"
                  sx={{
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: { xs: "1.4rem", md: "2rem" },
                      maxWidth: 420,
                      textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                    }}
                  >
                    {banner.title}
                  </Typography>
                </Container>
              </Box>
            );
          })}
        </Box>
      </Box>

      {banners.length > 1 && (
        <>
          <IconButton
            onClick={() => emblaApi?.scrollNext()}
            sx={{
              position: "absolute",
              top: "50%",
              right: 12,
              transform: "translateY(-50%)",
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.12)",
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={() => emblaApi?.scrollPrev()}
            sx={{
              position: "absolute",
              top: "50%",
              left: 12,
              transform: "translateY(-50%)",
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.12)",
            }}
          >
            <ChevronRight />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              bottom: 14,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 0.75,
            }}
          >
            {banners.map((_, i) => (
              <Box
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                sx={{
                  width: i === selectedIndex ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  bgcolor:
                    i === selectedIndex
                      ? "accent.main"
                      : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  transition: "width .2s",
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
