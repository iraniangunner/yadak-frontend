"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Chip,
  IconButton,
  Button,
  TextField,
  Rating,
  Divider,
  Snackbar,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  Share,
  ShoppingCart,
  Add,
  Remove,
  NavigateNext,
} from "@mui/icons-material";
import { productsAPI, favoritesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { ProductImageCarousel } from "@/app/_components/shop/ProductImageCarousel";
import { ProductReviewsSection } from "@/app/_components/shop/ProductReviewsSection";
import { RelatedProductsCarousel } from "@/app/_components/shop/RelatedProductsCarousel";
import { ProductCardData } from "@/app/_components/shop/ProductCard";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductDetailContent.tsx
|--------------------------------------------------------------------------
*/

type ProductImage = { id: number; url: string };
type ProductAttribute = { id: number; name: string; value: string };

type ProductDetail = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  final_price: number;
  compare_price: number | null;
  stock_status: string;
  thumbnail_url: string | null;
  average_rating: number | null;
  reviews_count: number;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  images: ProductImage[];
  product_attributes: ProductAttribute[];
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

export function ProductDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductCardData[]>([]);
  const [toast, setToast] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    productsAPI
      .show(slug)
      .then((res) => {
        setProduct(res.data.product);
        setIsFavorited(res.data.is_favorited);
        setUnitPrice(res.data.product.final_price);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    productsAPI.priceForQuantity(product.id, quantity).then((res) => {
      setUnitPrice(res.data.unit_price ?? product.final_price);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, product?.id]);

  useEffect(() => {
    if (!product?.category) return;
    productsAPI
      .list({ category_id: product.category.id, per_page: 10 })
      .then((res) => {
        setRelatedProducts(
          res.data.data.filter((p: ProductCardData) => p.id !== product.id),
        );
      });
  }, [product?.category, product?.id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }
    if (!product) return;

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
    if (!product || !unitPrice) return;

    addToCart(
      {
        product_id: product.id,
        slug: product.slug,
        title: product.title,
        thumbnail_url: product.thumbnail_url,
        unit_price: unitPrice,
        stock_status: product.stock_status,
      },
      quantity,
    );
    setToast("به سبد خرید اضافه شد");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.title, url });
      } catch {
        /* کاربر انصراف داد */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setToast("لینک کپی شد");
    }
  };

  if (notFound) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">محصول پیدا نشد</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <Skeleton
            variant="rounded"
            width={400}
            height={400}
            sx={{ borderRadius: 3 }}
          />
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Skeleton width="60%" height={40} />
            <Skeleton width="30%" height={30} />
            <Skeleton width="40%" height={50} sx={{ mt: 2 }} />
          </Box>
        </Box>
      </Container>
    );
  }

  const stock = stockStatusLabels[product.stock_status] || {
    label: product.stock_status,
    color: "default" as any,
  };
  const isPurchasable =
    product.stock_status === "available" || product.stock_status === "incoming";
  const hasDiscount =
    product.compare_price && product.compare_price > product.final_price;
  const images =
    product.images.length > 0
      ? product.images.map((i) => i.url)
      : [product.thumbnail_url || ""];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Box
          component={NextLink}
          href="/"
          sx={{ color: "text.secondary", textDecoration: "none" }}
        >
          خانه
        </Box>
        <Box
          component={NextLink}
          href="/products"
          sx={{ color: "text.secondary", textDecoration: "none" }}
        >
          محصولات
        </Box>
        {product.category && (
          <Box
            component={NextLink}
            href={`/products?category_id=${product.category.id}`}
            sx={{ color: "text.secondary", textDecoration: "none" }}
          >
            {product.category.name}
          </Box>
        )}
        <Typography color="text.primary">{product.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 5 }}>
        <Box sx={{ width: { xs: "100%", md: 420 }, flexShrink: 0 }}>
          <ProductImageCarousel images={images} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 260 }}>
          {product.brand && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {product.brand.name}
            </Typography>
          )}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {product.title}
          </Typography>

          {product.average_rating !== null && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Rating
                value={product.average_rating}
                precision={0.1}
                readOnly
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                ({product.reviews_count} نظر)
              </Typography>
            </Box>
          )}

          <Box
            sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 1.5 }}
          >
            <Typography
              variant="h5"
              color="primary.main"
              sx={{ fontWeight: 800 }}
            >
              {formatPrice(unitPrice ?? product.final_price)}
            </Typography>
            {hasDiscount && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {formatPrice(product.compare_price!)}
              </Typography>
            )}
          </Box>

          <Chip
            label={stock.label}
            color={stock.color}
            size="small"
            sx={{ mb: 3 }}
          />

          {isPurchasable && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
              }}
            >
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
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                  size="small"
                  sx={{ width: 56, "& fieldset": { border: "none" } }}
                  slotProps={{ htmlInput: { style: { textAlign: "center" } } }}
                />
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>

              <Button
                variant="contained"
                disableElevation
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                sx={{ flex: "1 1 200px" }}
              >
                افزودن به سبد خرید
              </Button>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1 }}>
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
            >
              {isFavorited ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            </Button>
            <IconButton
              onClick={handleShare}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <Share fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {product.product_attributes.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            ویژگی‌های محصول
          </Typography>
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {product.product_attributes.map((attr, idx) => (
              <Box
                key={attr.id}
                sx={{
                  display: "flex",
                  px: 2.5,
                  py: 1.5,
                  borderBottom:
                    idx < product.product_attributes.length - 1
                      ? "1px solid"
                      : "none",
                  borderColor: "divider",
                  bgcolor: idx % 2 === 0 ? "background.default" : "transparent",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ width: 160, flexShrink: 0 }}
                >
                  {attr.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {attr.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {product.description && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            توضیحات
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-line", lineHeight: 1.9 }}
          >
            {product.description}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 5 }} />

      <Box sx={{ mb: 5 }}>
        <ProductReviewsSection
          productId={product.id}
          averageRating={product.average_rating}
          reviewsCount={product.reviews_count}
        />
      </Box>

      {relatedProducts.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            محصولات مرتبط
          </Typography>
          <RelatedProductsCarousel products={relatedProducts} />
        </Box>
      )}

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
    </Container>
  );
}
