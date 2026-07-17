"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  TablePagination,
  Tooltip,
} from "@mui/material";
import { Favorite, ShoppingCart } from "@mui/icons-material";
import { favoritesAPI } from "@/lib/api";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/FavoritesContent.tsx
|--------------------------------------------------------------------------
*/

type Product = {
  id: number;
  slug: string;
  title: string;
  final_price: number;
  compare_price: number | null;
  stock_status: string;
  thumbnail_url: string | null;
  brand?: { id: number; name: string } | null;
};

type FavoriteRow = { id: number; product: Product };

const stockStatusLabels: Record<
  string,
  { label: string; color: "success" | "error" | "warning" | "info" }
> = {
  available: { label: "موجود", color: "success" },
  stopped: { label: "متوقف‌شده", color: "warning" },
  out_of_stock: { label: "ناموجود", color: "error" },
  incoming: { label: "در حال تأمین", color: "info" },
};

export function FavoritesContent() {
  const addToCart = useCartStore((s) => s.addItem);

  const [favorites, setFavorites] = useState<FavoriteRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [removingIds, setRemovingIds] = useState<number[]>([]);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const loadFavorites = () => {
    setFavorites(null);
    favoritesAPI.list({ page: page + 1, per_page: rowsPerPage }).then((res) => {
      setFavorites(res.data.data);
      setTotal(res.data.total);
    });
  };

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleRemove = async (productId: number) => {
    setRemovingIds((prev) => [...prev, productId]);
    setFavorites(
      (prev) => prev?.filter((f) => f.product.id !== productId) ?? null,
    );

    try {
      await favoritesAPI.remove(productId);
    } catch {
      loadFavorites();
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      thumbnail_url: product.thumbnail_url,
      unit_price: product.final_price,
      compare_price: product.compare_price,
      stock_status: product.stock_status,
      brand_name: product.brand?.name,
    });
    setAddedIds((prev) => [...prev, product.id]);
  };

  if (favorites === null) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (favorites.length === 0) {
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
        <Favorite sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          هنوز محصولی رو به علاقه‌مندی‌ها اضافه نکرده‌اید
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
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 2,
          mb: 2,
        }}
      >
        {favorites.map(({ id, product }) => {
          const stock = stockStatusLabels[product.stock_status] || {
            label: product.stock_status,
            color: "default" as any,
          };
          const isRemoving = removingIds.includes(product.id);
          const isAdded = addedIds.includes(product.id);
          const isPurchasable =
            product.stock_status === "available" ||
            product.stock_status === "incoming";

          return (
            <Box
              key={id}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                overflow: "hidden",
                opacity: isRemoving ? 0.4 : 1,
                transition: "opacity .15s",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                component={NextLink}
                href={`/products/${product.slug}`}
                sx={{ display: "block", position: "relative" }}
              >
                <Box
                  component="img"
                  src={product.thumbnail_url || undefined}
                  alt={product.title}
                  sx={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    bgcolor: "background.default",
                    display: "block",
                  }}
                />
                <Tooltip title="حذف از علاقه‌مندی‌ها">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(product.id);
                    }}
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "background.paper",
                      boxShadow: 1,
                      "&:hover": { bgcolor: "background.paper" },
                    }}
                  >
                    <Favorite fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <Typography
                  component={NextLink}
                  href={`/products/${product.slug}`}
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    textDecoration: "none",
                    mb: 0.5,
                  }}
                  noWrap
                >
                  {product.title}
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Typography
                    variant="body2"
                    color="primary.main"
                    sx={{ fontWeight: 700 }}
                  >
                    {formatPrice(product.final_price)}
                  </Typography>
                  <Chip
                    label={stock.label}
                    color={stock.color}
                    size="small"
                    sx={{ height: 20 }}
                  />
                </Box>

                <Box sx={{ mt: "auto" }}>
                  {isPurchasable ? (
                    <Button
                      size="small"
                      fullWidth
                      variant={isAdded ? "outlined" : "contained"}
                      disableElevation
                      startIcon={<ShoppingCart fontSize="small" />}
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdded}
                    >
                      {isAdded ? "به سبد اضافه شد" : "افزودن به سبد"}
                    </Button>
                  ) : (
                    <Button size="small" fullWidth disabled>
                      ناموجود
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[12, 24, 48]}
        labelRowsPerPage="ردیف در صفحه"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} از ${count}`
        }
      />
    </Box>
  );
}
