"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { productsAPI } from "@/lib/api";
import {
  ProductCard,
  ProductCardData,
} from "@/app/_components/shop/ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { useProductFilters } from "@/hooks/useProductFilters";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/ProductGridWithLoadMore.tsx
|--------------------------------------------------------------------------
| صفحه‌ی اول از سرور (SSR) میاد و مستقیم به‌عنوان state اولیه استفاده
| می‌شه - هیچ fetch اضافه‌ای موقع لود اول صفحه انجام نمی‌شه. فقط وقتی
| فیلتر/مرتب‌سازی/تعداد در صفحه از سمت کلاینت عوض بشه، دوباره (این‌بار
| کلاینتی) از صفحه‌ی ۱ می‌گیره. دکمه‌ی «نمایش بیشتر» هم صرفاً کلاینتیه.
*/

export function ProductGridWithLoadMore({
  initialProducts,
  initialTotal,
  initialLastPage,
  fixedCategoryIds,
  basePath,
  showCategoryFilter = true,
}: {
  initialProducts: ProductCardData[];
  initialTotal: number;
  initialLastPage: number;
  fixedCategoryIds?: number[];
  basePath?: string;
  showCategoryFilter?: boolean;
}) {
  const { search, vehicleId, filters, sort, perPage } = useProductFilters({
    basePath,
    includeCategoryFilter: showCategoryFilter,
  });
  const filtersKey = JSON.stringify(filters);

  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialLastPage > 1);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isFirstRun = useRef(true);

  const fetchPage = (pageToFetch: number, append: boolean) => {
    const setLoading = append ? setIsLoadingMore : setIsLoadingInitial;
    setLoading(true);

    productsAPI
      .list({
        search: search || undefined,
        vehicle_id: vehicleId ? Number(vehicleId) : undefined,
        category_id: fixedCategoryIds?.length
          ? fixedCategoryIds.join(",")
          : filters.category_ids.length
          ? filters.category_ids.join(",")
          : undefined,
        brand_id: filters.brand_ids.length
          ? filters.brand_ids.join(",")
          : undefined,
        stock_status: filters.stock_statuses.length
          ? filters.stock_statuses.join(",")
          : undefined,
        min_rating: filters.min_rating ? Number(filters.min_rating) : undefined,
        sort: sort || undefined,
        page: pageToFetch,
        per_page: perPage,
      } as any)
      .then((res) => {
        const newItems: ProductCardData[] = res.data.data;
        setProducts((prev) => (append ? [...prev, ...newItems] : newItems));
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
  }, [search, vehicleId, filtersKey, sort, perPage]);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {total.toLocaleString("fa-IR")} محصول
      </Typography>

      {isLoadingInitial ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 2,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </Box>
      ) : products.length === 0 ? (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 5,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            محصولی با این فیلتر پیدا نشد
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 2,
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
