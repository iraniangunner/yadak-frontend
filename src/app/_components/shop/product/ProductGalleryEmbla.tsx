"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Box, IconButton, Dialog, Backdrop } from "@mui/material";
import { ZoomIn, Close, ChevronRight, ChevronLeft } from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/product/ProductGalleryEmbla.tsx
|--------------------------------------------------------------------------
| نیاز به نصب: npm install embla-carousel-react
| توی حالت زوم یه instance جدای Embla ساخته می‌شه (چون مودال یه DOM جدا
| از گالری اصلیه) که دقیقاً همون قابلیت drag/swipe/دکمه رو داره - با
| ایندکس شروع هماهنگ با گالری اصلی.
*/

export function ProductGalleryEmbla({ images }: { images: string[] }) {
  const safeImages = images.length > 0 ? images : [""];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    direction: "rtl",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // ---------------- Embla جدا برای حالت زوم ----------------
  const [emblaZoomRef, emblaZoomApi] = useEmblaCarousel({
    loop: false,
    direction: "rtl",
    startIndex: selectedIndex,
  });
  const [zoomSelectedIndex, setZoomSelectedIndex] = useState(selectedIndex);

  useEffect(() => {
    if (!emblaZoomApi) return;
    const onSelect = () =>
      setZoomSelectedIndex(emblaZoomApi.selectedScrollSnap());
    emblaZoomApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaZoomApi.off("select", onSelect);
    };
  }, [emblaZoomApi]);

  const handleOpenZoom = () => setZoomOpen(true);

  const handleCloseZoom = () => {
    // هر تغییری که توی حالت زوم انجام شده رو با گالری اصلی هم‌سو کن
    if (emblaZoomApi) scrollTo(emblaZoomApi.selectedScrollSnap());
    setZoomOpen(false);
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      {/* ستون تامنیل - کنار عکس اصلی */}
      {safeImages.length > 1 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            flexShrink: 0,
            maxHeight: 440,
            overflowY: "auto",
          }}
        >
          {safeImages.map((img, idx) => (
            <Box
              key={idx}
              component="img"
              src={img || undefined}
              alt=""
              onClick={() => scrollTo(idx)}
              sx={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 2,
                flexShrink: 0,
                cursor: "pointer",
                border: "2px solid",
                borderColor:
                  idx === selectedIndex ? "primary.main" : "transparent",
                bgcolor: "background.default",
              }}
            />
          ))}
        </Box>
      )}

      {/* عکس اصلی */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
          flex: 1,
          minWidth: 0,
        }}
      >
        <Box
          ref={emblaRef}
          sx={{ overflow: "hidden", height: "100%", cursor: "zoom-in" }}
          onClick={handleOpenZoom}
        >
          <Box sx={{ display: "flex", height: "100%" }}>
            {safeImages.map((img, idx) => (
              <Box key={idx} sx={{ flex: "0 0 100%", minWidth: 0 }}>
                <Box
                  component="img"
                  src={img || undefined}
                  alt=""
                  sx={{
                    width: "100%",
                    height: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        <IconButton
          onClick={handleOpenZoom}
          size="small"
          sx={{
            position: "absolute",
            bottom: 12,
            insetInlineStart: 12,
            bgcolor: "background.paper",
            boxShadow: 1,
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          <ZoomIn fontSize="small" />
        </IconButton>

        {safeImages.length > 1 && (
          <>
            <IconButton
              onClick={() => emblaApi?.scrollNext()}
              size="small"
              sx={{
                position: "absolute",
                top: "50%",
                insetInlineEnd: 8,
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => emblaApi?.scrollPrev()}
              size="small"
              sx={{
                position: "absolute",
                top: "50%",
                insetInlineStart: 8,
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {/* مودال زوم - یه carousel کاملاً مستقل و کامل، با drag/swipe واقعی */}
      <Dialog
        open={zoomOpen}
        onClose={handleCloseZoom}
        maxWidth="lg"
        fullWidth
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,0.9)" } } }}
      >
        <Box sx={{ position: "relative", bgcolor: "#000" }}>
          <IconButton
            onClick={handleCloseZoom}
            sx={{
              position: "absolute",
              top: 8,
              insetInlineStart: 8,
              color: "#fff",
              zIndex: 2,
            }}
          >
            <Close />
          </IconButton>

          <Box ref={emblaZoomRef} sx={{ overflow: "hidden" }}>
            <Box sx={{ display: "flex" }}>
              {safeImages.map((img, idx) => (
                <Box key={idx} sx={{ flex: "0 0 100%", minWidth: 0 }}>
                  <Box
                    component="img"
                    src={img || undefined}
                    alt=""
                    sx={{
                      width: "100%",
                      height: "85vh",
                      objectFit: "contain",
                      display: "block",
                    }}
                    draggable={false}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {safeImages.length > 1 && (
            <>
              <IconButton
                onClick={() => emblaZoomApi?.scrollNext()}
                sx={{
                  position: "absolute",
                  top: "50%",
                  insetInlineEnd: 12,
                  transform: "translateY(-50%)",
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() => emblaZoomApi?.scrollPrev()}
                sx={{
                  position: "absolute",
                  top: "50%",
                  insetInlineStart: 12,
                  transform: "translateY(-50%)",
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                <ChevronRight />
              </IconButton>

              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 1,
                  bgcolor: "rgba(0,0,0,0.5)",
                  borderRadius: 2,
                  p: 1,
                }}
              >
                {safeImages.map((img, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={img || undefined}
                    alt=""
                    onClick={() => emblaZoomApi?.scrollTo(idx)}
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 1,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor:
                        idx === zoomSelectedIndex ? "#fff" : "transparent",
                      opacity: idx === zoomSelectedIndex ? 1 : 0.6,
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
