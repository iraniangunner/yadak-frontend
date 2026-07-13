"use client";

import { Box, Container } from "@mui/material";
import { AccountSidebar } from "@/app/account/_components/AccountSidebar";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/AccountLayoutClient.tsx
|--------------------------------------------------------------------------
| عمداً از Grid استفاده نشده - چون API جدیدش (size={{...}}) بسته به نسخه‌ی
| دقیق MUI رفتار متفاوتی داره و باعث باگ عرض (فضای خالی سمت چپ) می‌شد.
| این نسخه با flexbox خالص - که مستقل از نسخه‌ی MUI همیشه یکسان کار
| می‌کنه - بازنویسی شده.
*/

export default function AccountLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 6 },
          }}
        >
          <Box sx={{ width: { xs: "100%", md: 220 }, flexShrink: 0 }}>
            <AccountSidebar />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
        </Box>
      </Container>
    </Box>
  );
}
