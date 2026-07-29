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
import { BlogCard } from "@/app/_components/shop/blog/BlogCard";
import type { getArticles } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/TipsSection.tsx
|--------------------------------------------------------------------------
| هم‌ساختار با BestSellers/NewestProductsSection (overline+عنوان+دکمه‌ی
| مشاهده‌ی همه + کاروسل Embla با فلش شناور)، ولی برای کارت هر مقاله
| مستقیم از همون BlogCard.tsx موجود استفاده می‌کنه (نه یه مارک‌آپ
| جداگونه) - تا دقیقاً هم‌ظاهر با بقیه‌ی جاهایی که مقاله نشون داده می‌شه.
*/
type Article = Awaited<ReturnType<typeof getArticles>>[number];

export function TipsSection({ articles }: { articles: Article[] }) {
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

  if (articles.length === 0) return null;

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
            مجله
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            لایف‌هک و نکات نگهداری خودرو
          </Typography>
        </Box>
        <Button
          component={NextLink}
          href="/blog"
          endIcon={<ArrowBackIos sx={{ fontSize: "0.8rem" }} />}
        >
          مشاهده‌ی همه
        </Button>
      </Box>

      <Box sx={{ position: "relative" }}>
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {articles.map((article) => (
              <Box key={article.id} sx={{ flex: "0 0 auto", width: 290 }}>
                <BlogCard article={article} />
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
