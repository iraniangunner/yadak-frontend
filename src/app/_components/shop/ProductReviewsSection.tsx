"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  Avatar,
  Stack,
} from "@mui/material";
import { productReviewsAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import { formatDate } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductReviewsSection.tsx
|--------------------------------------------------------------------------
*/

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: { id: number; name: string };
};

export function ProductReviewsSection({
  productId,
  averageRating,
  reviewsCount,
}: {
  productId: number;
  averageRating: number | null;
  reviewsCount: number;
}) {
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadReviews = () => {
    productReviewsAPI.list(productId).then((res) => setReviews(res.data.data));
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async () => {
    if (!rating) {
      setError("لطفاً امتیاز رو انتخاب کنید.");
      return;
    }
    setIsSaving(true);
    setError("");

    try {
      const res = await productReviewsAPI.create(productId, {
        rating,
        comment: comment || undefined,
      });
      setSuccessMessage(
        res.data.message ||
          "نظر شما ثبت شد و پس از بررسی ادمین نمایش داده می‌شود.",
      );
      setComment("");
      setRating(0);
      loadReviews();
    } catch (err: any) {
      setError(
        err?.response?.data?.errors?.rating?.[0] || "ثبت نظر ناموفق بود.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          نظرات کاربران
        </Typography>
        {averageRating !== null && (
          <>
            <Rating
              value={averageRating}
              precision={0.1}
              readOnly
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              ({reviewsCount} نظر)
            </Typography>
          </>
        )}
      </Stack>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          p: 3,
          mb: 3,
        }}
      >
        {!user ? (
          <Typography variant="body2" color="text.secondary">
            برای ثبت نظر، ابتدا{" "}
            <Box
              component={NextLink}
              href="/login"
              sx={{ color: "primary.main", fontWeight: 600 }}
            >
              وارد حساب کاربری خود شوید
            </Box>
            .
          </Typography>
        ) : (
          <>
            <Typography sx={{ fontWeight: 600, mb: 1.5 }}>
              نظر خود را ثبت کنید
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert
                severity="info"
                sx={{ mb: 2 }}
                onClose={() => setSuccessMessage("")}
              >
                {successMessage}
              </Alert>
            )}

            <Rating
              value={rating}
              onChange={(_, v) => setRating(v)}
              sx={{ mb: 2 }}
            />

            <TextField
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="نظرتون رو درباره‌ی این محصول بنویسید (اختیاری)"
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              disableElevation
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "در حال ثبت..." : "ثبت نظر"}
            </Button>
          </>
        )}
      </Box>

      {reviews === null ? (
        <Typography color="text.secondary">در حال بارگذاری...</Typography>
      ) : reviews.length === 0 ? (
        <Typography color="text.secondary">
          هنوز نظری برای این محصول ثبت نشده.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <Box
              key={review.id}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                p: 2.5,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center", mb: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: "0.85rem",
                  }}
                >
                  {review.user.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {review.user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(review.created_at)}
                  </Typography>
                </Box>
                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                  sx={{ mr: "auto" }}
                />
              </Stack>
              {review.comment && (
                <Typography variant="body2" color="text.secondary">
                  {review.comment}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
