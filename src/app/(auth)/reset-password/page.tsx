import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { ResetPasswordContent } from "@/app/_components/auth/ResetPasswordContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/reset-password/page.tsx
|--------------------------------------------------------------------------
*/

export const metadata = {
  title: "تنظیم رمز عبور جدید | یدکی",
};

export default function ResetPasswordPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 1,
          p: { xs: 3, sm: 5 },
        }}
      >
        <Suspense
          fallback={
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </Box>
    </Box>
  );
}
