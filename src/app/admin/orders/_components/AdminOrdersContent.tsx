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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import { Visibility, Check, Close } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatPrice, formatDateTime } from "@/lib/format";
import { orderStatusLabels, getOrderStatusMeta } from "@/lib/orderStatus";
import { AdminOrderDetailContent } from "./AdminOrderDetailContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminOrdersContent.tsx
|--------------------------------------------------------------------------
*/

type Order = {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
  user?: { name: string; phone: string | null };
};

export function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const loadOrders = () => {
    setOrders(null);
    adminAPI.orders
      .list({
        status: statusFilter || undefined,
        page: page + 1,
        per_page: rowsPerPage,
      })
      .then((res) => {
        setOrders(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter]);

  const handleApprove = async (id: number) => {
    await adminAPI.orders.approve(id);
    loadOrders();
  };

  const handleCancel = async (id: number) => {
    if (!confirm("این سفارش لغو بشه؟")) return;
    await adminAPI.orders.cancel(id);
    loadOrders();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        سفارش‌ها
      </Typography>

      <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
        <InputLabel>وضعیت</InputLabel>
        <Select
          label="وضعیت"
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value);
          }}
        >
          <MenuItem value="">همه</MenuItem>
          {Object.entries(orderStatusLabels).map(([value, { label }]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شماره سفارش</TableCell>
              <TableCell>مشتری</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>مبلغ</TableCell>
              <TableCell>تاریخ</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders === null ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">سفارشی یافت نشد</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const status = getOrderStatusMeta(order.status);

                return (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      {order.user?.name || "-"}
                      {order.user?.phone && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {order.user.phone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>
                    <TableCell>{formatPrice(order.total_amount)}</TableCell>
                    <TableCell>{formatDateTime(order.created_at)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedOrderId(order.id)}
                        title="مشاهده جزئیات"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>

                      {order.status === "pending_review" && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApprove(order.id)}
                          title="تأیید سفارش"
                        >
                          <Check fontSize="small" />
                        </IconButton>
                      )}

                      {["pending_review", "needs_customer_confirmation", "awaiting_payment"].includes(
                        order.status
                      ) && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancel(order.id)}
                          title="لغو سفارش"
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
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
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count}`}
        />
      </TableContainer>

      <Dialog
        open={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogContent>
          {selectedOrderId !== null && (
            <AdminOrderDetailContent
              orderId={selectedOrderId}
              onClose={() => setSelectedOrderId(null)}
              onChanged={loadOrders}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}