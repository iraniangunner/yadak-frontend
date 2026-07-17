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
  Favorite,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/AccountSidebar.tsx
|--------------------------------------------------------------------------
*/

const links = [
  {
    href: "/account/profile",
    label: "اطلاعات کاربری",
    icon: <Person fontSize="small" />,
  },
  {
    href: "/account/orders",
    label: "سفارش‌های من",
    icon: <ShoppingBag fontSize="small" />,
  },
  {
    href: "/account/addresses",
    label: "آدرس‌های من",
    icon: <LocationOn fontSize="small" />,
  },
  {
    href: "/account/vehicles",
    label: "خودروهای من",
    icon: <DirectionsCar fontSize="small" />,
  },
  {
    href: "/account/favorites",
    label: "علاقه مندی های من",
    icon: <Favorite fontSize="small" />,
  },
];

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
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        p: 2,
      }}
    >
      {user && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            pb: 2,
            mb: 1,
            gap: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "background.default",
              color: "text.secondary",
            }}
          >
            <Person fontSize="small" />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }} noWrap>
              {user.name}
              {user.phone && (
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {" "}
                  ({user.phone})
                </Typography>
              )}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: "block" }}
            >
              {user.email}
            </Typography>
          </Box>
        </Box>
      )}

      <Stack component="nav" sx={{ gap: 0.5 }}>
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
                // justifyContent: "space-around",
                px: 1.5,
                py: 1.25,
                gap: 1,
                borderRadius: 2,
                textDecoration: "none",
                color: isActive ? "primary.main" : "text.primary",
                bgcolor: isActive ? "rgba(30,58,138,0.08)" : "transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9rem",
                transition: "background-color .15s",
                "&:hover": {
                  bgcolor: isActive
                    ? "rgba(30,58,138,0.08)"
                    : "background.default",
                },
              }}
            >
              {link.icon}
              {link.label}
            </Box>
          );
        })}
      </Stack>

      <Box sx={{ height: "1px", bgcolor: "divider", my: 1.5 }} />

      <Box
        component="button"
        onClick={handleLogout}
        sx={{
          display: "flex",
          alignItems: "center",
          // justifyContent: "space-between",
          width: "100%",
          border: "none",
          bgcolor: "transparent",
          cursor: "pointer",
          color: "error.main",
          fontFamily: "inherit",
          fontSize: "0.9rem",
          px: 1.5,
          py: 1.25,
          gap: 1,
          borderRadius: 2,
          "&:hover": { bgcolor: "background.default" },
        }}
      >
        <Logout fontSize="small" />
        خروج از حساب کاربری
      </Box>
    </Box>
  );
}
