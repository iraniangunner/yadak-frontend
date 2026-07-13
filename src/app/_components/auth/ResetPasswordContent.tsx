"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import NextLink from "next/link";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import { resetPasswordAction } from "@/app/_actions/auth";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/auth/ResetPasswordContent.tsx
|--------------------------------------------------------------------------
| token و email از لینک ایمیل (که بک‌اند می‌سازه: /reset-password?token=..&email=..)
| از طریق useSearchParams خونده می‌شن - برای همین این کامپوننت حتماً باید
| داخل Suspense باشه.
*/

const initialState = { isSuccess: false, error: "" };

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
      {pending ? "در حال ثبت..." : "تنظیم رمز عبور جدید"}
    </Button>
  );
}

export function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  if (!token || !email) {
    return (
      <Alert severity="error">
        لینک بازیابی نامعتبر است. لطفاً دوباره از صفحه‌ی «فراموشی رمز عبور»
        اقدام کنید.
      </Alert>
    );
  }

  if (state.isSuccess) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          رمز عبور با موفقیت تغییر کرد
        </Typography>
        <Button
          component={NextLink}
          href="/login"
          variant="contained"
          size="large"
          fullWidth
        >
          ورود به حساب کاربری
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" action={formAction}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        تنظیم رمز عبور جدید
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        رمز عبور جدید خود را وارد کنید
      </Typography>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />

      <Stack spacing={2}>
        <TextField
          name="password"
          label="رمز عبور جدید"
          type="password"
          required
          fullWidth
          autoComplete="new-password"
        />
        <TextField
          name="password_confirmation"
          label="تکرار رمز عبور جدید"
          type="password"
          required
          fullWidth
          autoComplete="new-password"
        />

        <SubmitButton />
      </Stack>
    </Box>
  );
}
