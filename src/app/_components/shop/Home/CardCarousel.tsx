"use client";

import { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronRight, ChevronLeft } from "@mui/icons-material";
import useEmblaCarousel from "embla-carousel-react";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/home/CardCarousel.tsx
|--------------------------------------------------------------------------
| کاروسل Embla عمومی - برای هر لیستی از کارت‌های ساده (دسته‌بندی، برند
| محصول، برند خودرو و...). دقیقاً هم‌الگو با RelatedProductsCarousel،
| فقط عمومی‌تر (هر children ای رو قبول می‌کنه، نه فقط ProductCard).
| اگه تعداد آیتم‌ها کم باشه (همه بدون اسکرول جا میشن)، دکمه‌ها اصلاً
| نمایش داده نمی‌شن.
*/

export function CardCarousel({ children }: { children: React.ReactNode[] }) {
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

  if (!children || children.length === 0) return null;

  return (
    <Box sx={{ position: "relative" }}>
      <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          {children.map((child, i) => (
            <Box key={i} sx={{ flex: "0 0 auto" }}>
              {child}
            </Box>
          ))}
        </Box>
      </Box>

      {canScroll && (
        <>
          <IconButton
            onClick={() => emblaApi?.scrollNext()}
            sx={{
              display: { xs: "none", sm: "flex" },
              position: "absolute",
              top: "50%",
              right: -18,
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper" },
            }}
            size="small"
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => emblaApi?.scrollPrev()}
            sx={{
              display: { xs: "none", sm: "flex" },
              position: "absolute",
              top: "50%",
              left: -18,
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper" },
            }}
            size="small"
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
}
