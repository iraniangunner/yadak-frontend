import axios, { InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

declare module "axios" {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    requiresAuth?: boolean;
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: API_URL, // مثلاً http://yadaki.test/api
});

// ----------------------
// Request Interceptor
// ----------------------
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.requiresAuth) {
    try {
      // مسیر واقعی: app/api/token/route.ts
      const res = await fetch("/api/token");
      const data = await res.json();

      if (data.token) {
        config.headers.set("Authorization", `Bearer ${data.token}`);
      }
    } catch (err) {
      console.error("Error fetching token:", err);
    }
  }
  return config;
});

// ----------------------
// Response Interceptor (Token Refresh)
// ----------------------
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register") ||
      originalRequest.url?.includes("/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // مسیر واقعی: app/api/refresh/route.ts
      const res = await fetch("/api/refresh-token", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error("Refresh failed");
      }

      const newToken = data.access_token;

      processQueue(null, newToken);
      isRefreshing = false;

      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      isRefreshing = false;

      window.dispatchEvent(new Event("auth:logout"));

      return Promise.reject(err);
    }
  }
);

export default api;

// ----------------------
// Auth
// ----------------------
export const authAPI = {
  me: () => api.get("/me", { requiresAuth: true }),
  updateProfile: (payload: { name?: string; email?: string; city?: string }) =>
    api.put("/me", payload, { requiresAuth: true }),
  logout: () => api.post("/logout", {}, { requiresAuth: true }),
};

// ----------------------
// عمومی (بدون نیاز به لاگین) - محصول/برند/دسته/خودرو
// ----------------------
export const brandsAPI = {
  list: (params?: { with_inactive?: boolean; per_page?: number }) =>
    api.get("/brands", { params }),
};

export const categoriesAPI = {
  list: (params?: { tree?: boolean; with_inactive?: boolean }) =>
    api.get("/categories", { params }),
};

export const vehiclesAPI = {
  list: (params?: {
    search?: string;
    with_inactive?: boolean;
    per_page?: number;
    page?: number;
  }) => api.get("/vehicles", { params }),
};

export const productsAPI = {
  list: (params?: {
    vehicle_id?: number;
    category_id?: string; // چندتایی: "1,2,3"
    brand_id?: string; // چندتایی: "1,2,3"
    stock_status?: string; // چندتایی: "available,incoming"
    min_rating?: number;
    sort?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }) => api.get("/products", { params }),
  show: (slug: string) => api.get(`/products/${slug}`),
  priceForQuantity: (id: number, quantity: number) =>
    api.get(`/products/${id}/price-for-quantity`, { params: { quantity } }),
  subscribeStock: (id: number, payload?: { mobile?: string }) =>
    api.post(`/products/${id}/stock-subscribe`, payload ?? {}),
};

export const favoritesAPI = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get("/favorites", { params, requiresAuth: true }),
  add: (productId: number) =>
    api.post(`/products/${productId}/favorite`, {}, { requiresAuth: true }),
  remove: (productId: number) =>
    api.delete(`/products/${productId}/favorite`, { requiresAuth: true }),
};

export const productReviewsAPI = {
  list: (productId: number, params?: { page?: number; per_page?: number }) =>
    api.get(`/products/${productId}/reviews`, { params }),
  create: (productId: number, payload: { rating: number; comment?: string }) =>
    api.post(`/products/${productId}/reviews`, payload, { requiresAuth: true }),
  remove: (productId: number) =>
    api.delete(`/products/${productId}/reviews`, { requiresAuth: true }),
};

// ----------------------
// مقالات و بنر
// ----------------------
export const articlesAPI = {
  list: (params?: { per_page?: number }) => api.get("/articles", { params }),
  show: (slug: string) => api.get(`/articles/${slug}`),
};

export const bannersAPI = {
  list: (params?: { with_inactive?: boolean }) =>
    api.get("/banners", { params }),
};

