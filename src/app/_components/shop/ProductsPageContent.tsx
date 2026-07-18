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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
} from "@mui/material";
import { FilterList, Close, ExpandMore } from "@mui/icons-material";
import { productsAPI, categoriesAPI, brandsAPI } from "@/lib/api";
import {
  ProductCard,
  ProductCardData,
} from "@/app/_components/shop/ProductCard";
import {
  ProductFilterPanel,
  ProductFilters,
} from "@/app/_components/shop/ProductFilterPanel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductsPageContent.tsx
|--------------------------------------------------------------------------
| فیلترها + مرتب‌سازی + تعداد در صفحه، همه با URL همگام می‌شن. صفحه‌بندی
| به‌صورت «نمایش بیشتر». فیلتر قیمت حذف شد.
*/

type Option = { id: number; name: string };

const sortOptions = [
  { value: "", label: "پیش‌فرض" },
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "rating", label: "بالاترین امتیاز" },
];

const perPageOptions = [12, 24, 48];

const stockStatusLabels: Record<string, string> = {
  available: "موجود",
  incoming: "در حال تأمین",
  stopped: "متوقف‌شده",
  out_of_stock: "ناموجود",
};

function parseCsv(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);

  const search = searchParams.get("search") || "";
  const vehicleId = searchParams.get("vehicle_id") || "";
  const sort = searchParams.get("sort") || "";
  const perPage = Number(searchParams.get("per_page")) || 12;

  const filters: ProductFilters = {
    category_ids: parseCsv(searchParams.get("category_id")),
    brand_ids: parseCsv(searchParams.get("brand_id")),
    stock_statuses: parseCsv(searchParams.get("stock_status")),
    min_rating: searchParams.get("min_rating") || "",
  };
  const filtersKey = JSON.stringify(filters);

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
          category_id: filters.category_ids.length
            ? filters.category_ids.join(",")
            : undefined,
          brand_id: filters.brand_ids.length
            ? filters.brand_ids.join(",")
            : undefined,
          stock_status: filters.stock_statuses.length
            ? filters.stock_statuses.join(",")
            : undefined,
          min_rating: filters.min_rating
            ? Number(filters.min_rating)
            : undefined,
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, vehicleId, filtersKey, sort, perPage]
  );

  useEffect(() => {
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, vehicleId, filtersKey, sort, perPage]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  const updateFilters = (next: ProductFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("category_id");
    params.delete("brand_id");
    params.delete("stock_status");
    params.delete("min_rating");

    if (next.category_ids.length)
      params.set("category_id", next.category_ids.join(","));
    if (next.brand_ids.length) params.set("brand_id", next.brand_ids.join(","));
    if (next.stock_statuses.length)
      params.set("stock_status", next.stock_statuses.join(","));
    if (next.min_rating) params.set("min_rating", next.min_rating);

    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (vehicleId) params.set("vehicle_id", vehicleId);
    if (sort) params.set("sort", sort);
    if (perPage !== 12) params.set("per_page", String(perPage));
    router.push(`/products?${params.toString()}`);
    setMobileFiltersOpen(false);
  };

  const removeFromArrayFilter = (
    key: "category_ids" | "brand_ids" | "stock_statuses",
    value: string
  ) => {
    updateFilters({
      ...filters,
      [key]: filters[key].filter((v) => v !== value),
    });
  };

  const activeFilterChips: {
    key: string;
    label: React.ReactNode;
    onDelete: () => void;
  }[] = [
    ...filters.category_ids.map((id) => ({
      key: `cat-${id}`,
      label: categories.find((c) => String(c.id) === id)?.name || id,
      onDelete: () => removeFromArrayFilter("category_ids", id),
    })),
    ...filters.brand_ids.map((id) => ({
      key: `brand-${id}`,
      label: brands.find((b) => String(b.id) === id)?.name || id,
      onDelete: () => removeFromArrayFilter("brand_ids", id),
    })),
    ...filters.stock_statuses.map((s) => ({
      key: `stock-${s}`,
      label: stockStatusLabels[s] || s,
      onDelete: () => removeFromArrayFilter("stock_statuses", s),
    })),
    ...(filters.min_rating
      ? [
          {
            key: "rating",
            label: (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span>ستاره و بالاتر</span>
                <Rating
                  value={Number(filters.min_rating)}
                  readOnly
                  size="small"
                  sx={{ fontSize: "0.9rem" }}
                />
              </Box>
            ),
            onDelete: () => updateFilters({ ...filters, min_rating: "" }),
          },
        ]
      : []),
  ];

  const activeFilterCount =
    filters.category_ids.length +
    filters.brand_ids.length +
    filters.stock_statuses.length +
    (filters.min_rating ? 1 : 0);

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
            width: 260,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 2.5,
            position: "sticky",
            top: 90,
            maxHeight: "calc(100vh - 110px)",
            overflowY: "auto",
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
          {/* Toolbar: فیلتر موبایل + تعداد نتایج + مرتب‌سازی + تعداد در صفحه + چیپ فیلترهای فعال */}
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              p: 1.5,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: { xs: "block", md: "none" } }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FilterList />}
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    فیلترها
                    {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {total.toLocaleString("fa-IR")} محصول
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>مرتب‌سازی</InputLabel>
                  <Select
                    label="مرتب‌سازی"
                    value={sort}
                    onChange={(e) => setParam("sort", e.target.value)}
                  >
                    {sortOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>تعداد در صفحه</InputLabel>
                  <Select
                    label="تعداد در صفحه"
                    value={String(perPage)}
                    onChange={(e) => setParam("per_page", e.target.value)}
                  >
                    {perPageOptions.map((n) => (
                      <MenuItem key={n} value={String(n)}>
                        {n} محصول
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* چیپ فیلترهای فعال - همون داخل Toolbar */}
            {activeFilterChips.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                {activeFilterChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    size="small"
                    onDelete={chip.onDelete}
                  />
                ))}
                <Chip
                  label="پاک کردن همه"
                  size="small"
                  variant="outlined"
                  onClick={clearFilters}
                />
              </Box>
            )}
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
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={280}
                  sx={{ borderRadius: 3 }}
                />
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

      <Drawer
        anchor="bottom"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      >
        <Box sx={{ p: 3, maxHeight: "80vh", overflowY: "auto" }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
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
