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
import { StaffSidebar } from "@/app/staff/_components/StaffSidebar";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/staff/StaffLayoutClient.tsx
|--------------------------------------------------------------------------
| فقط warehouse/sales/support اجازه‌ی ورود دارن. admin به /admin و customer
| به /account/profile هدایت می‌شن - چون این پنل مخصوص خودِ ادمین نیست.
*/

const STAFF_ROLES = ["warehouse", "sales", "support"];
const DRAWER_WIDTH = 260;

export default function StaffLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (!STAFF_ROLES.includes(user.role)) {
      router.replace("/account/profile");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !STAFF_ROLES.includes(user.role)) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
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
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700 }}>پنل کارمندان</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex" }}>
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
          <StaffSidebar role={user.role} />
        </Box>

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
            <StaffSidebar role={user.role} />
          </Box>
        </Drawer>

        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