// ----------------------
// ارسال (تخمین هزینه + گزینه‌های حمل)
// ----------------------
export const shippingAPI = {
  estimate: (payload: {
    city: string;
    items: { product_id: number; quantity: number }[];
  }) => api.post("/shipping/estimate", payload),
  options: (payload: {
    city: string;
    items: { product_id: number; quantity: number }[];
  }) => api.post("/shipping/options", payload),
};

// ----------------------
// آدرس‌های مشتری (نیاز به لاگین)
// ----------------------
export const addressesAPI: any = {
  list: () => api.get("/addresses", { requiresAuth: true }),
  create: (payload: {
    title?: string;
    receiver_name: string;
    receiver_phone: string;
    province?: string;
    city: string;
    full_address: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    is_default?: boolean;
  }) => api.post("/addresses", payload, { requiresAuth: true }),
  update: (
    id: number,
    payload: Partial<Parameters<typeof addressesAPI.create>[0]>
  ) => api.put(`/addresses/${id}`, payload, { requiresAuth: true }),
  delete: (id: number) =>
    api.delete(`/addresses/${id}`, { requiresAuth: true }),
};

// ----------------------
// خودروهای مشتری (نیاز به لاگین)
// ----------------------
export const myVehiclesAPI = {
  list: () => api.get("/my-vehicles", { requiresAuth: true }),
  add: (vehicle_id: number) =>
    api.post("/my-vehicles", { vehicle_id }, { requiresAuth: true }),
  remove: (vehicleId: number) =>
    api.delete(`/my-vehicles/${vehicleId}`, { requiresAuth: true }),
};

// ----------------------
// سفارش‌ها (نیاز به لاگین)
// ----------------------
export const ordersAPI = {
  list: (params?: { per_page?: number; page?: number }) =>
    api.get("/orders", { params, requiresAuth: true }),
  show: (id: number) => api.get(`/orders/${id}`, { requiresAuth: true }),
  create: (payload: {
    items: { product_id: number; quantity: number }[];
    customer_note?: string;
    coupon_code?: string;
    referral_code?: string;
    shipping_address_id?: number;
    shipping_carrier?: string;
    shipping_service_name?: string;
  }) => api.post("/orders", payload, { requiresAuth: true }),
  confirm: (id: number) =>
    api.post(`/orders/${id}/confirm`, {}, { requiresAuth: true }),
  cancel: (id: number) =>
    api.post(`/orders/${id}/cancel`, {}, { requiresAuth: true }),
  pay: (id: number) =>
    api.post(`/orders/${id}/pay`, {}, { requiresAuth: true }),
};

// ----------------------
// مرجوعی (نیاز به لاگین)
// ----------------------
export const returnsAPI = {
  list: () => api.get("/returns", { requiresAuth: true }),
  request: (
    orderId: number,
    payload: { order_item_id: number; quantity: number; reason: string }
  ) => api.post(`/orders/${orderId}/returns`, payload, { requiresAuth: true }),
};

// ----------------------
// پنل ادمین
// ----------------------
export const newsletterAPI = {
  subscribe: (email: string) => api.post("/newsletter/subscribe", { email }),
};

export const couponCheckAPI = {
  check: (code: string, subtotal: number) =>
    api.post("/coupons/check", { code, subtotal }, { requiresAuth: true }),
};

export const referralCodeCheckAPI = {
  check: (code: string) =>
    api.post("/referral-codes/check", { code }, { requiresAuth: true }),
};

export const myReferralAPI = {
  code: () => api.get("/my/referral-code", { requiresAuth: true }),
  commissions: (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }) => api.get("/my/referral-commissions", { params, requiresAuth: true }),
};

