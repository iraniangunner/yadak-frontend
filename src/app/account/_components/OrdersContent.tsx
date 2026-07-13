"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import { ordersAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/OrdersContent.tsx
|--------------------------------------------------------------------------
*/

type Order = {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
};

const statusLabels: Record<
  string,
  { label: string; color: "default" | "warning" | "info" | "success" | "error" }
> = {
  pending_review: { label: "در انتظار بررسی", color: "warning" },
  needs_customer_confirmation: { label: "نیاز به تأیید شما", color: "warning" },
  awaiting_payment: { label: "در انتظار پرداخت", color: "info" },
  paid: { label: "پرداخت‌شده", color: "success" },
  cancelled: { label: "لغوشده", color: "default" },
  expired: { label: "منقضی‌شده", color: "error" },
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
    new Date(dateStr),
  );
}

export function OrdersContent() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    ordersAPI
      .list()
      .then((res) => setOrders(res.data.data))
      .catch(() => setError("خطا در دریافت سفارش‌ها. دوباره تلاش کنید."));
  }, []);

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (orders === null) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          p: 5,
          textAlign: "center",
        }}
      >
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          هنوز سفارشی ثبت نکرده‌اید
        </Typography>
        <Button
          component={NextLink}
          href="/"
          variant="contained"
          disableElevation
        >
          مشاهده‌ی محصولات
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {orders.map((order) => {
        const status = statusLabels[order.status] || {
          label: order.status,
          color: "default" as const,
        };

        return (
          <Box
            key={order.id}
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                سفارش #{order.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(order.created_at)}
              </Typography>
            </Box>

            <Chip label={status.label} color={status.color} size="small" />

            <Typography sx={{ fontWeight: 700 }}>
              {formatPrice(order.total_amount)}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}
