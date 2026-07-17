"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Skeleton,
  Drawer,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import { FilterList, Close, ExpandMore } from "@mui/icons-material";
import { productsAPI, categoriesAPI, brandsAPI } from "@/lib/api";
import { ProductCard, ProductCardData } from "@/app/_components/shop/ProductCard";
import { ProductFilterPanel, ProductFilters } from "@/app/_components/shop/ProductFilterPanel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductsPageContent.tsx
|--------------------------------------------------------------------------
| فیلترها با URL همگام می‌شن (قابل اشتراک‌گذاری/بازگشت با دکمه‌ی back).
| صفحه‌بندی به‌صورت «نمایش بیشتر» (نه شماره صفحه) - هر بار صفحه‌ی بعد به
| لیست موجود اضافه می‌شه.
*/

type Option = { id: number; name: string };

const PER_PAGE = 12;

export function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);

  const search = searchParams.get("search") || "";
  const vehicleId = searchParams.get("vehicle_id") || "";
  const filters: ProductFilters = {
    category_id: searchParams.get("category_id") || "",
    brand_id: searchParams.get("brand_id") || "",
    stock_status: searchParams.get("stock_status") || "",
  };

  useEffect(() => {
    categoriesAPI.list().then((res) => setCategories(res.data.data));
    brandsAPI.list().then((res) => setBrands(res.data.data));
  }, []);

  const fetchProducts = useCallback(
    (pageToFetch: number, append: boolean) => {
      const setLoading = append ? setIsLoadingMore : setIsLoadingInitial;
      setLoading(true);

      productsAPI
        .list({
          search: search || undefined,
          vehicle_id: vehicleId ? Number(vehicleId) : undefined,
          category_id: filters.category_id ? Number(filters.category_id) : undefined,
          brand_id: filters.brand_id ? Number(filters.brand_id) : undefined,
          stock_status: filters.stock_status || undefined,
          page: pageToFetch,
          per_page: PER_PAGE,
        })
        .then((res) => {
          const newItems: ProductCardData[] = res.data.data;
          setProducts((prev) => (append ? [...prev, ...newItems] : newItems));
          setHasMore(pageToFetch < res.data.last_page);
          setPage(pageToFetch);
        })
        .finally(() => setLoading(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, vehicleId, filters.category_id, filters.brand_id, filters.stock_status]
  );

  useEffect(() => {
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, vehicleId, filters.category_id, filters.brand_id, filters.stock_status]);

  const updateFilters = (next: ProductFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    (Object.keys(next) as (keyof ProductFilters)[]).forEach((key) => {
      if (next[key]) params.set(key, next[key]);
      else params.delete(key);
    });
    router.push(`/products?${params.toString()}`);
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (vehicleId) params.set("vehicle_id", vehicleId);
    router.push(`/products?${params.toString()}`);
    setMobileFiltersOpen(false);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        محصولات
      </Typography>
      {search && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          نتایج جستجو برای «{search}»
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 240,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 2.5,
            position: "sticky",
            top: 90,
          }}
        >
          <ProductFilterPanel
            filters={filters}
            categories={categories}
            brands={brands}
            onChange={updateFilters}
            onClear={clearFilters}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setMobileFiltersOpen(true)}
            >
              فیلترها
              {activeFilterCount > 0 && (
                <Chip label={activeFilterCount} size="small" color="primary" sx={{ mr: 1, height: 20 }} />
              )}
            </Button>
          </Box>

          {isLoadingInitial ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 2,
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: 3 }} />
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
              <Typography color="text.secondary">محصولی با این فیلتر پیدا نشد</Typography>
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
                    onClick={() => fetchProducts(page + 1, true)}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "در حال بارگذاری..." : "نمایش بیشتر"}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      <Drawer anchor="bottom" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <Box sx={{ p: 3, maxHeight: "80vh", overflowY: "auto" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>فیلترها</Typography>
            <IconButton onClick={() => setMobileFiltersOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
          <ProductFilterPanel
            filters={filters}
            categories={categories}
            brands={brands}
            onChange={updateFilters}
            onClear={clearFilters}
          />
        </Box>
      </Drawer>
    </Container>
  );
}