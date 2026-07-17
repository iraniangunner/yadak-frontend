"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Card, CardMedia, CardContent, CardActionArea, CardActions, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Rating } from "@mui/material";
import { NotificationsActive, Check, ShoppingCart } from "@mui/icons-material";
import { productsAPI } from "@/lib/api";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductCard.tsx
|--------------------------------------------------------------------------
| بدون گوشه‌ی گرد (borderRadius: 0) - عرض واقعی کارت رو گرید والد
| (ProductsPageContent.tsx / HomeContent.tsx) کنترل می‌کنه، اونجا هم
| minmax رو عریض‌تر کردم.
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
  average_rating?: number | null;
  reviews_count?: number;
};

type StockColor = "success" | "error" | "warning" | "info" | "default";

const stockStatusLabels: Record<string, { label: string; color: StockColor; dot: string }> = {
  available: { label: "موجود", color: "success", dot: "#1FA97D" },
  stopped: { label: "متوقف‌شده", color: "warning", dot: "#D99B3D" },
  out_of_stock: { label: "ناموجود", color: "error", dot: "#D9534F" },
  incoming: { label: "در حال تأمین", color: "info", dot: "#3D8BD9" },
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const cartItem = useCartStore((s) => s.items.find((i) => i.product_id === product.id));
  const addToCart = useCartStore((s) => s.addItem);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobile, setMobile] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const stock = stockStatusLabels[product.stock_status] || {
    label: product.stock_status,
    color: "default" as StockColor,
    dot: "#9AA0A6",
  };
  const hasDiscount = !!product.compare_price && product.compare_price > product.final_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.final_price) / product.compare_price!) * 100)
    : 0;
  const isOutOfStock = product.stock_status === "out_of_stock" || product.stock_status === "stopped";
  const isPurchasable = product.stock_status === "available" || product.stock_status === "incoming";

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
        borderRadius: 2,
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.06)",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "background.paper",
        transition: "border-color .2s ease, box-shadow .2s ease, transform .2s ease",
        "&:hover": {
          borderColor: "rgba(0,0,0,0.1)",
          boxShadow: "0 12px 28px -12px rgba(20,20,20,0.18)",
          transform: "translateY(-2px)",
        },
        "&:hover .product-card-media": {
          transform: "scale(1.045)",
        },
      }}
    >
      <CardActionArea
        component={NextLink}
        href={`/products/${product.slug}`}
        disableRipple
        sx={{
          "&:hover .MuiCardActionArea-focusHighlight": { opacity: 0 },
          "& .MuiCardActionArea-focusHighlight": { opacity: 0 },
        }}
      >
        <Box sx={{ position: "relative", overflow: "hidden", bgcolor: "#F7F7F5" }}>
          <CardMedia
            component="img"
            className="product-card-media"
            image={product.thumbnail_url || undefined}
            alt={product.title}
            loading="lazy"
            sx={{
              height: 190,
              objectFit: "cover",
              display: "block",
              transition: "transform .45s cubic-bezier(.2,.7,.3,1)",
            }}
          />
          {hasDiscount && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                insetInlineStart: 10,
                px: 1,
                py: 0.4,
                bgcolor: "rgba(217,83,79,0.94)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.2,
                lineHeight: 1,
                backdropFilter: "blur(2px)",
              }}
            >
              ٪{discountPercent}−
            </Box>
          )}
        </Box>

        <CardContent sx={{ pb: 1.25, pt: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              mb: 1,
              minHeight: 40,
              lineHeight: 1.5,
              color: "text.primary",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mb: 1,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body1" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: -0.2 }}>
                {formatPrice(product.final_price)}
              </Typography>
              {hasDiscount && (
                <Typography variant="caption" sx={{ textDecoration: "line-through", color: "text.disabled" }}>
                  {formatPrice(product.compare_price!)}
                </Typography>
              )}
            </Box>

            {product.average_rating != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating value={product.average_rating} precision={0.1} readOnly size="small" />
                {product.reviews_count != null && (
                  <Typography variant="caption" color="text.secondary">
                    ({product.reviews_count})
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: stock.dot, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              {stock.label}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>

      {isPurchasable && (
        <CardActions sx={{ px: 1.75, pb: 1.75, pt: 0, mt: "auto" }}>
          {cartItem ? (
            <Button
              size="small"
              fullWidth
              variant="text"
              color="success"
              disableElevation
              disabled
              startIcon={<Check fontSize="small" />}
              sx={{
                py: 0.9,
                fontWeight: 600,
                bgcolor: "rgba(31,169,125,0.08)",
                "&.Mui-disabled": { color: "success.main" },
              }}
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
              sx={{
                py: 0.9,
                fontWeight: 600,
                boxShadow: "none",
              }}
            >
              افزودن به سبد
            </Button>
          )}
        </CardActions>
      )}

      {isOutOfStock && (
        <CardActions sx={{ px: 1.75, pb: 1.75, pt: 0, mt: "auto", flexDirection: "column", alignItems: "stretch" }}>
          {subscribed ? (
            <Button
              size="small"
              fullWidth
              disabled
              startIcon={<Check fontSize="small" />}
              sx={{ py: 0.9, fontWeight: 600, color: "success.main", "&.Mui-disabled": { color: "success.main" } }}
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
              sx={{
                py: 0.9,
                fontWeight: 600,
                borderColor: "rgba(0,0,0,0.14)",
                color: "text.primary",
                "&:hover": { borderColor: "rgba(0,0,0,0.28)", bgcolor: "rgba(0,0,0,0.02)" },
              }}
            >
              اطلاع بده وقتی موجود شد
            </Button>
          )}
          {error && !dialogOpen && (
            <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.75 }}>
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
            شماره موبایلتون رو وارد کنید تا وقتی «{product.title}» موجود شد بهتون پیامک بدیم.
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
          <Button color="inherit" onClick={() => setDialogOpen(false)} disabled={isSaving}>
            انصراف
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubscribe}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ fontWeight: 600 }}
          >
            ثبت
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}