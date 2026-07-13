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
import { forgotPasswordAction } from "@/app/_actions/auth";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/auth/ForgotPasswordContent.tsx
|--------------------------------------------------------------------------
*/

const initialState = { isSuccess: false, error: "", message: "" };

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
      {pending ? "در حال ارسال..." : "ارسال لینک بازیابی"}
    </Button>
  );
}

export function ForgotPasswordContent() {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState);

  // طبق طراحی امنیتی بک‌اند، پیام موفقیت همیشه یکسانه (چه ایمیل وجود
  // داشته باشه چه نه) تا کسی نتونه بفهمه کدوم ایمیل‌ها توی سیستم ثبت شدن.
  if (state.isSuccess) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          ایمیل ارسال شد
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {state.message ||
            "اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز عبور برایش ارسال شد."}
        </Typography>
        <Button
          component={NextLink}
          href="/login"
          variant="outlined"
          size="large"
          fullWidth
        >
          بازگشت به ورود
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" action={formAction}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        فراموشی رمز عبور
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        ایمیل حساب کاربری خود را وارد کنید تا لینک بازیابی برایتان ارسال شود
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
          dir="ltr"
        />

        <SubmitButton />
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 3, justifyContent: "center" }}
      >
        <MuiLink component={NextLink} href="/login" variant="body2">
          بازگشت به ورود
        </MuiLink>
      </Stack>
    </Box>
  );
}
