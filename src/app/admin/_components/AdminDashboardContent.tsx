"use client";

import NextLink from "next/link";
import { Box, Typography } from "@mui/material";
import {
  ShoppingBag,
  Inventory,
  AssignmentReturn,
  NotificationsActive,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminDashboardContent.tsx
|--------------------------------------------------------------------------
*/

const quickLinks = [
  {
    href: "/admin/orders",
    label: "سفارش‌های در انتظار بررسی",
    icon: <ShoppingBag />,
    roles: ["admin", "warehouse"],
  },
  {
    href: "/admin/products",
    label: "مدیریت محصولات",
    icon: <Inventory />,
    roles: ["admin", "warehouse"],
  },
  {
    href: "/admin/returns",
    label: "درخواست‌های مرجوعی",
    icon: <AssignmentReturn />,
    roles: ["admin", "warehouse"],
  },
  {
    href: "/admin/alerts",
    label: "هشدارهای موجودی و فروش",
    icon: <NotificationsActive />,
    roles: ["admin", "warehouse"],
  },
];

export function AdminDashboardContent() {
  const user = useAuthStore((s) => s.user);

  const visibleLinks = quickLinks.filter(
    (link) => user && link.roles.includes(user.role),
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        خوش آمدید، {user?.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        از منوی کناری به بخش موردنظر بروید یا از میان‌برهای زیر انتخاب کنید.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {visibleLinks.map((link) => (
          <Box
            key={link.href}
            component={NextLink}
            href={link.href}
            sx={{
              flex: "1 1 220px",
              textDecoration: "none",
              color: "text.primary",
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "box-shadow .15s",
              "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: "rgba(30,58,138,0.08)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {link.icon}
            </Box>
            <Typography sx={{ fontWeight: 600 }}>{link.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
