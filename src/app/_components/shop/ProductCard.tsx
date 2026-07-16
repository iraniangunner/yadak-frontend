"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import { NotificationsActive, Check } from "@mui/icons-material";
import { productStockSubscribeAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductCard.tsx
|--------------------------------------------------------------------------
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

const stockStatusLabels: Record<
  string,
  { label: string; color: "success" | "error" | "warning" | "info" }
> = {
  available: { label: "موجود", color: "success" },
  stopped: { label: "متوقف‌شده", color: "warning" },
  out_of_stock: { label: "ناموجود", color: "error" },
  incoming: { label: "در حال تأمین", color: "info" },
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobile, setMobile] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const stock = stockStatusLabels[product.stock_status] || {
    label: product.stock_status,
    color: "default" as any,
  };
  const hasDiscount =
    product.compare_price && product.compare_price > product.final_price;
  const isOutOfStock =
    product.stock_status === "out_of_stock" ||
    product.stock_status === "stopped";

  const handleSubscribe = async () => {
    if (!/^09[0-9]{9}$/.test(mobile)) {
      setError("شماره موبایل معتبر نیست (باید با 09 شروع بشه و ۱۱ رقم باشه).");
      return;
    }

    // آپدیت خوش‌بینانه: بلافاصله «ثبت شد» رو نشون می‌دیم، بدون اینکه
    // منتظر پاسخ سرور بمونیم - اگه درخواست خطا داد، برمی‌گردونیم عقب.
    setSubscribed(true);
    setDialogOpen(false);
    setIsSaving(true);
    setError("");

    try {
      await productStockSubscribeAPI.subscribe(product.id, mobile);
    } catch (err) {
      setSubscribed(false);
      setError("ثبت اطلاع‌رسانی ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow .15s",
        "&:hover": { boxShadow: "0 2px 10px rgba(0,0,0,0.12)" },
      }}
    >
      <Box
        component={NextLink}
        href={`/products/${product.slug}`}
        sx={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        <Box
          component="img"
          src={product.thumbnail_url || undefined}
          alt={product.title}
          sx={{
            width: "100%",
            height: 170,
            objectFit: "cover",
            bgcolor: "background.default",
            display: "block",
          }}
        />
        <Box sx={{ p: 1.5, pb: 1 }}>
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
        </Box>
      </Box>

      {isOutOfStock && (
        <Box sx={{ px: 1.5, pb: 1.5, mt: "auto" }}>
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
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
            slotProps={{ htmlInput: { maxLength: 11 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)}>
            انصراف
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubscribe}
            disabled={isSaving}
          >
            ثبت
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
