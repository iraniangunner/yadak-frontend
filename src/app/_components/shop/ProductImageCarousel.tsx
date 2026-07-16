"use client";

import { useState } from "react";
import { Box, IconButton, Dialog, Backdrop } from "@mui/material";
import { ZoomIn, Close, ChevronRight, ChevronLeft } from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductImageCarousel.tsx
|--------------------------------------------------------------------------
*/

export function ProductImageCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const safeImages = images.length > 0 ? images : [""];

  const goNext = () => setActiveIndex((i) => (i + 1) % safeImages.length);
  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + safeImages.length) % safeImages.length);

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.default",
          cursor: "zoom-in",
          aspectRatio: "1 / 1",
        }}
        onClick={() => setZoomOpen(true)}
      >
        <Box
          component="img"
          src={safeImages[activeIndex] || undefined}
          alt=""
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            bottom: 12,
            left: 12,
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
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              sx={{
                position: "absolute",
                top: "50%",
                right: 8,
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              sx={{
                position: "absolute",
                top: "50%",
                left: 8,
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {safeImages.length > 1 && (
        <Box sx={{ display: "flex", gap: 1, mt: 1.5, overflowX: "auto" }}>
          {safeImages.map((img, idx) => (
            <Box
              key={idx}
              component="img"
              src={img || undefined}
              alt=""
              onClick={() => setActiveIndex(idx)}
              sx={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 2,
                flexShrink: 0,
                cursor: "pointer",
                border: "2px solid",
                borderColor:
                  idx === activeIndex ? "primary.main" : "transparent",
                bgcolor: "background.default",
              }}
            />
          ))}
        </Box>
      )}

      <Dialog
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        maxWidth="lg"
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,0.9)" } } }}
      >
        <Box sx={{ position: "relative", bgcolor: "#000" }}>
          <IconButton
            onClick={() => setZoomOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              color: "#fff",
              zIndex: 1,
            }}
          >
            <Close />
          </IconButton>
          <Box
            component="img"
            src={safeImages[activeIndex] || undefined}
            alt=""
            sx={{
              width: "100%",
              maxHeight: "85vh",
              objectFit: "contain",
              display: "block",
            }}
          />
          {safeImages.length > 1 && (
            <>
              <IconButton
                onClick={goPrev}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 8,
                  color: "#fff",
                }}
              >
                <ChevronRight />
              </IconButton>
              <IconButton
                onClick={goNext}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 8,
                  color: "#fff",
                }}
              >
                <ChevronLeft />
              </IconButton>
            </>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
