"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/TopLoader.tsx
|--------------------------------------------------------------------------
| ⚠️ به‌جای نوار پیشرفت بالای صفحه، الان کل صفحه با بک‌دراپ بلورشده محو
| می‌شه و یه اسپینر وسط صفحه نمایش داده می‌شه - دقیقاً همون منطق تشخیص
| کلیک/ناوبری قبلی، فقط نمایش بصری عوض شده.
*/

export default function TopLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minShowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownAtRef = useRef<number>(0);

  const start = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    shownAtRef.current = Date.now();
    setIsLoading(true);
    // اگه بیش از حد طول کشید (مثلاً ناوبری قطع شد)، خودکار قطعش کن
    timerRef.current = setTimeout(() => finish(), 10000);
  };

  const finish = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // حداقل ۳۰۰ میلی‌ثانیه نگه‌دار تا چشمک نزنه (اگه ناوبری خیلی سریع بود)
    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(0, 300 - elapsed);

    if (minShowTimerRef.current) clearTimeout(minShowTimerRef.current);
    minShowTimerRef.current = setTimeout(() => setIsLoading(false), remaining);
  };

  // وقتی مسیر یا کوئری عوض شد (ناوبری کامل شد) → محو کن
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  // تشخیص کلیک روی لینک‌ها
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;

      if (target.closest("button")) return;

      const a = target.closest("a") as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#") || a.target === "_blank") return;
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        a.hasAttribute("download")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      start();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // دسترسی دستی از جاهای دیگر (مثل فیلترهای جستجو)
  useEffect(() => {
    (window as any).__topLoaderStart = start;
    (window as any).__topLoaderFinish = finish;
    return () => {
      delete (window as any).__topLoaderStart;
      delete (window as any).__topLoaderFinish;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(255,255,255,0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        pointerEvents: "none",
      }}
    >
      <CircularProgress
        size={48}
        thickness={4}
        sx={{ color: "primary.main" }}
      />
    </Box>
  );
}
