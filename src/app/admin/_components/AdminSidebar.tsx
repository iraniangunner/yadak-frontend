"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Box, Stack, Typography, Divider } from "@mui/material";
import { Logout } from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Dashboard,
  ShoppingBag,
  Inventory,
  Category,
  Storefront,
  DirectionsCar,
  LocalOffer,
  ConfirmationNumber,
  Group,
  AssignmentReturn,
  BarChart,
  NotificationsActive,
  Campaign,
  Article,
  ViewCarousel,
  LocalShipping,
  History,
  Badge,
  RateReview,
} from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminSidebar.tsx
|--------------------------------------------------------------------------
| هر آیتم فقط برای نقش‌های مشخص‌شده نمایش داده می‌شه - دقیقاً هماهنگ با
| میدل‌ور role های واقعی بک‌اند (role:admin,warehouse یا role:admin).
*/

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
};

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "",
    items: [
      { href: "/admin", label: "داشبورد", icon: <Dashboard fontSize="small" />, roles: ["admin", "warehouse", "sales", "support"] },
    ],
  },
  {
    title: "فروش",
    items: [
      { href: "/admin/orders", label: "سفارش‌ها", icon: <ShoppingBag fontSize="small" />, roles: ["admin", "warehouse"] },
      { href: "/admin/returns", label: "مرجوعی‌ها", icon: <AssignmentReturn fontSize="small" />, roles: ["admin", "warehouse"] },
      { href: "/admin/coupons", label: "کدهای تخفیف", icon: <ConfirmationNumber fontSize="small" />, roles: ["admin"] },
      { href: "/admin/referral-codes", label: "کد معرف و پورسانت", icon: <LocalOffer fontSize="small" />, roles: ["admin"] },
    ],
  },
  {
    title: "کاتالوگ",
    items: [
      { href: "/admin/products", label: "محصولات", icon: <Inventory fontSize="small" />, roles: ["admin", "warehouse"] },
      { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: <Category fontSize="small" />, roles: ["admin", "warehouse"] },
      { href: "/admin/brands", label: "برندها", icon: <Storefront fontSize="small" />, roles: ["admin", "warehouse"] },
      { href: "/admin/vehicles", label: "خودروها", icon: <DirectionsCar fontSize="small" />, roles: ["admin", "warehouse"] },
      { href: "/admin/discounts", label: "تخفیف‌ها", icon: <LocalOffer fontSize="small" />, roles: ["admin"] },
    ],
  },
  {
    title: "گزارش و هشدار",
    items: [
      { href: "/admin/reports", label: "گزارش فروش", icon: <BarChart fontSize="small" />, roles: ["admin"] },
      { href: "/admin/alerts", label: "هشدارها", icon: <NotificationsActive fontSize="small" />, roles: ["admin", "warehouse"] },
      { href: "/admin/activity-logs", label: "لاگ تغییرات", icon: <History fontSize="small" />, roles: ["admin"] },
    ],
  },
  {
    title: "محتوا و بازاریابی",
    items: [
      { href: "/admin/reviews", label: "نظرات کاربران", icon: <RateReview fontSize="small" />, roles: ["admin"] },
      { href: "/admin/marketing", label: "پیامک گروهی", icon: <Campaign fontSize="small" />, roles: ["admin"] },
      { href: "/admin/articles", label: "مقالات", icon: <Article fontSize="small" />, roles: ["admin"] },
      { href: "/admin/banners", label: "بنرها", icon: <ViewCarousel fontSize="small" />, roles: ["admin"] },
    ],
  },
  {
    title: "تنظیمات",
    items: [
      { href: "/admin/shipping-rates", label: "نرخ ارسال", icon: <LocalShipping fontSize="small" />, roles: ["admin"] },
      { href: "/admin/staff", label: "کارمندان", icon: <Badge fontSize="small" />, roles: ["admin"] },
    ],
  },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <Box sx={{ p: 2, position: "sticky", top: 0 }}>
      <Typography sx={{ fontWeight: 700, px: 1.5, py: 1, mb: 1 }}>پنل مدیریت یدکی</Typography>

      {sections.map((section, idx) => {
        const visibleItems = section.items.filter((item) => item.roles.includes(role));
        if (visibleItems.length === 0) return null;

        return (
          <Box key={idx} sx={{ mb: 2 }}>
            {section.title && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 1.5, display: "block", mb: 0.5, fontWeight: 600 }}
              >
                {section.title}
              </Typography>
            )}

            <Stack sx={{ gap: 0.5 }}>
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Box
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      textDecoration: "none",
                      color: isActive ? "primary.main" : "text.primary",
                      bgcolor: isActive ? "rgba(30,58,138,0.08)" : "transparent",
                      fontWeight: isActive ? 600 : 400,
                      fontSize: "0.875rem",
                      "&:hover": {
                        bgcolor: isActive ? "rgba(30,58,138,0.08)" : "background.default",
                      },
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        );
      })}

      <Divider sx={{ my: 1.5 }} />

      <Box
        component="button"
        onClick={handleLogout}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          width: "100%",
          border: "none",
          bgcolor: "transparent",
          cursor: "pointer",
          color: "error.main",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          px: 1.5,
          py: 1,
          borderRadius: 2,
          "&:hover": { bgcolor: "background.default" },
        }}
      >
        <Logout fontSize="small" />
        خروج از حساب
      </Box>
    </Box>
  );
}