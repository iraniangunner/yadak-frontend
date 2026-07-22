"use client";

import { useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { Box, Container, Typography, Button } from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Receipt,
  ShoppingBag,
  AccessTime,
  SearchOff,
} from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/PaymentResultContent.tsx
|--------------------------------------------------------------------------
| این صفحه بعد از برگشت مرورگر کاربر از درگاه پرداخت (زرین‌پال) باز می‌شه.
| خودِ تأیید واقعی پرداخت سمت سرور (PaymentController::callback) قبلاً
| اتفاق افتاده؛ این فقط نتیجه‌ی نهایی رو نمایش می‌ده.
|
| مقادیر status دقیقاً مطابق PaymentController::callback:
| success | already_paid | failed | expired | not_found
*/

type ResultConfig = {
  icon: React.ReactNode;
  color: "success.main" | "error.main" | "warning.main" | "text.disabled";
  title: string;
  description: (orderId: string | null) => string;
  primaryAction: "order" | "none";
};

const resultConfigs: Record<string, ResultConfig> = {
  success: {
    icon: <CheckCircle sx={{ fontSize: 72 }} />,
    color: "success.main",
    title: "پرداخت با موفقیت انجام شد",
    description: (orderId) =>
      orderId
        ? `سفارش شما (#${orderId}) با موفقیت پرداخت شد.`
        : "سفارش شما با موفقیت پرداخت شد.",
    primaryAction: "order",
  },
  already_paid: {
    icon: <CheckCircle sx={{ fontSize: 72 }} />,
    color: "success.main",
    title: "این سفارش قبلاً پرداخت شده",
    description: (orderId) =>
      orderId
        ? `سفارش #${orderId} از قبل با موفقیت پرداخت شده بود.`
        : "این سفارش از قبل پرداخت شده بود.",
    primaryAction: "order",
  },
  failed: {
    icon: <Cancel sx={{ fontSize: 72 }} />,
    color: "error.main",
    title: "پرداخت ناموفق بود",
    description: () =>
      "پرداخت شما تکمیل نشد یا توسط شما لغو شد. مبلغی از حساب شما کسر نشده؛ می‌تونید دوباره تلاش کنید.",
    primaryAction: "order",
  },
  expired: {
    icon: <AccessTime sx={{ fontSize: 72 }} />,
    color: "warning.main",
    title: "لینک پرداخت منقضی شده",
    description: () =>
      "مهلت ۳۰ دقیقه‌ای این لینک پرداخت به پایان رسیده. از صفحه‌ی سفارش، یه لینک پرداخت جدید بسازید.",
    primaryAction: "order",
  },
  not_found: {
    icon: <SearchOff sx={{ fontSize: 72 }} />,
    color: "text.disabled",
    title: "سفارش پیدا نشد",
    description: () => "اطلاعات این تراکنش با هیچ سفارشی مطابقت نداشت.",
    primaryAction: "none",
  },
};

export function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "";
  const orderId = searchParams.get("order_id");

  const config = resultConfigs[status] || resultConfigs.failed;

  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
      <Box sx={{ color: config.color, mb: 2 }}>{config.icon}</Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        {config.title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {config.description(orderId)}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {config.primaryAction === "order" && (
          <Button
            component={NextLink}
            href={orderId ? `/account/orders/${orderId}` : "/account/orders"}
            variant="contained"
            disableElevation
            startIcon={<Receipt />}
          >
            مشاهده‌ی سفارش
          </Button>
        )}
        <Button
          component={NextLink}
          href="/"
          variant="outlined"
          startIcon={<ShoppingBag />}
        >
          ادامه‌ی خرید
        </Button>
      </Box>
    </Container>
  );
}
