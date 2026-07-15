"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
} from "@mui/material";
import { myReferralAPI } from "@/lib/api";
import { formatPrice, formatDateTime } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/staff/_components/MyReferralContent.tsx
|--------------------------------------------------------------------------
| برخلاف AdminReferralContent (که همه‌ی کدها رو مدیریت می‌کنه)، این فقط
| اطلاعات خودِ کاربر لاگین‌شده (فروشنده) رو نمایش می‌ده - بدون قابلیت
| ویرایش، چون ساخت/ویرایش کد معرف فقط کار ادمینه.
*/

type ReferralCode = {
  id: number;
  code: string;
  commission_type: "percentage" | "fixed";
  commission_value: number;
  is_active: boolean;
};

type Commission = {
  id: number;
  commission_amount: number | null;
  status: "pending" | "approved" | "paid" | "cancelled";
  created_at: string;
  order: { id: number; status: string; total_amount: number };
};

const statusLabels: Record<
  string,
  { label: string; color: "default" | "warning" | "info" | "success" }
> = {
  pending: { label: "در انتظار پرداخت سفارش", color: "warning" },
  approved: { label: "قابل پرداخت", color: "info" },
  paid: { label: "پرداخت‌شده", color: "success" },
  cancelled: { label: "لغوشده", color: "default" },
};

export function MyReferralContent() {
  const [codes, setCodes] = useState<ReferralCode[] | null>(null);
  const [commissions, setCommissions] = useState<Commission[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    myReferralAPI.code().then((res) => setCodes(res.data.data));
  }, []);

  useEffect(() => {
    setCommissions(null);
    myReferralAPI
      .commissions({ page: page + 1, per_page: rowsPerPage })
      .then((res) => {
        setCommissions(res.data.data);
        setTotal(res.data.total);
      });
  }, [page, rowsPerPage]);

  const totalEarned = (commissions || [])
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        کد معرف و پورسانت من
      </Typography>

      {codes === null ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : codes.length === 0 ? (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 4,
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography color="text.secondary">
            هنوز هیچ کد معرفی برای شما تعریف نشده. برای فعال‌سازی، به ادمین
            اطلاع بدید.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
          {codes.map((code) => (
            <Box
              key={code.id}
              sx={{
                flex: "1 1 240px",
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                p: 3,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                کد معرف شما
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  direction: "ltr",
                  textAlign: "right",
                  mb: 1,
                }}
              >
                {code.code}
              </Typography>
              <Chip
                label={
                  code.commission_type === "percentage"
                    ? `${code.commission_value}٪ پورسانت`
                    : `${formatPrice(code.commission_value)} پورسانت ثابت`
                }
                color="primary"
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip
                label={code.is_active ? "فعال" : "غیرفعال"}
                color={code.is_active ? "success" : "default"}
                size="small"
              />
            </Box>
          ))}

          <Box
            sx={{
              flex: "1 1 240px",
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              p: 3,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              مجموع پورسانت پرداخت‌شده (صفحه‌ی جاری)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
              {formatPrice(totalEarned)}
            </Typography>
          </Box>
        </Box>
      )}

      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
        تاریخچه‌ی پورسانت‌ها
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>سفارش</TableCell>
              <TableCell>مبلغ پورسانت</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>تاریخ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commissions === null ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : commissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    هنوز پورسانتی ثبت نشده
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              commissions.map((c) => {
                const status = statusLabels[c.status];
                return (
                  <TableRow key={c.id} hover>
                    <TableCell>#{c.order.id}</TableCell>
                    <TableCell>
                      {c.commission_amount
                        ? formatPrice(c.commission_amount)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(c.created_at)}</TableCell>
                  </TableRow>
                );
              })
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
