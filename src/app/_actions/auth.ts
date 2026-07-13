"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

// باید دقیقاً با Passport::refreshTokensExpireIn توی AppServiceProvider
// بک‌اند یکی باشه (۱۴ روز)، وگرنه کوکی زودتر/دیرتر از توکن واقعی منقضی می‌شه.
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 14;

async function setAuthCookies(data: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  const c = await cookies();
  c.set("access_token", data.access_token, {
    ...cookieBase,
    maxAge: data.expires_in,
  });
  c.set("refresh_token", data.refresh_token, {
    ...cookieBase,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

// ========================
// Login (ایمیل + پسورد)
// ========================
export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { isSuccess: false, error: "ایمیل و رمز عبور را وارد کنید" };
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        isSuccess: false,
        error: data.message || "ایمیل یا رمز عبور اشتباه است",
      };
    }

    await setAuthCookies(data);

    return { isSuccess: true, error: "" };
  } catch {
    return { isSuccess: false, error: "خطا در برقراری ارتباط با سرور" };
  }
}

// ========================
// Register
// ========================
export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const password_confirmation = formData.get("password_confirmation") as string;

  if (!name || !email || !password || !password_confirmation) {
    return { isSuccess: false, error: "همه فیلدها را پر کنید" };
  }

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errors = data.errors;
      return {
        isSuccess: false,
        error: errors
          ? Object.values(errors).flat().join(" - ")
          : data.message || "خطا در ثبت‌نام",
      };
    }

    return { isSuccess: true, error: "" };
  } catch {
    return { isSuccess: false, error: "خطا در برقراری ارتباط با سرور" };
  }
}

// ========================
// Send OTP (مرحله ۱ ورود پیامکی)
// ========================
export async function sendOtpAction(prevState: any, formData: FormData) {
  const mobile = (formData.get("mobile") as string)?.trim();

  if (!mobile) {
    return { isSuccess: false, error: "شماره موبایل را وارد کنید", mobile: "" };
  }

  try {
    const res = await fetch(`${API_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errors = data.errors;
      return {
        isSuccess: false,
        error: errors
          ? Object.values(errors).flat().join(" - ")
          : data.message || "خطا در ارسال کد",
        mobile,
      };
    }

    return { isSuccess: true, error: "", mobile };
  } catch {
    return { isSuccess: false, error: "خطا در برقراری ارتباط با سرور", mobile };
  }
}

// ========================
// Verify OTP (مرحله ۲ ورود پیامکی)
// ========================
export async function verifyOtpAction(prevState: any, formData: FormData) {
  const mobile = (formData.get("mobile") as string)?.trim();
  const code = (formData.get("code") as string)?.trim();

  if (!mobile || !code) {
    return { isSuccess: false, error: "کد تأیید را وارد کنید", mobile };
  }

  try {
    const res = await fetch(`${API_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, code }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        isSuccess: false,
        error: data.message || "کد تأیید نامعتبر است",
        mobile,
      };
    }

    await setAuthCookies(data);

    return { isSuccess: true, error: "", mobile };
  } catch {
    return { isSuccess: false, error: "خطا در برقراری ارتباط با سرور", mobile };
  }
}

// ========================
// Forgot Password
// ========================
export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { isSuccess: false, error: "ایمیل را وارد کنید" };
  }

  try {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errors = data.errors;
      return {
        isSuccess: false,
        error: errors
          ? Object.values(errors).flat().join(" - ")
          : data.message || "خطا در ارسال لینک بازیابی",
      };
    }

    return { isSuccess: true, error: "", message: data.message as string };
  } catch {
    return { isSuccess: false, error: "خطا در برقراری ارتباط با سرور" };
  }
}

// ========================
// Reset Password
// ========================
export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get("token") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirmation = formData.get("password_confirmation") as string;

  if (!token || !email || !password || !password_confirmation) {
    return { isSuccess: false, error: "همه فیلدها را پر کنید" };
  }

  try {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        email,
        password,
        password_confirmation,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errors = data.errors;
      return {
        isSuccess: false,
        error: errors
          ? Object.values(errors).flat().join(" - ")
          : data.message || "خطا در تغییر رمز عبور",
      };
    }

    return { isSuccess: true, error: "" };
  } catch {
    return { isSuccess: false, error: "خطا در برقراری ارتباط با سرور" };
  }
}

// ========================
// Logout
// ========================
export async function logoutAction() {
  const c = await cookies();
  const accessToken = c.get("access_token")?.value;

  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });
  } catch {}

  c.delete("access_token");
  c.delete("refresh_token");

  return { isSuccess: true };
}
