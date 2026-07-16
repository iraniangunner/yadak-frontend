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
} from "@mui/material";
import { Add, Remove, Delete, ShoppingBag } from "@mui/icons-material";
import { useCartStore } from "@/lib/store/cartStore";
import { productsAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/CartContent.tsx
|--------------------------------------------------------------------------
*/

const stockStatusLabels: Record<
  string,
  { label: string; color: "success" | "error" | "warning" | "info" }
> = {
  available: { label: "موجود", color: "success" },
  stopped: { label: "متوقف‌شده", color: "warning" },
  out_of_stock: { label: "ناموجود", color: "error" },
  incoming: { label: "در حال تأمین", color: "info" },
};

export function CartContent() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateItemInfo = useCartStore((s) => s.updateItemInfo);

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
          productsAPI
            .priceForQuantity(item.product_id, item.quantity)
            .catch(() => null),
        ]).then(([showRes, priceRes]) => {
          if (!showRes) return;
          updateItemInfo(item.product_id, {
            title: showRes.data.product.title,
            thumbnail_url: showRes.data.product.thumbnail_url,
            stock_status: showRes.data.product.stock_status,
            unit_price:
              priceRes?.data.unit_price ?? showRes.data.product.final_price,
          });
        }),
      ),
    ).finally(() => setIsSyncing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          سبد خرید
        </Typography>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ShoppingBag sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            سبد خرید شما خالیه
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            محصولات موردعلاقه‌تون رو پیدا کنید و به سبد اضافه کنید
          </Typography>
          <Button
            component={NextLink}
            href="/products"
            variant="contained"
            disableElevation
          >
            مشاهده‌ی محصولات
          </Button>
        </Box>
      </Container>
    );
  }

  const hasUnavailableItems = items.some(
    (i) => i.stock_status === "out_of_stock" || i.stock_status === "stopped",
  );
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        سبد خرید
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ flex: "2 1 400px" }}>
          {isSyncing && (
            <Alert severity="info" sx={{ mb: 2 }}>
              در حال بروزرسانی قیمت و موجودی...
            </Alert>
          )}

          {items.map((item) => {
            const stock = stockStatusLabels[item.stock_status] || {
              label: item.stock_status,
              color: "default" as any,
            };
            const isUnavailable =
              item.stock_status === "out_of_stock" ||
              item.stock_status === "stopped";

            return (
              <Box
                key={item.product_id}
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  p: 2,
                  mb: 2,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                  opacity: isUnavailable ? 0.6 : 1,
                }}
              >
                <Box
                  component={NextLink}
                  href={`/products/${item.slug}`}
                  sx={{ flexShrink: 0, display: "block" }}
                >
                  <Box
                    component="img"
                    src={item.thumbnail_url || undefined}
                    alt={item.title}
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 2,
                      bgcolor: "background.default",
                    }}
                  />
                </Box>

                <Box sx={{ flex: "1 1 160px", minWidth: 0 }}>
                  <Typography
                    component={NextLink}
                    href={`/products/${item.slug}`}
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      textDecoration: "none",
                      display: "block",
                      mb: 0.5,
                    }}
                    noWrap
                  >
                    {item.title}
                  </Typography>
                  <Chip label={stock.label} color={stock.color} size="small" />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity - 1)
                    }
                    disabled={isUnavailable}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <TextField
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.product_id,
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                    size="small"
                    disabled={isUnavailable}
                    sx={{ width: 48, "& fieldset": { border: "none" } }}
                    slotProps={{
                      htmlInput: { style: { textAlign: "center" } },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity + 1)
                    }
                    disabled={isUnavailable}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, minWidth: 100, textAlign: "left" }}
                >
                  {formatPrice(item.unit_price * item.quantity)}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => removeItem(item.product_id)}
                >
                  <Delete fontSize="small" color="error" />
                </IconButton>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            flex: "1 1 260px",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 3,
            position: "sticky",
            top: 90,
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 2 }}>خلاصه‌ی سفارش</Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              جمع جزء ({items.reduce((s, i) => s + i.quantity, 0)} کالا)
            </Typography>
            <Typography variant="body2">{formatPrice(subtotal)}</Typography>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 2 }}
          >
            هزینه‌ی ارسال در مرحله‌ی بعد محاسبه می‌شه
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>مبلغ قابل پرداخت</Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {formatPrice(subtotal)}
            </Typography>
          </Box>

          {hasUnavailableItems && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              برخی کالاها ناموجودند. برای ادامه، حذفشون کنید.
            </Alert>
          )}

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
        </Box>
      </Box>
    </Container>
  );
}
