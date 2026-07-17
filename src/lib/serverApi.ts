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
  revalidateSeconds = 60,
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
  thumbnail_url: string | null;
};
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
  const res = await serverFetch<{ data: ServerProduct[]; total: number }>(
    `/products?${params}`,
    revalidateSeconds,
  );
  return { data: res?.data || [], total: res?.total || 0 };
}

export async function getArticles(perPage = 3) {
  const res = await serverFetch<{ data: ServerArticle[] }>(
    `/articles?per_page=${perPage}`,
    300,
  );
  return res?.data || [];
}

export async function getVehicles() {
  const res = await serverFetch<{ data: ServerVehicle[] }>(
    "/vehicles?per_page=300",
    300,
  );
  return res?.data || [];
}
