"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductFilters } from "@/app/_components/shop/ProductFilterPanel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/useProductFilters.ts
|--------------------------------------------------------------------------
| منطق مشترک خواندن/نوشتن فیلتر، مرتب‌سازی و صفحه‌بندی از/به URL - بین
| چندتا کامپوننت کوچیک (سایدبار، دکمه‌ی موبایل، چیپ‌ها، Toolbar) به
| اشتراک گذاشته می‌شه، بدون نیاز به state مشترک (چون همه از خودِ URL
| می‌خونن).
*/

function parseCsv(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export function useProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const activeFilterCount =
    filters.category_ids.length +
    filters.brand_ids.length +
    filters.stock_statuses.length +
    (filters.min_rating ? 1 : 0);

  return {
    search,
    vehicleId,
    sort,
    perPage,
    filters,
    setParam,
    updateFilters,
    clearFilters,
    removeFromArrayFilter,
    activeFilterCount,
  };
}
