"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { loginAction } from "@/app/_actions/auth";
import { useAuthStore } from "@/lib/store/authStore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/auth/LoginContent.tsx
|--------------------------------------------------------------------------
| چون از useSearchParams (برای پارامتر redirect) استفاده می‌کنیم، این
| کامپوننت باید داخل <Suspense> توی page.tsx wrap بشه - وگرنه Next.js
| موقع build خطای "should be wrapped in a suspense boundary" می‌ده.
*/

const initialState = { isSuccess: false, error: "" };

/**
 * دکمه‌ی submit جدا شده چون useFormStatus فقط داخل خودِ <form> کار می‌کنه
 * (نه توی کامپوننتی که <form> رو رندر می‌کنه).
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      disabled={pending}
    >
      {pending ? "در حال ورود..." : "ورود"}
    </Button>
  );
}

/**
 * مسیر پیش‌فرض بعد از لاگین رو بر اساس نقش کاربر تعیین می‌کنه:
 * - admin / warehouse / sales / support (یعنی هرکسی که customer نیست) → /admin
 * - customer → /account/profile
 * اگه پارامتر ?redirect= صریحاً توی URL باشه، همیشه اون اولویت داره.
 */
function resolveRedirectTarget(
  role: string | undefined,
  explicitRedirect: string | null
): string {
  if (explicitRedirect) return explicitRedirect;
  if (role && role !== "customer") return "/admin";
  return "/account/profile";
}

export function LoginContent() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  // loginAction فقط کوکی رو ست می‌کنه، user رو برنمی‌گردونه؛ پس بعد از
  // موفقیت، خودمون پروفایل رو از /me می‌کشیم تا هم Zustand پر بشه هم
  // نقش کاربر رو برای تعیین مسیر ریدایرکت داشته باشیم.
  useEffect(() => {
    if (!state.isSuccess) return;

    (async () => {
      await refreshUser();
      const currentUser = useAuthStore.getState().user;
      const target = resolveRedirectTarget(
        currentUser?.role,
        searchParams.get("redirect")
      );
      router.push(target);
    })();
  }, [state.isSuccess, refreshUser, router, searchParams]);

  return (
    <Box component="form" action={formAction}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        ورود به حساب کاربری
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        برای مشاهده‌ی سفارش‌ها و ادامه‌ی خرید وارد شوید
      </Typography>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          name="email"
          label="ایمیل"
          type="email"
          required
          fullWidth
          autoComplete="email"
        />

        <TextField
          name="password"
          label="رمز عبور"
          type={showPassword ? "text" : "password"}
          required
          fullWidth
          autoComplete="current-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((p) => !p)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ textAlign: "left" }}>
          <MuiLink component={NextLink} href="/forgot-password" variant="body2">
            رمز عبور را فراموش کرده‌اید؟
          </MuiLink>
        </Box>

        <SubmitButton />
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 3, justifyContent: "center" }}
      >
        <Typography variant="body2" color="text.secondary">
          حساب کاربری ندارید؟
        </Typography>
        <MuiLink
          component={NextLink}
          href="/register"
          variant="body2"
          sx={{ fontWeight: 600 }}
        >
          ثبت‌نام کنید
        </MuiLink>
      </Stack>

      <Stack direction="row" sx={{ mt: 1, justifyContent: "center" }}>
        <MuiLink component={NextLink} href="/login-otp" variant="body2">
          ورود با کد پیامکی
        </MuiLink>
      </Stack>
    </Box>
  );
}
