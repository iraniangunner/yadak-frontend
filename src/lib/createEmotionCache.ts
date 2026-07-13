import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";

/**
 * emotion cache با پلاگین RTL. بدون این، استایل‌های MUI (مثل margin/padding
 * جهت‌دار) برعکس نمایش داده می‌شن چون MUI پیش‌فرض برای LTR طراحی شده.
 */
export default function createEmotionCache() {
  return createCache({
    key: "mui-rtl",
    stylisPlugins: [prefixer, rtlPlugin],
  });
}