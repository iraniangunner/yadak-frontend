"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ProductFilters } from "@/app/_components/shop/ProductFilterPanel";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/products/useProductFilters.ts
|--------------------------------------------------------------------------
| منطق مشترک خواندن/نوشتن فیلتر، مرتب‌سازی و صفحه‌بندی از/به URL.
|
| ⚠️ برند/مدل خودرو دیگه رابطه‌ی Vehicle نیستن - دو تا رشته‌ی مستقل و
| مسطح (vehicle_brand/vehicle_model) که مستقیم روی همون فیلد محصول
| فیلتر می‌کنن؛ کاملاً مستقل از هم AND می‌شن.
|
| فیلترهای دینامیک ویژگی (attributes) با پیشوند attr_ توی URL ذخیره
| می‌شن، مثلاً ?attr_جنس=فلزی&attr_محور=جلو.
*/

function parseCsv(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export function useProductFilters(options?: {
  basePath?: string;
  includeCategoryFilter?: boolean;
}) {
  const basePath = options?.basePath || "/category";
  const includeCategoryFilter = options?.includeCategoryFilter ?? true;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const perPage = Number(searchParams.get("per_page")) || 12;

  const attributes: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith("attr_") && value) {
      attributes[key.slice(5)] = value;
    }
  });

  const filters: ProductFilters = {
    category_ids: includeCategoryFilter
      ? parseCsv(searchParams.get("category_id"))
      : [],
    brand_ids: parseCsv(searchParams.get("brand_id")),
    vehicle_brands: parseCsv(searchParams.get("vehicle_brand")),
    vehicle_models: parseCsv(searchParams.get("vehicle_model")),
    stock_statuses: parseCsv(searchParams.get("stock_status")),
    min_rating: searchParams.get("min_rating") || "",
    attributes,
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    is_available: searchParams.get("is_available") === "1",
    is_discounted: searchParams.get("is_discounted") === "1",
  };

  const push = (params: URLSearchParams) => {
    router.push(`${pathname || basePath}?${params.toString()}`);
  };

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    push(params);
  };

  const updateFilters = (next: ProductFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    if (includeCategoryFilter) {
      params.delete("category_id");
      if (next.category_ids.length)
        params.set("category_id", next.category_ids.join(","));
    }
    params.delete("brand_id");
    params.delete("vehicle_brand");
    params.delete("vehicle_model");
    params.delete("stock_status");
    params.delete("min_rating");
    params.delete("min_price");
    params.delete("max_price");
    params.delete("is_available");
    params.delete("is_discounted");

    if (next.brand_ids.length) params.set("brand_id", next.brand_ids.join(","));
    if (next.vehicle_brands.length)
      params.set("vehicle_brand", next.vehicle_brands.join(","));
    if (next.vehicle_models.length)
      params.set("vehicle_model", next.vehicle_models.join(","));
    if (next.stock_statuses.length)
      params.set("stock_status", next.stock_statuses.join(","));
    if (next.min_rating) params.set("min_rating", next.min_rating);
    if (next.min_price) params.set("min_price", next.min_price);
    if (next.max_price) params.set("max_price", next.max_price);
    if (next.is_available) params.set("is_available", "1");
    if (next.is_discounted) params.set("is_discounted", "1");

    // پاک کردن همه‌ی attr_* قدیمی، بعد نوشتن مقادیر جدید
    Array.from(params.keys())
      .filter((k) => k.startsWith("attr_"))
      .forEach((k) => params.delete(k));
    Object.entries(next.attributes || {}).forEach(([name, value]) => {
      if (value) params.set(`attr_${name}`, value);
    });

    push(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (perPage !== 12) params.set("per_page", String(perPage));
    push(params);
  };

  const removeFromArrayFilter = (
    key:
      | "category_ids"
      | "brand_ids"
      | "vehicle_brands"
      | "vehicle_models"
      | "stock_statuses",
    value: string
  ) => {
    updateFilters({
      ...filters,
      [key]: filters[key].filter((v) => v !== value),
    });
  };

  const removeAttributeFilter = (name: string) => {
    const next = { ...filters.attributes };
    delete next[name];
    updateFilters({ ...filters, attributes: next });
  };

  const activeFilterCount =
    filters.category_ids.length +
    filters.brand_ids.length +
    filters.vehicle_brands.length +
    filters.vehicle_models.length +
    filters.stock_statuses.length +
    (filters.min_rating ? 1 : 0) +
    (filters.min_price || filters.max_price ? 1 : 0) +
    (filters.is_available ? 1 : 0) +
    (filters.is_discounted ? 1 : 0) +
    Object.keys(filters.attributes).length;

  return {
    search,
    sort,
    perPage,
    filters,
    setParam,
    updateFilters,
    clearFilters,
    removeFromArrayFilter,
    removeAttributeFilter,
    activeFilterCount,
  };
}
