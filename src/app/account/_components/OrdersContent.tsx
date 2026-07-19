"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  LinearProgress,
} from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { ordersAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/OrdersContent.tsx
|--------------------------------------------------------------------------
| فیلتر وضعیت + صفحه‌بندی، هر دو سمت سرور. برخلاف نسخه‌ی قبلی، دیگه هیچ
| تشخیص جدایی بین «هیچ‌وقت سفارش نداشته» و «فیلتر فعلی خالیه» نمی‌دیم -
| چون همون منطق باعث یه race condition می‌شد (یه لحظه با total قدیمیِ
| فیلتر قبلی، پیام غلط «هیچ‌وقت سفارش نداشتید» فلش می‌زد). الان همیشه
| فیلتر+جدول نمایش داده می‌شه؛ خالی بودن فقط داخل خودِ جدول نشون داده
| می‌شه، مستقل از دلیلش.
*/

type Order = {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
};

const statusLabels: Record<
  string,
  { label: string; color: "default" | "warning" | "info" | "success" | "error" }
> = {
  pending_review: { label: "در انتظار بررسی", color: "warning" },
  needs_customer_confirmation: { label: "نیاز به تأیید شما", color: "warning" },
  awaiting_payment: { label: "در انتظار پرداخت", color: "info" },
  paid: { label: "پرداخت‌شده", color: "success" },
  cancelled: { label: "لغوشده", color: "default" },
  expired: { label: "منقضی‌شده", color: "error" },
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
    new Date(dateStr)
  );
}

export function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCreatedId = searchParams.get("created");

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadedStatusFilter, setLoadedStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadOrders = () => {
    setIsLoading(true);
    ordersAPI
      .list({
        page: page + 1,
        per_page: rowsPerPage,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
      .then((res) => {
        setOrders(res.data.data);
        setTotal(res.data.total);
        // این فیلتر رو همزمان با خودِ داده آپدیت می‌کنیم - نه statusFilter
        // زنده رو مستقیم بخونیم - چون ممکنه data قدیمی (از فیلتر قبلی)
        // هنوز روی صفحه باشه درحالی‌که statusFilter از قبل عوض شده.
        setLoadedStatusFilter(statusFilter);
      })
      .catch(() => setError("خطا در دریافت سفارش‌ها. دوباره تلاش کنید."))
      .finally(() => {
        setIsLoading(false);
        setIsFirstLoad(false);
      });
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter]);

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // فقط موقع اولین بارگذاری صفحه (قبل از هر داده‌ای)، یه Spinner تمام‌عرض نشون بده
  if (isFirstLoad) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box>
      {justCreatedId && (
        <Alert severity="success" sx={{ mb: 2 }}>
          سفارش شما با موفقیت ثبت شد و در حال بررسیه.
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>وضعیت سفارش</InputLabel>
          <Select
            label="وضعیت سفارش"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="all">همه</MenuItem>
            {Object.entries(statusLabels).map(([value, { label }]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        {isLoading && (
          <LinearProgress
            sx={{ position: "absolute", top: 0, insetInline: 0, zIndex: 1 }}
          />
        )}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شماره سفارش</TableCell>
              <TableCell>تاریخ ثبت</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>مبلغ</TableCell>
              <TableCell align="center">جزئیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders && orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <Typography
                    color="text.secondary"
                    sx={{ mb: loadedStatusFilter === "all" ? 2 : 0 }}
                  >
                    {loadedStatusFilter === "all"
                      ? "هنوز سفارشی ثبت نکرده‌اید"
                      : "سفارشی با این وضعیت پیدا نشد"}
                  </Typography>
                  {loadedStatusFilter === "all" && (
                    <Button
                      component={NextLink}
                      href="/"
                      variant="contained"
                      disableElevation
                      size="small"
                    >
                      مشاهده‌ی محصولات
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              orders?.map((order) => {
                const status = statusLabels[order.status] || {
                  label: order.status,
                  color: "default" as const,
                };
                const isNew = justCreatedId === String(order.id);

                return (
                  <TableRow
                    key={order.id}
                    hover
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: isNew ? "rgba(30,58,138,0.04)" : "transparent",
                      "& td": {
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      },
                    }}
                  >
                    <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>
                      #{order.id}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.primary", fontWeight: 700 }}>
                      {formatPrice(order.total_amount)}
                    </TableCell>
                    <TableCell align="center">
                      <ChevronLeft
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {total > 0 && (
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
        )}
      </TableContainer>
    </Box>
  );
}
