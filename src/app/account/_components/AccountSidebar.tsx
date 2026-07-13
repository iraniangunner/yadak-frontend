"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Box, Stack, Typography, Avatar } from "@mui/material";
import {
  Person,
  ShoppingBag,
  LocationOn,
  DirectionsCar,
  Logout,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/AccountSidebar.tsx
|--------------------------------------------------------------------------
*/

const links = [
  { href: "/account/profile", label: "پروفایل", icon: <Person fontSize="small" /> },
  { href: "/account/orders", label: "سفارش‌های من", icon: <ShoppingBag fontSize="small" /> },
  { href: "/account/addresses", label: "آدرس‌های من", icon: <LocationOn fontSize="small" /> },
  { href: "/account/vehicles", label: "خودروهای من", icon: <DirectionsCar fontSize="small" /> },
];

function initialsOf(name: string) {
  return name.trim().split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {user && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700 }}>
            {initialsOf(user.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
              {user.phone || user.email}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ height: "1px", bgcolor: "divider" }} />

      <Stack component="nav" sx={{ p: 1.5, gap: 0.5 }}>
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Box
              key={link.href}
              component={NextLink}
              href={link.href}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                textDecoration: "none",
                color: isActive ? "primary.contrastText" : "text.primary",
                bgcolor: isActive ? "primary.main" : "transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9rem",
                transition: "background-color .15s",
                "&:hover": {
                  bgcolor: isActive ? "primary.main" : "background.default",
                },
              }}
            >
              {link.icon}
              {link.label}
            </Box>
          );
        })}
      </Stack>

      <Box sx={{ height: "1px", bgcolor: "divider" }} />

      <Box
        component="button"
        onClick={handleLogout}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          width: "100%",
          textAlign: "right",
          border: "none",
          bgcolor: "transparent",
          cursor: "pointer",
          color: "error.main",
          fontFamily: "inherit",
          fontSize: "0.9rem",
          px: "28px",
          py: 1.75,
          "&:hover": { bgcolor: "background.default" },
        }}
      >
        <Logout fontSize="small" />
        خروج از حساب
      </Box>
    </Box>
  );
}