export const adminAPI = {
  // جستجوی کاربر (برای فرم‌هایی مثل انتخاب صاحب کد معرف)
  users: {
    search: (query: string) =>
      api.get("/admin/users/search", { params: { query }, requiresAuth: true }),
  },

  // مدیریت کارمندان
  staff: {
    list: (params?: { per_page?: number }) =>
      api.get("/staff", { params, requiresAuth: true }),
    create: (payload: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      role: string;
    }) => api.post("/staff", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/staff/${id}`, payload, { requiresAuth: true }),
    delete: (id: number) => api.delete(`/staff/${id}`, { requiresAuth: true }),
  },

  // برند/دسته/خودرو
  brands: {
    create: (payload: FormData) =>
      api.post("/admin/brands", payload, { requiresAuth: true }),
    update: (id: number, payload: FormData) =>
      api.post(`/admin/brands/${id}?_method=PUT`, payload, {
        requiresAuth: true,
      }),
    delete: (id: number) =>
      api.delete(`/admin/brands/${id}`, { requiresAuth: true }),
  },
  categories: {
    create: (payload: FormData) =>
      api.post("/admin/categories", payload, { requiresAuth: true }),
    update: (id: number, payload: FormData) =>
      api.post(`/admin/categories/${id}?_method=PUT`, payload, {
        requiresAuth: true,
      }),
    delete: (id: number) =>
      api.delete(`/admin/categories/${id}`, { requiresAuth: true }),
  },
  vehicles: {
    create: (payload: any) =>
      api.post("/admin/vehicles", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/admin/vehicles/${id}`, payload, { requiresAuth: true }),
    delete: (id: number) =>
      api.delete(`/admin/vehicles/${id}`, { requiresAuth: true }),
  },

  // محصول
  products: {
    list: (params?: {
      category_id?: number;
      brand_id?: number;
      stock_status?: string;
      is_active?: boolean;
      search?: string;
      per_page?: number;
      page?: number;
    }) => api.get("/admin/products", { params, requiresAuth: true }),
    get: (id: number) =>
      api.get(`/admin/products/${id}`, { requiresAuth: true }),
    create: (payload: FormData) =>
      api.post("/admin/products", payload, { requiresAuth: true }),
    update: (id: number, payload: FormData) =>
      api.post(`/admin/products/${id}?_method=PUT`, payload, {
        requiresAuth: true,
      }),
    delete: (id: number) =>
      api.delete(`/admin/products/${id}`, { requiresAuth: true }),
    deleteImage: (productId: number, imageId: number) =>
      api.delete(`/admin/products/${productId}/images/${imageId}`, {
        requiresAuth: true,
      }),
    priceTiers: {
      create: (
        productId: number,
        payload: {
          min_quantity: number;
          max_quantity: number | null;
          price: number;
        }
      ) =>
        api.post(`/admin/products/${productId}/price-tiers`, payload, {
          requiresAuth: true,
        }),
      update: (
        productId: number,
        tierId: number,
        payload: Partial<{
          min_quantity: number;
          max_quantity: number | null;
          price: number;
        }>
      ) =>
        api.put(`/admin/products/${productId}/price-tiers/${tierId}`, payload, {
          requiresAuth: true,
        }),
      delete: (productId: number, tierId: number) =>
        api.delete(`/admin/products/${productId}/price-tiers/${tierId}`, {
          requiresAuth: true,
        }),
    },
    attributes: {
      create: (
        productId: number,
        payload: { name: string; value: string; sort_order?: number }
      ) =>
        api.post(`/admin/products/${productId}/attributes`, payload, {
          requiresAuth: true,
        }),
      update: (
        productId: number,
        attributeId: number,
        payload: Partial<{ name: string; value: string; sort_order: number }>
      ) =>
        api.put(
          `/admin/products/${productId}/attributes/${attributeId}`,
          payload,
          {
            requiresAuth: true,
          }
        ),
      delete: (productId: number, attributeId: number) =>
        api.delete(`/admin/products/${productId}/attributes/${attributeId}`, {
          requiresAuth: true,
        }),
    },
  },

  // تخفیف
  discounts: {
    list: (params?: { discountable_type?: string; per_page?: number }) =>
      api.get("/admin/discounts", { params, requiresAuth: true }),
    create: (payload: {
      discountable_type: "product" | "category" | "brand";
      discountable_id: number;
      type: "percentage" | "fixed";
      value: number;
      starts_at?: string;
      ends_at?: string;
      is_active?: boolean;
    }) => api.post("/admin/discounts", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/admin/discounts/${id}`, payload, { requiresAuth: true }),
    delete: (id: number) =>
      api.delete(`/admin/discounts/${id}`, { requiresAuth: true }),
  },

  // کد تخفیف سبد خرید
  coupons: {
    list: (params?: { is_active?: boolean; per_page?: number }) =>
      api.get("/admin/coupons", { params, requiresAuth: true }),
    create: (payload: {
      code: string;
      type: "percentage" | "fixed";
      value: number;
      min_cart_amount?: number;
      max_discount_amount?: number;
      usage_limit?: number;
      usage_limit_per_user?: number;
      starts_at?: string;
      ends_at?: string;
    }) => api.post("/admin/coupons", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/admin/coupons/${id}`, payload, { requiresAuth: true }),
    delete: (id: number) =>
      api.delete(`/admin/coupons/${id}`, { requiresAuth: true }),
  },

  // کد معرف/فروشنده + پورسانت
  referralCodes: {
    list: (params?: { user_id?: number; per_page?: number }) =>
      api.get("/admin/referral-codes", { params, requiresAuth: true }),
    create: (payload: {
      code: string;
      user_id: number;
      commission_type: "percentage" | "fixed";
      commission_value: number;
    }) => api.post("/admin/referral-codes", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/admin/referral-codes/${id}`, payload, { requiresAuth: true }),
    delete: (id: number) =>
      api.delete(`/admin/referral-codes/${id}`, { requiresAuth: true }),
  },
  referralCommissions: {
    list: (params?: { user_id?: number; status?: string; per_page?: number }) =>
      api.get("/admin/referral-commissions", { params, requiresAuth: true }),
    markPaid: (id: number) =>
      api.post(
        `/admin/referral-commissions/${id}/mark-paid`,
        {},
        { requiresAuth: true }
      ),
  },

  // سفارش‌ها
  orders: {
    list: (params?: { status?: string; per_page?: number; page?: number }) =>
      api.get("/admin/orders", { params, requiresAuth: true }),
    show: (id: number) =>
      api.get(`/admin/orders/${id}`, { requiresAuth: true }),
    approve: (id: number) =>
      api.post(`/admin/orders/${id}/approve`, {}, { requiresAuth: true }),
    updateItems: (
      id: number,
      payload: {
        items: { id: number; quantity: number; is_available: boolean }[];
        admin_note?: string;
      }
    ) => api.put(`/admin/orders/${id}/items`, payload, { requiresAuth: true }),
    cancel: (id: number, note?: string) =>
      api.post(`/admin/orders/${id}/cancel`, { note }, { requiresAuth: true }),
    issueInvoice: (id: number) =>
      api.post(`/admin/orders/${id}/issue-invoice`, {}, { requiresAuth: true }),
  },

  // مرجوعی
  returns: {
    list: (params?: { status?: string; user_id?: number; per_page?: number }) =>
      api.get("/admin/returns", { params, requiresAuth: true }),
    approve: (id: number, admin_note?: string) =>
      api.post(
        `/admin/returns/${id}/approve`,
        { admin_note },
        { requiresAuth: true }
      ),
    reject: (id: number, admin_note: string) =>
      api.post(
        `/admin/returns/${id}/reject`,
        { admin_note },
        { requiresAuth: true }
      ),
    markRefunded: (id: number, refund_amount: number) =>
      api.post(
        `/admin/returns/${id}/mark-refunded`,
        { refund_amount },
        { requiresAuth: true }
      ),
  },

  // گزارش‌گیری فروش
  reports: {
    productSales: (params?: {
      from?: string;
      to?: string;
      page?: number;
      per_page?: number;
    }) =>
      api.get("/admin/reports/product-sales", { params, requiresAuth: true }),
    customerSales: (params?: {
      from?: string;
      to?: string;
      page?: number;
      per_page?: number;
    }) =>
      api.get("/admin/reports/customer-sales", { params, requiresAuth: true }),
    citySales: (params?: {
      from?: string;
      to?: string;
      page?: number;
      per_page?: number;
    }) => api.get("/admin/reports/city-sales", { params, requiresAuth: true }),
    returns: (params?: {
      status?: string;
      from?: string;
      to?: string;
      per_page?: number;
      page?: number;
    }) => api.get("/admin/reports/returns", { params, requiresAuth: true }),
    // دانلود اکسل - چون سیستم احراز هویت توکنیه (نه کوکی)، نمی‌شه با لینک
    // ساده دانلود کرد؛ باید blob رو با axios (همراه توکن) گرفت.
    downloadExcel: (
      reportPath: "product-sales" | "customer-sales" | "city-sales" | "returns",
      params?: Record<string, unknown>
    ) =>
      api.get(`/admin/reports/${reportPath}`, {
        params: { ...params, format: "xlsx" },
        requiresAuth: true,
        responseType: "blob",
      } as any),
  },

  // هشدارها
  salesAlerts: {
    list: (params?: { product_id?: number; per_page?: number }) =>
      api.get("/admin/sales-alerts", { params, requiresAuth: true }),
  },
  inventoryAlerts: {
    list: () => api.get("/admin/inventory-alerts", { requiresAuth: true }),
  },

  // پیامک گروهی/بازاریابی
  marketing: {
    campaigns: (params?: { per_page?: number }) =>
      api.get("/admin/marketing/campaigns", { params, requiresAuth: true }),
    preview: (payload: {
      vehicle_id?: number;
      purchased_product_id?: number;
      has_purchased?: boolean;
      no_purchase_since?: string;
      city?: string;
    }) => api.post("/admin/marketing/preview", payload, { requiresAuth: true }),
    send: (payload: {
      vehicle_id?: number;
      purchased_product_id?: number;
      has_purchased?: boolean;
      no_purchase_since?: string;
      city?: string;
      message: string;
    }) => api.post("/admin/marketing/send", payload, { requiresAuth: true }),
  },

  // مقالات و بنر
  articles: {
    list: (params?: { is_published?: boolean; per_page?: number }) =>
      api.get("/admin/articles", { params, requiresAuth: true }),
    create: (payload: FormData) =>
      api.post("/admin/articles", payload, { requiresAuth: true }),
    update: (id: number, payload: FormData) =>
      api.post(`/admin/articles/${id}?_method=PUT`, payload, {
        requiresAuth: true,
      }),
    delete: (id: number) =>
      api.delete(`/admin/articles/${id}`, { requiresAuth: true }),
  },
  banners: {
    create: (payload: FormData) =>
      api.post("/admin/banners", payload, { requiresAuth: true }),
    update: (id: number, payload: FormData) =>
      api.post(`/admin/banners/${id}?_method=PUT`, payload, {
        requiresAuth: true,
      }),
    delete: (id: number) =>
      api.delete(`/admin/banners/${id}`, { requiresAuth: true }),
  },

  // نرخ ارسال
  shippingRates: {
    list: () => api.get("/admin/shipping-rates", { requiresAuth: true }),
    create: (payload: {
      city: string | null;
      base_price: number;
      price_per_kg: number;
    }) => api.post("/admin/shipping-rates", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/admin/shipping-rates/${id}`, payload, { requiresAuth: true }),
    delete: (id: number) =>
      api.delete(`/admin/shipping-rates/${id}`, { requiresAuth: true }),
  },

  // لاگ تغییرات
  activityLogs: {
    list: (params?: {
      loggable_type?: string;
      loggable_id?: number;
      user_id?: number;
      action?: string;
      per_page?: number;
    }) => api.get("/admin/activity-logs", { params, requiresAuth: true }),
  },

  reviews: {
    list: (params?: { status?: string; page?: number; per_page?: number }) =>
      api.get("/admin/reviews", { params, requiresAuth: true }),
    approve: (id: number) =>
      api.post(`/admin/reviews/${id}/approve`, {}, { requiresAuth: true }),
    reject: (id: number) =>
      api.post(`/admin/reviews/${id}/reject`, {}, { requiresAuth: true }),
  },

  newsletter: {
    list: (params?: { page?: number; per_page?: number }) =>
      api.get("/admin/newsletter-subscriptions", {
        params,
        requiresAuth: true,
      }),
  },
};
