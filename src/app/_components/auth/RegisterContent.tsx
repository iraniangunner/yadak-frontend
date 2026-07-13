"use client";

import { useFormState, useFormStatus } from "react-dom";
import NextLink from "next/link";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
  Stack,
} from "@mui/material";
import { registerAction } from "@/app/_actions/auth";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/auth/RegisterContent.tsx
|--------------------------------------------------------------------------
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
      {pending ? "در حال ثبت‌نام..." : "ثبت‌نام"}
    </Button>
  );
}

export function RegisterContent() {
  const [state, formAction] = useFormState(registerAction, initialState);

  // registerAction برخلاف loginAction، کوکی ست نمی‌کنه (چون ثبت‌نام خودکار
  // لاگین نمی‌کنه) - پس بعد از موفقیت، فقط پیام موفقیت + لینک ورود نشون می‌دیم.
  if (state.isSuccess) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          ثبت‌نام با موفقیت انجام شد
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          حالا می‌تونید با همون ایمیل و رمز عبور وارد بشید
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
        ساخت حساب کاربری
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        برای خرید و پیگیری سفارش‌ها ثبت‌نام کنید
      </Typography>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          name="name"
          label="نام و نام خانوادگی"
          required
          fullWidth
          autoComplete="name"
        />
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
          type="password"
          required
          fullWidth
          autoComplete="new-password"
        />
        <TextField
          name="password_confirmation"
          label="تکرار رمز عبور"
          type="password"
          required
          fullWidth
          autoComplete="new-password"
        />

        <SubmitButton />
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 3, justifyContent: "center" }}
      >
        <Typography variant="body2" color="text.secondary">
          حساب کاربری دارید؟
        </Typography>
        <MuiLink
          component={NextLink}
          href="/login"
          variant="body2"
          sx={{ fontWeight: 600 }}
        >
          وارد شوید
        </MuiLink>
      </Stack>
    </Box>
  );
}
