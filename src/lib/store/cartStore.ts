import { create } from "zustand";
import { persist } from "zustand/middleware";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/lib/store/cartStore.ts
|--------------------------------------------------------------------------
| چون بک‌اند «سبد خرید» مستقل نداره (سفارش مستقیم با آیتم‌های نهایی ساخته
| می‌شه: POST /orders)، سبد خرید کاملاً سمت کلاینت نگه داشته می‌شه و فقط
| موقع «نهایی کردن خرید» به فرمت مناسب POST /orders تبدیل می‌شه.
| با persist توی localStorage ذخیره می‌شه تا با رفرش صفحه از بین نره.
*/

export type CartItem = {
  product_id: number;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  unit_price: number; // قیمت واحد در لحظه‌ی افزودن (با احتساب قیمت پلکانی)
  quantity: number;
  stock_status: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateItemInfo: (productId: number, info: Partial<Omit<CartItem, "product_id" | "quantity">>) => void;
  clear: () => void;
  totalCount: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }

          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.product_id === productId ? { ...i, quantity } : i)),
        }));
      },

      updateItemInfo: (productId, info) => {
        set((state) => ({
          items: state.items.map((i) => (i.product_id === productId ? { ...i, ...info } : i)),
        }));
      },

      clear: () => set({ items: [] }),

      totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
    }),
    { name: "yadaki-cart" }
  )
);