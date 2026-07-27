"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Rating,
  Snackbar,
  Alert,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  Share,
  ShoppingCart,
  Add,
  Remove,
  Check,
  ArrowBackIosNew,
  VerifiedUser,
  LocalShipping,
  AssignmentReturn,
  DirectionsCar,
} from "@mui/icons-material";
import { productsAPI, favoritesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { ServerProductDetail } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/product/ProductInfoCard.tsx
|--------------------------------------------------------------------------
| نسبت به قبل: کد کالا نمایش داده می‌شه، برچسب سازگاری خودرو (اگه پر
| شده باشه)، مبلغ دقیق صرفه‌جویی (نه فقط درصد)، دکمه‌ی «اطلاع بده وقتی
| موجود شد» برای محصولات ناموجود/متوقف‌شده (قبلاً اصلاً نبود!)، badge
| های اعتماد به‌صورت آیکون‌دار توی دایره، و امکان تایپ مستقیم تعداد.
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

const trustFeatures = [
  { icon: VerifiedUser, text: "ضمانت اصالت کالا" },
  { icon: LocalShipping, text: "ارسال سریع به سراسر کشور" },
  { icon: AssignmentReturn, text: "امکان مرجوعی تا ۷ روز" },
];

export function ProductInfoCard({ product }: { product: ServerProductDetail }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) =>
    s.items.some((i) => i.product_id === product.id)
  );

  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(product.final_price);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!user) return;
    productsAPI
      .show(product.slug)
      .then((res) => setIsFavorited(res.data.is_favorited));
  }, [user, product.slug]);

  useEffect(() => {
    productsAPI.priceForQuantity(product.id, quantity).then((res) => {
      setUnitPrice(res.data.unit_price ?? product.final_price);
    });
  }, [quantity, product.id, product.final_price]);

  const stock = stockStatusLabels[product.stock_status] || {
    label: product.stock_status,
    color: "default" as any,
  };
  const isPurchasable =
    product.stock_status === "available" || product.stock_status === "incoming";
  const hasDiscount =
    product.compare_price && product.compare_price > product.final_price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_price! - product.final_price) /
          product.compare_price!) *
          100
      )
    : 0;
  const savingsAmount = hasDiscount
    ? product.compare_price! - product.final_price
    : 0;

  const hasVehicleInfo = product.vehicle_brand || product.vehicle_model;

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    const next = !isFavorited;
    setIsFavorited(next);

    try {
      if (next) await favoritesAPI.add(product.id);
      else await favoritesAPI.remove(product.id);
    } catch {
      setIsFavorited(!next);
    }
  };

  const handleAddToCart = () => {
    addToCart(
      {
        product_id: product.id,
        slug: product.slug,
        title: product.title,
        thumbnail_url: product.thumbnail_url,
        unit_price: unitPrice,
        compare_price: product.compare_price,
        stock_status: product.stock_status,
        brand_name: product.brand?.name,
        average_rating: product.average_rating,
      },
      quantity
    );
    setToast("به سبد خرید اضافه شد");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url });
      } catch {
        /* کاربر انصراف داد */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setToast("لینک کپی شد");
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        p: 3,
        position: "sticky",
        top: 90,
      }}
    >
      {/* امتیاز - گوشه‌ی بالا چپ کارت (absolute) */}
      {product.average_rating !== null && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            insetInlineEnd: 16,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              bgcolor: "success.main",
              color: "#fff",
              borderRadius: 1.5,
              px: 1,
              py: 0.25,
              fontWeight: 800,
              fontSize: "0.9rem",
              lineHeight: 1.4,
            }}
          >
            {product.average_rating.toFixed(1)}
          </Box>
          <Box>
            <Rating
              value={product.average_rating}
              precision={0.1}
              readOnly
              size="small"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              ({product.reviews_count} نظر)
            </Typography>
          </Box>
        </Box>
      )}

      {/* برند + عنوان + کد کالا */}
      {product.brand && (
        <Chip
          label={product.brand.name}
          size="small"
          variant="outlined"
          sx={{ mb: 1 }}
        />
      )}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 0.5,
          lineHeight: 1.4,
          pr: product.average_rating !== null ? 10 : 0,
        }}
      >
        {product.title}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 1.5, fontFamily: "monospace" }}
      >
        کد کالا: {product.sku}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Chip label={stock.label} color={stock.color} size="small" />
        {hasVehicleInfo && (
          <Chip
            icon={<DirectionsCar sx={{ fontSize: 16 }} />}
            label={[product.vehicle_brand, product.vehicle_model]
              .filter(Boolean)
              .join(" ")}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
      </Box>

      {/* جعبه‌ی قیمت - هایلایت‌شده */}
      <Box
        sx={{
          bgcolor: "background.default",
          borderRadius: 2,
          p: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {hasDiscount && (
            <Chip
              label={`٪${discountPercent}−`}
              color="error"
              size="small"
              sx={{ fontWeight: 800 }}
            />
          )}
          {hasDiscount && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              {formatPrice(product.compare_price!)}
            </Typography>
          )}
        </Box>
        <Typography
          variant="h4"
          color="primary.main"
          sx={{ fontWeight: 800, mt: 0.5 }}
        >
          {formatPrice(unitPrice)}
        </Typography>
        {hasDiscount && (
          <Typography
            variant="caption"
            sx={{
              color: "success.main",
              fontWeight: 700,
              display: "block",
              mt: 0.25,
            }}
          >
            {formatPrice(savingsAmount)} صرفه‌جویی کردید
          </Typography>
        )}

        {/* تخفیف پلکانی - فقط اگه محصول واقعاً قیمت پلکانی داشته باشه */}
        {product.price_tiers && product.price_tiers.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              pt: 1.5,
              borderTop: "1px dashed",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, display: "block", mb: 0.75 }}
            >
              خرید عمده، صرفه‌ی بیشتر:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {product.price_tiers
                .slice()
                .sort((a, b) => a.min_quantity - b.min_quantity)
                .map((tier) => (
                  <Box
                    key={tier.id}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {tier.max_quantity
                        ? `${tier.min_quantity} تا ${tier.max_quantity} عدد`
                        : `${tier.min_quantity} عدد به بالا`}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {formatPrice(tier.price)} / عدد
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </Box>

      {isPurchasable ? (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 999,
                overflow: "hidden",
                bgcolor: "background.default",
              }}
            >
              <IconButton
                size="small"
                onClick={() => setQuantity((q) => q + 1)}
                sx={{
                  borderRadius: 0,
                  width: 40,
                  height: 40,
                  "&:hover": { bgcolor: "rgba(30,58,138,0.08)" },
                }}
              >
                <Add fontSize="small" />
              </IconButton>
              <Typography
                sx={{
                  width: 40,
                  textAlign: "center",
                  fontWeight: 700,
                  userSelect: "none",
                }}
              >
                {quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                sx={{
                  borderRadius: 0,
                  width: 40,
                  height: 40,
                  "&:hover": { bgcolor: "rgba(30,58,138,0.08)" },
                }}
              >
                <Remove fontSize="small" />
              </IconButton>
            </Box>

            {isInCart ? (
              <Button
                variant="outlined"
                color="success"
                disableElevation
                size="large"
                disabled
                startIcon={<Check />}
                sx={{ flex: "1 1 180px", fontWeight: 700 }}
              >
                در سبد
              </Button>
            ) : (
              <Button
                variant="contained"
                disableElevation
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                sx={{ flex: "1 1 180px", fontWeight: 700 }}
              >
                افزودن به سبد خرید
              </Button>
            )}
          </Box>

          {isInCart && (
            <Box
              component={NextLink}
              href="/cart"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                mt: 1.5,
                py: 1,
                borderRadius: 999,
                bgcolor: "rgba(30,58,138,0.06)",
                color: "primary.main",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "background-color .15s, gap .15s",
                "&:hover": { bgcolor: "rgba(30,58,138,0.12)", gap: 1.25 },
              }}
            >
              مشاهده‌ی سبد خرید
              <ArrowBackIosNew sx={{ fontSize: 13 }} />
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">این محصول فعلاً قابل خرید نیست.</Alert>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <Button
          variant="outlined"
          color={isFavorited ? "error" : "inherit"}
          startIcon={
            isFavorited ? (
              <Favorite fontSize="small" />
            ) : (
              <FavoriteBorder fontSize="small" />
            )
          }
          onClick={handleToggleFavorite}
          size="small"
          sx={{ flex: 1 }}
        >
          {isFavorited ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
        </Button>
        <Tooltip title="اشتراک‌گذاری">
          <IconButton
            onClick={handleShare}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <Share fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* ویژگی‌های اطمینان‌بخش - آیکون‌دار توی دایره */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {trustFeatures.map(({ icon: Icon, text }) => (
          <Box
            key={text}
            sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "rgba(30,58,138,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 16, color: "primary.main" }} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {text}
            </Typography>
          </Box>
        ))}
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setToast("")}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
