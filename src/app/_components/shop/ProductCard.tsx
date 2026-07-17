"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { NotificationsActive, Check, ShoppingCart } from "@mui/icons-material";
import { productsAPI } from "@/lib/api";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductCard.tsx
|--------------------------------------------------------------------------
| از کامپوننت‌های واقعی MUI (Card, CardMedia, CardContent, CardActionArea,
| CardActions) استفاده شده - نه یه Box شبیه‌سازی‌شده.
*/

export type ProductCardData = {
  id: number;
  slug: string;
  title: string;
  price: number;
  final_price: number;
  compare_price?: number | null;
  stock_status: string;
  thumbnail_url: string | null;
};

type StockColor = "success" | "error" | "warning" | "info" | "default";

const stockStatusLabels: Record<string, { label: string; color: StockColor }> = {
  available: { label: "موجود", color: "success" },
  stopped: { label: "متوقف‌شده", color: "warning" },
  out_of_stock: { label: "ناموجود", color: "error" },
  incoming: { label: "در حال تأمین", color: "info" },
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const cartItem = useCartStore((s) =>
    s.items.find((i) => i.product_id === product.id),
  );
  const addToCart = useCartStore((s) => s.addItem);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobile, setMobile] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const stock = stockStatusLabels[product.stock_status] || {
    label: product.stock_status,
    color: "default",
  };
  const hasDiscount =
    !!product.compare_price && product.compare_price > product.final_price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_price! - product.final_price) /
          product.compare_price!) *
          100,
      )
    : 0;
  const isOutOfStock =
    product.stock_status === "out_of_stock" ||
    product.stock_status === "stopped";
  const isPurchasable =
    product.stock_status === "available" || product.stock_status === "incoming";

  // نگه‌داشتن دیالوگ باز تا نتیجه واقعی درخواست مشخص بشه، به‌جای بستن خوش‌بینانه
  const handleSubscribe = async () => {
    if (!/^09[0-9]{9}$/.test(mobile)) {
      setError("شماره موبایل معتبر نیست (باید با 09 شروع بشه و ۱۱ رقم باشه).");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await productsAPI.subscribeStock(product.id, { mobile });
      setSubscribed(true);
      setDialogOpen(false);
    } catch (err) {
      setError("ثبت اطلاع‌رسانی ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    addToCart({
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      thumbnail_url: product.thumbnail_url,
      unit_price: product.final_price,
      compare_price: product.compare_price,
      stock_status: product.stock_status,
    });
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow .15s",
        "&:hover": { boxShadow: "0 2px 10px rgba(0,0,0,0.12)" },
      }}
    >
      <CardActionArea
        component={NextLink}
        href={`/products/${product.slug}`}
        data-active={cartItem ? "" : undefined}
        sx={{
          "&[data-active]": {
            bgcolor: "action.selected",
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={product.thumbnail_url || undefined}
            alt={product.title}
            loading="lazy"
            sx={{
              height: 170,
              objectFit: "cover",
              bgcolor: "background.default",
            }}
          />
          {hasDiscount && (
            <Chip
              label={`٪${discountPercent}`}
              color="error"
              size="small"
              sx={{ position: "absolute", top: 8, right: 8, fontWeight: 800 }}
            />
          )}
        </Box>

        <CardContent sx={{ pb: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 0.75, minHeight: 40 }}
          >
            {product.title}
          </Typography>

          <Box
            sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.75 }}
          >
            <Typography
              variant="body1"
              color="primary.main"
              sx={{ fontWeight: 700 }}
            >
              {formatPrice(product.final_price)}
            </Typography>
            {hasDiscount && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {formatPrice(product.compare_price!)}
              </Typography>
            )}
          </Box>

          <Chip label={stock.label} color={stock.color} size="small" />
        </CardContent>
      </CardActionArea>

      {/* ردیف پایین: افزودن به سبد / نشانگر «در سبد» */}
      {isPurchasable && (
        <CardActions sx={{ px: 1.5, pb: 1.5, pt: 0, mt: "auto" }}>
          {cartItem ? (
            <Button
              size="small"
              fullWidth
              variant="outlined"
              color="success"
              disableElevation
              disabled
              startIcon={<Check fontSize="small" />}
            >
              در سبد
            </Button>
          ) : (
            <Button
              size="small"
              fullWidth
              variant="contained"
              disableElevation
              startIcon={<ShoppingCart fontSize="small" />}
              onClick={handleAdd}
            >
              افزودن به سبد
            </Button>
          )}
        </CardActions>
      )}

      {isOutOfStock && (
        <CardActions
          sx={{
            px: 1.5,
            pb: 1.5,
            pt: 0,
            mt: "auto",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          {subscribed ? (
            <Button
              size="small"
              fullWidth
              disabled
              startIcon={<Check fontSize="small" />}
              sx={{ color: "success.main" }}
            >
              اطلاع‌رسانی ثبت شد
            </Button>
          ) : (
            <Button
              size="small"
              fullWidth
              variant="outlined"
              startIcon={<NotificationsActive fontSize="small" />}
              onClick={() => setDialogOpen(true)}
            >
              اطلاع بده وقتی موجود شد
            </Button>
          )}
          {error && !dialogOpen && (
            <Typography
              variant="caption"
              color="error"
              sx={{ display: "block", mt: 0.5 }}
            >
              {error}
            </Typography>
          )}
        </CardActions>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => !isSaving && setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>اطلاع‌رسانی موجودی</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            شماره موبایلتون رو وارد کنید تا وقتی «{product.title}» موجود شد
            بهتون پیامک بدیم.
          </Typography>
          <TextField
            label="شماره موبایل"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="09xxxxxxxxx"
            fullWidth
            disabled={isSaving}
            slotProps={{ htmlInput: { maxLength: 11 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            color="inherit"
            onClick={() => setDialogOpen(false)}
            disabled={isSaving}
          >
            انصراف
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubscribe}
            disabled={isSaving}
            startIcon={
              isSaving ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            ثبت
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}