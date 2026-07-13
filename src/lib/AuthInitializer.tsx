"use client";

import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/lib/AuthInitializer.tsx
|--------------------------------------------------------------------------
| دو کار می‌کنه:
| ۱. موقع mount شدن اپ، init() رو صدا می‌زنه (پروفایل کاربر رو می‌کشه اگه
|    توکن معتبری توی cookie باشه).
| ۲. به رویداد "auth:logout" گوش می‌ده که api.ts وقتی رفرش توکن هم شکست
|    بخوره (یعنی واقعاً باید کاربر دوباره لاگین کنه) خودش dispatch می‌کنه.
*/
export default function AuthInitializer() {
  const init = useAuthStore((state) => state.init);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    init();

    const handleForcedLogout = () => clearSession();
    window.addEventListener("auth:logout", handleForcedLogout);

    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, [init, clearSession]);

  return null;
}
