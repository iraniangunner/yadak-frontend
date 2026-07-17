"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Chip,
  Divider,
  Alert,
  Container,
  Tooltip,
  Rating,
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  DeleteOutline,
  ShoppingBag,
  ShoppingCart,
  CheckCircle,
  Payments,
  Person,
  InfoOutlined,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { productsAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/CartContent.tsx
|--------------------------------------------------------------------------
*/

const stockStatusLabels: Record<string, { label: string; color: "success" | "error" | "warning" | "info" }> = {
  available: { label: "موجود", color: "success" },
  stopped: { label: "متوقف‌شده", color: "warning" },
  out_of_stock: { label: "ناموجود", color: "error" },
  incoming: { label: "در حال تأمین", color: "info" },
};

// ------------------------------------------------------------------
// نشانگر مراحل خرید - سبد خرید (فعال، سمت راست) ← تکمیل اطلاعات ← پرداخت
// ------------------------------------------------------------------
function CheckoutSteps() {
  const steps = [
    { label: "سبد خرید", icon: <ShoppingCart fontSize="small" /> },
    { label: "تکمیل اطلاعات", icon: <CheckCircle fontSize="small" /> },
    { label: "پرداخت", icon: <Payments fontSize="small" /> },
  ];

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 4 }}>
      {steps.map((step, idx) => {
        const isActive = idx === 0; // «سبد خرید» مرحله‌ی جاریه

        return (
          <Box key={step.label} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {idx > 0 && (
              <Box sx={{ width: { xs: 24, sm: 56 }, height: "1px", borderTop: "1px dashed", borderColor: "divider" }} />
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isActive ? "primary.main" : "background.default",
                  color: isActive ? "#fff" : "text.disabled",
                }}
              >
                {step.icon}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 400, color: isActive ? "text.primary" : "text.disabled" }}>
                {step.label}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export function CartContent() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateItemInfo = useCartStore((s) => s.updateItemInfo);
  const clearCart = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);

  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || items.length === 0) {
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    Promise.all(
      items.map((item) =>
        Promise.all([
          productsAPI.show(item.slug).catch(() => null),
          productsAPI.priceForQuantity(item.product_id, item.quantity).catch(() => null),
        ]).then(([showRes, priceRes]) => {
          if (!showRes) return;
          updateItemInfo(item.product_id, {
            title: showRes.data.product.title,
            thumbnail_url: showRes.data.product.thumbnail_url,
            stock_status: showRes.data.product.stock_status,
            unit_price: priceRes?.data.unit_price ?? showRes.data.product.final_price,
            compare_price: showRes.data.product.compare_price,
            brand_name: showRes.data.product.brand?.name,
            average_rating: showRes.data.product.average_rating,
          });
        })
      )
    ).finally(() => setIsSyncing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CheckoutSteps />
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ShoppingBag sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            سبد خرید شما خالیه
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            محصولات موردعلاقه‌تون رو پیدا کنید و به سبد اضافه کنید
          </Typography>
          <Button component={NextLink} href="/products" variant="contained" disableElevation>
            مشاهده‌ی محصولات
          </Button>
        </Box>
      </Container>
    );
  }

  const hasUnavailableItems = items.some((i) => i.stock_status === "out_of_stock" || i.stock_status === "stopped");
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const discountTotal = items.reduce(
    (sum, i) => sum + (i.compare_price && i.compare_price > i.unit_price ? (i.compare_price - i.unit_price) * i.quantity : 0),
    0
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CheckoutSteps />

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* لیست آیتم‌ها - سمت راست (بزرگ‌تر) */}
        <Box sx={{ flex: "2 1 420px", display: "flex", flexDirection: "column", gap: 2 }}>
          {isSyncing && (
            <Alert severity="info">در حال بروزرسانی قیمت و موجودی...</Alert>
          )}

          {items.map((item) => {
            const stock = stockStatusLabels[item.stock_status] || { label: item.stock_status, color: "default" as any };
            const isUnavailable = item.stock_status === "out_of_stock" || item.stock_status === "stopped";
            const hasDiscount = item.compare_price && item.compare_price > item.unit_price;
            const discountPercent = hasDiscount
              ? Math.round(((item.compare_price! - item.unit_price) / item.compare_price!) * 100)
              : 0;

            return (
              <Box
                key={item.product_id}
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  p: 2,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  opacity: isUnavailable ? 0.6 : 1,
                }}
              >
                {/* تصویر - سمت راست کارت */}
                <Box component={NextLink} href={`/products/${item.slug}`} sx={{ flexShrink: 0 }}>
                  <Box
                    component="img"
                    src={item.thumbnail_url || undefined}
                    alt={item.title}
                    sx={{ width: 92, height: 92, objectFit: "cover", borderRadius: 2, bgcolor: "background.default" }}
                  />
                </Box>

                {/* ستون محتوا */}
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {/* ردیف ۱: عنوان + حذف */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                      <Typography
                        component={NextLink}
                        href={`/products/${item.slug}`}
                        variant="body1"
                        sx={{ fontWeight: 700, color: "text.primary", textDecoration: "none" }}
                        noWrap
                      >
                        {item.title}
                      </Typography>
                    </Box>
                    <Tooltip title="حذف از سبد">
                      <IconButton size="small" onClick={() => removeItem(item.product_id)} sx={{ flexShrink: 0 }}>
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* ردیف ۲: برند + وضعیت موجودی */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {item.brand_name && (
                      <Typography variant="caption" color="text.secondary">
                        {item.brand_name}
                      </Typography>
                    )}
                    <Chip label={stock.label} color={stock.color} size="small" sx={{ height: 20 }} />
                  </Box>

                  {/* ردیف ۳: امتیاز هم‌سطح قیمت */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    {item.average_rating != null ? (
                      <Rating value={item.average_rating} precision={0.1} readOnly size="small" />
                    ) : (
                      <Box />
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {hasDiscount && (
                        <Chip label={`٪${discountPercent}`} color="error" size="small" sx={{ fontWeight: 700, height: 22 }} />
                      )}
                      {hasDiscount && (
                        <Typography variant="caption" color="text.secondary" sx={{ textDecoration: "line-through" }}>
                          {formatPrice(item.compare_price!)}
                        </Typography>
                      )}
                      <Typography variant="body1" sx={{ fontWeight: 800 }}>
                        {formatPrice(item.unit_price)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 0.25 }} />

                  {/* ردیف ۴: تعداد + جمع این ردیف */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <IconButton size="small" onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={isUnavailable}>
                        <Remove fontSize="small" />
                      </IconButton>
                      <TextField
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product_id, Math.max(1, Number(e.target.value) || 1))}
                        size="small"
                        disabled={isUnavailable}
                        sx={{ width: 44, "& fieldset": { border: "none" } }}
                        slotProps={{ htmlInput: { style: { textAlign: "center", padding: "6px 0" } } }}
                      />
                      <IconButton size="small" onClick={() => updateQuantity(item.product_id, item.quantity + 1)} disabled={isUnavailable}>
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      جمع:{" "}
                      <Typography component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {formatPrice(item.unit_price * item.quantity)}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* خلاصه‌ی سفارش - سمت چپ (کوچیک‌تر، sticky) */}
        <Box
          sx={{
            flex: "1 1 300px",
            maxWidth: { md: 340 },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 3,
            position: "sticky",
            top: 90,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography sx={{ fontWeight: 700 }}>سبد خرید ({items.length})</Typography>
            <Tooltip title="خالی کردن کل سبد">
              <IconButton size="small" onClick={() => clearCart()}>
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              جمع جزء
            </Typography>
            <Typography variant="body2">{formatPrice(subtotal + discountTotal)}</Typography>
          </Box>

          {discountTotal > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                تخفیف محصولات
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                {formatPrice(discountTotal)}-
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              هزینه‌ی ارسال
            </Typography>
            <Typography variant="body2">۰ تومان</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, bgcolor: "background.default", borderRadius: 2, p: 1.5, mb: 2 }}>
            <InfoOutlined sx={{ fontSize: 16, color: "text.secondary", mt: "2px" }} />
            <Typography variant="caption" color="text.secondary">
              هزینه‌ی ارسال در ادامه بر اساس آدرس و روش ارسال انتخابی شما محاسبه و به این مبلغ اضافه می‌شود.
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>مبلغ قابل پرداخت</Typography>
            <Typography sx={{ fontWeight: 800 }}>{formatPrice(subtotal)}</Typography>
          </Box>

          {hasUnavailableItems && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              برخی کالاها ناموجودند. برای ادامه، حذفشون کنید.
            </Alert>
          )}

          {user ? (
            <Button
              component={NextLink}
              href="/checkout"
              variant="contained"
              disableElevation
              fullWidth
              size="large"
              disabled={hasUnavailableItems || isSyncing}
            >
              تسویه‌حساب
            </Button>
          ) : (
            <Button
              component={NextLink}
              href="/login?redirect=/checkout"
              variant="contained"
              disableElevation
              fullWidth
              size="large"
              startIcon={<Person />}
              disabled={hasUnavailableItems || isSyncing}
            >
              ورود / ثبت‌نام
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}