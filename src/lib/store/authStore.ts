import { create } from "zustand";
import { authAPI } from "../api";
import { logoutAction } from "@/app/_actions/auth";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/lib/store/authStore.ts
|--------------------------------------------------------------------------
| این استور کاری به لاگین/ثبت‌نام/OTP نداره - اون کار Server Action های
| توی auth.ts هست (که خودشون مستقیم کوکی رو ست/پاک می‌کنن، بدون نیاز به
| هیچ API route اضافه‌ای).
|
| این استور فقط وظیفه‌ش نگه‌داری اطلاعات کاربر برای نمایش توی UI هست:
| بعد از موفقیت یه Server Action (مثلاً loginAction)، صفحه باید
| useAuthStore.getState().refreshUser() رو صدا بزنه تا پروفایل بیاد.
*/

type User = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  /** فقط یه‌بار موقع mount شدن اپ صدا زده می‌شه (از AuthInitializer) */
  init: () => Promise<void>;

  /** بعد از موفقیت loginAction/verifyOtpAction (Server Action) صدا زده می‌شه */
  refreshUser: () => Promise<void>;

  /** خروج معمولی: هم logoutAction (Server Action، پاک‌کردن کوکی) هم پاک‌کردن state */
  logout: () => Promise<void>;

  /** خروج اجباری بی‌صدا وقتی api.ts تشخیص بده refresh token هم منقضی شده */
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  refreshUser: async () => {
    try {
      const { data } = await authAPI.me();
      set({ user: data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  init: async () => {
    await get().refreshUser();
    set({ isLoading: false });
  },

  logout: async () => {
    await logoutAction(); // Server Action - کوکی‌ها رو سمت سرور پاک می‌کنه
    set({ user: null, isAuthenticated: false });
  },

  clearSession: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
