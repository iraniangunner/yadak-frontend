"use client";

import { useEffect, useRef, useState } from "react";
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
} from "@mui/material";

import { useAuthStore } from "@/lib/store/authStore";
import { OtpCodeInput } from "@/app/_components/auth/OtpCodeInput";
import { sendOtpAction, verifyOtpAction } from "@/app/_actions/auth";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/auth/OtpLoginContent.tsx
|--------------------------------------------------------------------------
*/

const RESEND_COOLDOWN_SECONDS = 120; // باید با throttle واقعی send-otp سمت بک‌اند هماهنگ باشه

const sendInitialState = { isSuccess: false, error: "", mobile: "" };
const verifyInitialState = { isSuccess: false, error: "", mobile: "" };

function SendCodeButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      disabled={pending}
    >
      {pending ? "در حال ارسال..." : "دریافت کد تأیید"}
    </Button>
  );
}

function VerifyCodeButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      disabled={pending}
    >
      {pending ? "در حال بررسی..." : "تأیید و ورود"}
    </Button>
  );
}

export function OtpLoginContent() {
  const [sendState, sendFormAction] = useFormState(
    sendOtpAction,
    sendInitialState
  );
  const [verifyState, verifyFormAction] = useFormState(
    verifyOtpAction,
    verifyInitialState
  );

  const [step, setStep] = useState<"mobile" | "code">("mobile");
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  // وقتی ارسال کد موفق بود، بریم مرحله‌ی وارد کردن کد + شروع شمارش معکوس
  useEffect(() => {
    if (!sendState.isSuccess) return;

    setStep("code");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, [sendState.isSuccess]);

  // شمارش معکوس ارسال مجدد
  useEffect(() => {
    if (cooldown <= 0) return;

    cooldownRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  // بعد از تأیید موفق کد: پروفایل رو بکش و هدایت کن
  useEffect(() => {
    if (!verifyState.isSuccess) return;

    (async () => {
      await refreshUser();
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
    })();
  }, [verifyState.isSuccess, refreshUser, router, searchParams]);

  if (step === "mobile") {
    return (
      <Box component="form" action={sendFormAction}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          ورود با کد پیامکی
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          شماره موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود
        </Typography>

        {sendState.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {sendState.error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            name="mobile"
            label="شماره موبایل"
            type="tel"
            placeholder="09xxxxxxxxx"
            required
            fullWidth
            autoComplete="tel"
            slotProps={{
              htmlInput: { pattern: "^09[0-9]{9}$", maxLength: 11 },
            }}
          />

          <SendCodeButton />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 3, justifyContent: "center" }}
        >
          <MuiLink component={NextLink} href="/login" variant="body2">
            ورود با ایمیل و رمز عبور
          </MuiLink>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Box component="form" action={verifyFormAction}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          کد تأیید را وارد کنید
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          کد ۶ رقمی برای شماره‌ی {sendState.mobile} پیامک شد
        </Typography>

        {verifyState.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {verifyState.error}
          </Alert>
        )}

        <input type="hidden" name="mobile" value={sendState.mobile} />

        <Stack spacing={2}>
          <OtpCodeInput name="code" length={6} />

          <VerifyCodeButton />
        </Stack>
      </Box>

      {/* این فرم عمداً بیرون از فرم بالاست - HTML اجازه‌ی تودرتو بودن فرم‌ها رو نمی‌ده */}
      <Stack sx={{ mt: 3, alignItems: "center" }} spacing={1}>
        {cooldown > 0 ? (
          <Typography variant="body2" color="text.secondary">
            ارسال مجدد کد تا {cooldown} ثانیه‌ی دیگر
          </Typography>
        ) : (
          <Box component="form" action={sendFormAction}>
            <input type="hidden" name="mobile" value={sendState.mobile} />
            <MuiLink component="button" type="submit" variant="body2">
              ارسال مجدد کد
            </MuiLink>
          </Box>
        )}

        <MuiLink
          component="button"
          type="button"
          variant="body2"
          onClick={() => setStep("mobile")}
        >
          تغییر شماره موبایل
        </MuiLink>
      </Stack>
    </Box>
  );
}
