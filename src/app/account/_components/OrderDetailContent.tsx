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
  Divider,
  Alert,
} from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { ordersAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/OrderDetailContent.tsx
|--------------------------------------------------------------------------
*/

type OrderItem = {
  id: number;
  title: string;
  sku: string;
  price: number;
  quantity: number;
};

type StatusHistory = {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string;
};

type OrderDetail = {
  id: number;
  status: string;
  subtotal: number;
  discount_amount: number;
  cart_discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  customer_note: string | null;
  admin_note: string | null;
  created_at: string;
  paid_at: string | null;
  payment_ref_id: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  items: OrderItem[];
  status_histories: StatusHistory[];
  shipping_receiver_name: string | null;
  shipping_receiver_phone: string | null;
  shipping_city: string | null;
  shipping_full_address: string | null;
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

function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

export function OrderDetailContent({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isActing, setIsActing] = useState(false);

  const loadOrder = () => {
    ordersAPI
      .show(orderId)
      .then((res) => setOrder(res.data.order || res.data))
      .catch(() => setError("سفارش پیدا نشد یا دسترسی ندارید."));
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleConfirm = async () => {
    setIsActing(true);
    setActionError("");
    try {
      await ordersAPI.confirm(orderId);
      loadOrder();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "تأیید سفارش ناموفق بود.");
    } finally {
      setIsActing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("این سفارش لغو بشه؟")) return;
    setIsActing(true);
    setActionError("");
    try {
      await ordersAPI.cancel(orderId);
      loadOrder();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "لغو سفارش ناموفق بود.");
    } finally {
      setIsActing(false);
    }
  };

  const handlePay = async () => {
    setIsActing(true);
    setActionError("");
    try {
      const res = await ordersAPI.pay(orderId);
      const paymentUrl = res.data.payment_url || res.data.url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setActionError("لینک پرداخت دریافت نشد.");
      }
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || "ساخت لینک پرداخت ناموفق بود."
      );
    } finally {
      setIsActing(false);
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!order) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const status = statusLabels[order.status] || {
    label: order.status,
    color: "default" as const,
  };
  const canCancel = [
    "pending_review",
    "needs_customer_confirmation",
    "awaiting_payment",
  ].includes(order.status);

  return (
    <Box>
      <Box
        component={NextLink}
        href="/account/orders"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          color: "text.secondary",
          textDecoration: "none",
          mb: 2,
        }}
      >
        <ChevronRight fontSize="small" />
        <Typography variant="body2">بازگشت به سفارش‌ها</Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          سفارش #{order.id}
        </Typography>
        <Chip label={status.label} color={status.color} />
      </Box>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {(order.status === "needs_customer_confirmation" ||
        order.status === "awaiting_payment" ||
        order.status === "expired" ||
        canCancel) && (
        <Stack direction="row" spacing={1.5} sx={{ mb: 3, flexWrap: "wrap" }}>
          {order.status === "needs_customer_confirmation" && (
            <Button
              variant="contained"
              disableElevation
              onClick={handleConfirm}
              disabled={isActing}
            >
              تأیید تغییرات سفارش
            </Button>
          )}
          {(order.status === "awaiting_payment" ||
            order.status === "expired") && (
            <Button
              variant="contained"
              disableElevation
              color="success"
              onClick={handlePay}
              disabled={isActing}
            >
              {order.status === "expired"
                ? "تلاش مجدد برای پرداخت"
                : "پرداخت سفارش"}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={isActing}
            >
              لغو سفارش
            </Button>
          )}
        </Stack>
      )}

      {(order.payment_ref_id || order.invoice_url) && (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          {order.payment_ref_id && (
            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                p: 2,
                flex: "1 1 200px",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                کد پیگیری پرداخت
              </Typography>
              <Typography
                sx={{ fontWeight: 700, direction: "ltr", textAlign: "right" }}
              >
                {order.payment_ref_id}
              </Typography>
            </Box>
          )}
          {order.invoice_url && (
            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                p: 2,
                flex: "1 1 200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  فاکتور
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {order.invoice_number}
                </Typography>
              </Box>
              <Button
                href={order.invoice_url}
                target="_blank"
                rel="noopener"
                size="small"
              >
                مشاهده
              </Button>
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          p: 3,
          mb: 3,
        }}
      >
        <Typography sx={{ fontWeight: 700, mb: 2 }}>اقلام سفارش</Typography>
        <Stack spacing={1.5} divider={<Divider />}>
          {order.items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.quantity} عدد × {formatPrice(item.price)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatPrice(item.price * item.quantity)}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            جمع جزء
          </Typography>
          <Typography variant="body2">{formatPrice(order.subtotal)}</Typography>
        </Box>
        {order.discount_amount > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              تخفیف
            </Typography>
            <Typography variant="body2" color="success.main">
              {formatPrice(order.discount_amount)}-
            </Typography>
          </Box>
        )}
        {order.cart_discount_amount > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              تخفیف خرید عمده
            </Typography>
            <Typography variant="body2" color="success.main">
              {formatPrice(order.cart_discount_amount)}-
            </Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            هزینه‌ی ارسال
          </Typography>
          <Typography variant="body2">
            {formatPrice(order.shipping_cost)}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 700 }}>مبلغ نهایی</Typography>
          <Typography sx={{ fontWeight: 800 }}>
            {formatPrice(order.total_amount)}
          </Typography>
        </Box>
      </Box>

      {order.shipping_full_address && (
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: 3,
            mb: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>آدرس تحویل</Typography>
          <Typography variant="body2">
            {order.shipping_receiver_name} — {order.shipping_receiver_phone}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.shipping_city}، {order.shipping_full_address}
          </Typography>
        </Box>
      )}

      {order.admin_note && (
        <Alert severity="info" sx={{ mb: 3 }}>
          یادداشت ادمین: {order.admin_note}
        </Alert>
      )}

      {order.status_histories?.length > 0 && (
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 2 }}>
            تاریخچه‌ی وضعیت
          </Typography>
          <Stack spacing={1.5}>
            {order.status_histories.map((h) => (
              <Box
                key={h.id}
                sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2">
                    {h.from_status && h.from_status !== h.to_status
                      ? `${
                          statusLabels[h.from_status]?.label || h.from_status
                        } ← `
                      : ""}
                    {statusLabels[h.to_status]?.label || h.to_status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(h.created_at)}
                  </Typography>
                </Box>
                {h.note && (
                  <Typography variant="caption" color="text.secondary">
                    {h.note}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
