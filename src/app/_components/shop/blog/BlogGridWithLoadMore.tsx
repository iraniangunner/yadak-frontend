"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { articlesAPI } from "@/lib/api";
import { BlogCard } from "@/app/_components/shop/blog/BlogCard";
import { BlogCardSkeleton } from "@/app/_components/shop/blog/BlogCardSkeleton";
import { ServerArticle } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/blog/BlogGridWithLoadMore.tsx
|--------------------------------------------------------------------------
| دقیقاً هم‌الگو با ProductGridWithLoadMore واقعی: صفحه‌ی اول از سرور
| (SSR) میاد و مستقیم state اولیه می‌شه - هیچ fetch اضافه‌ای موقع لود
| اول انجام نمی‌شه (isFirstRun این رو تضمین می‌کنه). فقط وقتی جستجو/
| مرتب‌سازی از سمت کلاینت عوض بشه، isLoadingInitial=true می‌شه و
| Skeleton نشون داده می‌شه تا جواب برسه.
*/

const PER_PAGE = 9;

export function BlogGridWithLoadMore({
  initialArticles,
  initialTotal,
  initialLastPage,
}: {
  initialArticles: ServerArticle[];
  initialTotal: number;
  initialLastPage: number;
}) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";

  const [articles, setArticles] = useState(initialArticles);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialLastPage > 1);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isFirstRun = useRef(true);

  const fetchPage = (pageToFetch: number, append: boolean) => {
    const setLoading = append ? setIsLoadingMore : setIsLoadingInitial;
    setLoading(true);

    articlesAPI
      .list({
        search: search || undefined,
        sort: sort || undefined,
        page: pageToFetch,
        per_page: PER_PAGE,
      })
      .then((res) => {
        const newItems: ServerArticle[] = res.data.data;
        setArticles((prev) => (append ? [...prev, ...newItems] : newItems));
        setTotal(res.data.total);
        setHasMore(pageToFetch < res.data.last_page);
        setPage(pageToFetch);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {total.toLocaleString("fa-IR")} مقاله
      </Typography>

      {isLoadingInitial ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 2.5,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </Box>
      ) : articles.length === 0 ? (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 5,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">مقاله‌ای پیدا نشد</Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2.5,
            }}
          >
            {articles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </Box>

          {hasMore && (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                endIcon={<ExpandMore />}
                onClick={() => fetchPage(page + 1, true)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "در حال بارگذاری..." : "نمایش بیشتر"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
