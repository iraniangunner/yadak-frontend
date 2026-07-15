"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Box, Stack, Typography, Divider } from "@mui/material";
import {
  Dashboard,
  ShoppingBag,
  Inventory,
  Category,
  Storefront,
  DirectionsCar,
  AssignmentReturn,
  NotificationsActive,
  Loyalty,
  Logout,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/staff/_components/StaffSidebar.tsx
|--------------------------------------------------------------------------
| برخلاف AdminSidebar (که برای admin طراحی شده)، این یکی مخصوص سه نقش
| warehouse/sales/support هست - دقیقاً هماهنگ با دسترسی‌های واقعی هرکدوم
| توی بک‌اند.
*/

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
};

const items: NavItem[] = [
  { href: "/staff", label: "داشبورد", icon: <Dashboard fontSize="small" />, roles: ["warehouse", "sales", "support"] },
  { href: "/staff/orders", label: "سفارش‌ها", icon: <ShoppingBag fontSize="small" />, roles: ["warehouse", "sales", "support"] },
  { href: "/staff/returns", label: "مرجوعی‌ها", icon: <AssignmentReturn fontSize="small" />, roles: ["warehouse", "support"] },
  { href: "/staff/products", label: "محصولات", icon: <Inventory fontSize="small" />, roles: ["warehouse"] },
  { href: "/staff/categories", label: "دسته‌بندی‌ها", icon: <Category fontSize="small" />, roles: ["warehouse"] },
  { href: "/staff/brands", label: "برندها", icon: <Storefront fontSize="small" />, roles: ["warehouse"] },
  { href: "/staff/vehicles", label: "خودروها", icon: <DirectionsCar fontSize="small" />, roles: ["warehouse"] },
  { href: "/staff/alerts", label: "هشدارها", icon: <NotificationsActive fontSize="small" />, roles: ["warehouse"] },
  { href: "/staff/my-referral", label: "کد معرف و پورسانت من", icon: <Loyalty fontSize="small" />, roles: ["sales"] },
];

export function StaffSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const visibleItems = items.filter((item) => item.roles.includes(role));

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <Box sx={{ p: 2, position: "sticky", top: 0 }}>
      <Typography sx={{ fontWeight: 700, px: 1.5, py: 1, mb: 1 }}>پنل کارمندان</Typography>

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