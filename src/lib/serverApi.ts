/*
|--------------------------------------------------------------------------
| مسیر فایل: src/lib/serverApi.ts
|--------------------------------------------------------------------------
| برخلاف api.ts (که axios سمت کلاینت با interceptor توکنه)، این فایل برای
| Server Component هاست - مستقیم با fetch بومی Next.js به بک‌اند وصل می‌شه.
| فقط برای endpoint های عمومی (بدون نیاز به لاگین) استفاده می‌شه.
|
| { next: { revalidate: N } } یعنی نتیجه تا N ثانیه کش می‌شه (ISR) - برای
| صفحه‌ای مثل هومپیج که مدام رفرش نمی‌خواد، این عملکرد رو خیلی بهتر می‌کنه.
*/

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function serverFetch<T>(
  path: string,
  revalidateSeconds = 60
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export type ServerCategory = {
  id: number;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  parent_id: number | null;
};

/**
 * پیدا کردن یه دسته با slug، از بین کل لیست دسته‌بندی‌ها (چون بک‌اند
 * endpoint جدای «یه دسته با slug» نداره - و چون تعداد دسته‌ها معمولاً کمه،
 * فیلتر کردن سمت سرور روی خروجی /categories کاملاً کافیه).
 */
export function findCategoryBySlug(
  categories: ServerCategory[],
  slug: string
): ServerCategory | null {
  return categories.find((c) => c.slug === slug) || null;
}

export function findBrandBySlug(
  brands: ServerBrand[],
  slug: string
): ServerBrand | null {
  return brands.find((b) => b.slug === slug) || null;
}

/**
 * همه‌ی شناسه‌های زیرمجموعه (تا هر عمقی) + خودِ دسته - برای اینکه صفحه‌ی
 * دسته‌بندی محصولات زیرمجموعه‌ها رو هم نشون بده، نه فقط همون یه دسته‌ی دقیق.
 */
export function getCategoryAndDescendantIds(
  categories: ServerCategory[],
  categoryId: number
): number[] {
  const children = categories.filter((c) => c.parent_id === categoryId);
  let ids = [categoryId];
  for (const child of children) {
    ids = ids.concat(getCategoryAndDescendantIds(categories, child.id));
  }
  return ids;
}
export type ServerBrand = {
  id: number;
  name: string;
  slug: string;
  thumbnail_url: string | null;
};
export type ServerBanner = {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string | null;
  product: { id: number; slug: string } | null;
};
export type ServerProduct = {
  id: number;
  slug: string;
  title: string;
  price: number;
  final_price: number;
  compare_price: number | null;
  stock_status: string;
  thumbnail_url: string | null;
};
export type ServerArticle = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  created_at: string;
  author?: { id: number; name: string } | null;
  products?: ServerProduct[];
};
export type ServerVehicle = {
  id: number;
  brand: string;
  model: string;
  generation: string | null;
  year_from: number | null;
  year_to: number | null;
};

export type ServerProductDetail = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  final_price: number;
  compare_price: number | null;
  stock_status: string;
  thumbnail_url: string | null;
  average_rating: number | null;
  reviews_count: number;
  category: { id: number; name: string; slug: string } | null;
  brand: { id: number; name: string } | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_type: string | null;
  images: { id: number; url: string }[];
  product_attributes: { id: number; name: string; value: string }[];
  price_tiers: {
    id: number;
    min_quantity: number;
    max_quantity: number | null;
    price: number;
  }[];
};

export async function getProduct(
  slug: string
): Promise<ServerProductDetail | null> {
  const res = await serverFetch<{ product: ServerProductDetail }>(
    `/products/${slug}`,
    30
  );
  return res?.product || null;
}

export async function getCategories() {
  const res = await serverFetch<{ data: ServerCategory[] }>("/categories", 300);
  return res?.data || [];
}

export async function getBrands(categoryIds?: number[]) {
  const query = categoryIds?.length
    ? `?category_id=${categoryIds.join(",")}`
    : "";
  const res = await serverFetch<{ data: ServerBrand[] }>(
    `/brands${query}`,
    300
  );
  return res?.data || [];
}

export async function getBanners() {
  const res = await serverFetch<{ data: ServerBanner[] }>("/banners", 120);
  return res?.data || [];
}

export async function getProducts(params: string, revalidateSeconds = 60) {
  const res = await serverFetch<{
    data: ServerProduct[];
    total: number;
    last_page: number;
    current_page: number;
  }>(`/products?${params}`, revalidateSeconds);
  return {
    data: res?.data || [],
    total: res?.total || 0,
    lastPage: res?.last_page || 1,
    currentPage: res?.current_page || 1,
  };
}

export async function getArticles(perPage = 3) {
  const res = await serverFetch<{ data: ServerArticle[] }>(
    `/articles?per_page=${perPage}`,
    300
  );
  return res?.data || [];
}

/**
 * برای صفحه‌ی لیست کامل مقالات (/articles) - با جستجو/مرتب‌سازی/صفحه‌بندی،
 * دقیقاً هم‌الگو با getProducts.
 */
export async function getArticlesFiltered(
  params: string,
  revalidateSeconds = 60
) {
  const res = await serverFetch<{
    data: ServerArticle[];
    total: number;
    last_page: number;
  }>(`/articles?${params}`, revalidateSeconds);
  return {
    data: res?.data || [],
    total: res?.total || 0,
    lastPage: res?.last_page || 1,
  };
}

export async function getArticle(slug: string): Promise<ServerArticle | null> {
  const res = await serverFetch<{ article: ServerArticle }>(
    `/articles/${slug}`,
    60
  );
  return res?.article || null;
}

export type FilterableAttribute = { name: string; values: string[] };

export async function getFilterableAttributes(
  categoryIds: number[]
): Promise<FilterableAttribute[]> {
  if (categoryIds.length === 0) return [];
  const res = await serverFetch<{ data: FilterableAttribute[] }>(
    `/products/filterable-attributes?category_id=${categoryIds.join(",")}`,
    60
  );
  return res?.data || [];
}

export async function getVehicles(categoryIds?: number[]) {
  const categoryQuery = categoryIds?.length
    ? `&category_id=${categoryIds.join(",")}`
    : "";
  const res = await serverFetch<{ data: ServerVehicle[] }>(
    `/vehicles?per_page=300${categoryQuery}`,
    300
  );
  return res?.data || [];
}

/**
 * برند/مدل‌های خودروی موجود - بر اساس فیلدهای مستقیم vehicle_brand/
 * vehicle_model روی خودِ محصولات (نه رابطه‌ی قدیمی Vehicle). برای فیلتر
 * صفحه‌ی دسته‌بندی استفاده می‌شه.
 */
export type VehicleFilterOptions = { brands: string[]; models: string[] };

export async function getVehicleFilterOptions(
  categoryIds?: number[],
  brandIds?: number[]
): Promise<VehicleFilterOptions> {
  const params = new URLSearchParams();
  if (categoryIds?.length) params.set("category_id", categoryIds.join(","));
  if (brandIds?.length) params.set("brand_id", brandIds.join(","));
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await serverFetch<VehicleFilterOptions>(
    `/products/vehicle-filter-options${query}`,
    60
  );
  return res || { brands: [], models: [] };
}
