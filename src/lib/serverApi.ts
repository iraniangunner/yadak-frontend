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
  thumbnail_url: string | null;
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
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  images: { id: number; url: string }[];
  product_attributes: { id: number; name: string; value: string }[];
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

export async function getBrands() {
  const res = await serverFetch<{ data: ServerBrand[] }>("/brands", 300);
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

export async function getVehicles() {
  const res = await serverFetch<{ data: ServerVehicle[] }>(
    "/vehicles?per_page=300",
    300
  );
  return res?.data || [];
}
