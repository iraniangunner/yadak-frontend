"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { articlesAPI } from "@/lib/api";
import { BlogCard } from "@/app/_components/shop/blog/BlogCard";
import { BlogCardSkeleton } from "@/app/_components/shop/blog/BlogCardSkeleton";
import { ServerArticle } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/blog/BlogFilterAndGrid.tsx
|--------------------------------------------------------------------------
| فیلتر (جستجو/مرتب‌سازی) و گرید+نمایش‌بیشتر رو با هم ترکیب کردیم (به‌جای
| دو کامپوننت جدا) چون هر دو باید یه isPending مشترک رو ببینن: وقتی
| فیلتر عوض می‌شه، router.push داخل startTransition اجرا می‌شه، و تا
| وقتی جواب تازه‌ی SSR برسه، Skeleton نشون داده می‌شه.
*/

const sortOptions = [
  { value: "", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
];

const PER_PAGE = 9;

export function BlogFilterAndGrid({
  initialArticles,
  initialTotal,
  initialLastPage,
}: {
  initialArticles: ServerArticle[];
  initialTotal: number;
  initialLastPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlSearch = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const [search, setSearch] = useState(urlSearch);

  const [articles, setArticles] = useState(initialArticles);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialLastPage > 1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

   
    startTransition(() => {
      router.push(`/blog?${params.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", search.trim());
  };

  const fetchMore = () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;

    articlesAPI
      .list({
        search: urlSearch || undefined,
        sort: sort || undefined,
        page: nextPage,
        per_page: PER_PAGE,
      })
      .then((res) => {
        setArticles((prev) => [...prev, ...res.data.data]);
        setTotal(res.data.total);
        setHasMore(nextPage < res.data.last_page);
        setPage(nextPage);
      })
      .finally(() => setIsLoadingMore(false));
  };

  return (
    <Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          p: 1.5,
          mb: 3,
        }}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در مقالات..."
          size="small"
          sx={{ flex: "1 1 220px" }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton type="submit" size="small" edge="start">
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearch("");
                      updateParam("search", "");
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>مرتب‌سازی</InputLabel>
          <Select
            label="مرتب‌سازی"
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isPending ? (
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
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {total.toLocaleString("fa-IR")} مقاله
          </Typography>

          {articles.length === 0 ? (
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
                    endIcon={<ExpandMoreIcon />}
                    onClick={fetchMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "در حال بارگذاری..." : "نمایش بیشتر"}
                  </Button>
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}
