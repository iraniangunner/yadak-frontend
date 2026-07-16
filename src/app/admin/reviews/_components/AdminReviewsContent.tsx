"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Rating,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminReviewsContent.tsx
|--------------------------------------------------------------------------
*/

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  user: { id: number; name: string };
  product: { id: number; title: string; slug: string };
};

export function AdminReviewsContent() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState("pending");

  const loadReviews = () => {
    setReviews(null);
    adminAPI.reviews
      .list({ status: statusFilter, page: page + 1, per_page: rowsPerPage })
      .then((res) => {
        setReviews(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page, rowsPerPage]);

  const handleApprove = async (id: number) => {
    await adminAPI.reviews.approve(id);
    loadReviews();
  };

  const handleReject = async (id: number) => {
    if (!confirm("این نظر رد و حذف بشه؟")) return;
    await adminAPI.reviews.reject(id);
    loadReviews();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        نظرات کاربران
      </Typography>

      <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>وضعیت</InputLabel>
        <Select
          label="وضعیت"
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value);
          }}
        >
          <MenuItem value="pending">در انتظار تأیید</MenuItem>
          <MenuItem value="approved">تأییدشده</MenuItem>
          <MenuItem value="all">همه</MenuItem>
        </Select>
      </FormControl>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>کاربر</TableCell>
              <TableCell>محصول</TableCell>
              <TableCell>امتیاز</TableCell>
              <TableCell>متن نظر</TableCell>
              <TableCell>تاریخ</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews === null ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">نظری یافت نشد</Typography>
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id} hover>
                  <TableCell>{review.user.name}</TableCell>
                  <TableCell sx={{ maxWidth: 160 }}>
                    <Typography variant="body2" noWrap>
                      {review.product.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Rating value={review.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {review.comment || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDateTime(review.created_at)}</TableCell>
                  <TableCell align="center">
                    {!review.is_approved && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApprove(review.id)}
                        title="تأیید"
                      >
                        <Check fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleReject(review.id)}
                      title="رد و حذف"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="ردیف در صفحه"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} از ${count}`
          }
        />
      </TableContainer>
    </Box>
  );
}
