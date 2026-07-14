"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";
import { AdminSidebar } from "@/app/admin/_components/AdminSidebar";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/AdminLayoutClient.tsx
|--------------------------------------------------------------------------
| زیر md: سایدبار داخل یه Drawer موقتیه که با دکمه‌ی همبرگری (توی یه
| AppBar بالای صفحه) باز/بسته می‌شه.
| از md به بالا: همون سایدبار ثابت قبلی، بدون AppBar.
*/

const STAFF_ROLES = ["admin", "warehouse", "sales", "support"];
const DRAWER_WIDTH = 260;

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user || !STAFF_ROLES.includes(user.role)) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !STAFF_ROLES.includes(user.role)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* AppBar فقط زیر md دیده می‌شه */}
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ ml: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700 }}>پنل مدیریت یدکی</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex" }}>
        {/* سایدبار ثابت - فقط از md به بالا */}
        <Box
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
            borderInlineEnd: "1px solid",
            borderColor: "divider",
            minHeight: "100vh",
            bgcolor: "background.paper",
          }}
        >
          <AdminSidebar role={user.role} />
        </Box>

        {/* Drawer موقتی - فقط زیر md */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          }}
        >
          <Box onClick={() => setMobileOpen(false)}>
            <AdminSidebar role={user.role} />
          </Box>
        </Drawer>

        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
}