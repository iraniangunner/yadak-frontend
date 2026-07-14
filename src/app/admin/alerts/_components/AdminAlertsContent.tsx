"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import { adminAPI } from "@/lib/api";
import { formatPrice, formatDateTime } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminAlertsContent.tsx
|--------------------------------------------------------------------------
*/

type SalesAlertRow = {
  id: number;
  average_quantity: number;
  actual_quantity: number;
  tolerance_percent: number;
  period_days: number;
  created_at: string;
  product: { id: number; title: string; sku: string };
};

type LowStockProduct = {
  id: number;
  title: string;
  sku: string;
  stock_status: string;
  waiting_customers_count: number;
};

type StaleOrder = {
  id: number;
  total_amount: number;
  created_at: string;
  user: { name: string; phone: string | null };
};

const stockStatusLabels: Record<string, string> = {
  available: "موجود",
  stopped: "متوقف‌شده",
  out_of_stock: "ناموجود",
  incoming: "در حال تأمین",
};

export function AdminAlertsContent() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        هشدارها
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="فروش غیرعادی" />
        <Tab label="موجودی و سفارش راکد" />
      </Tabs>

      {tab === 0 ? <SalesAlertsTab /> : <InventoryAlertsTab />}
    </Box>
  );
}

// ------------------------------------------------------------------
// هشدار فروش غیرعادی
// ------------------------------------------------------------------

function SalesAlertsTab() {
  const [rows, setRows] = useState<SalesAlertRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setRows(null);
    adminAPI.salesAlerts
      .list({ page: page + 1, per_page: rowsPerPage } as any)
      .then((res) => {
        setRows(res.data.data);
        setTotal(res.data.total);
      });
  }, [page, rowsPerPage]);

  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>محصول</TableCell>
            <TableCell>میانگین فروش روزانه</TableCell>
            <TableCell>فروش واقعی</TableCell>
            <TableCell>تلورانس</TableCell>
            <TableCell>بازه</TableCell>
            <TableCell>تاریخ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows === null ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                <CircularProgress size={28} />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">هشداری ثبت نشده</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  {row.product.title}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {row.product.sku}
                  </Typography>
                </TableCell>
                <TableCell>{row.average_quantity}</TableCell>
                <TableCell>
                  <Chip
                    label={row.actual_quantity}
                    color={
                      row.actual_quantity > row.average_quantity
                        ? "success"
                        : "error"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{row.tolerance_percent}%</TableCell>
                <TableCell>{row.period_days} روز</TableCell>
                <TableCell>{formatDateTime(row.created_at)}</TableCell>
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
  );
}

// ------------------------------------------------------------------
// هشدار موجودی و سفارش راکد
// ------------------------------------------------------------------

function InventoryAlertsTab() {
  const [lowStock, setLowStock] = useState<LowStockProduct[] | null>(null);
  const [staleOrders, setStaleOrders] = useState<StaleOrder[] | null>(null);
  const [summary, setSummary] = useState<{
    low_stock_count: number;
    stale_orders_count: number;
    stale_order_threshold_hours: number;
  } | null>(null);

  useEffect(() => {
    adminAPI.inventoryAlerts.list().then((res) => {
      setLowStock(res.data.low_stock_products);
      setStaleOrders(res.data.stale_pending_orders);
      setSummary(res.data.summary);
    });
  }, []);

  if (!summary) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Chip
          label={`${summary.low_stock_count} محصول کم‌موجود/ناموجود`}
          color="warning"
        />
        <Chip
          label={`${summary.stale_orders_count} سفارش راکد`}
          color="error"
        />
        <Chip
          label={`آستانه‌ی راکد بودن: ${summary.stale_order_threshold_hours} ساعت`}
          variant="outlined"
        />
      </Box>

      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
        محصولات کم‌موجود / ناموجود
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", mb: 4 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>محصول</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>مشتریان منتظر</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lowStock && lowStock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    محصول کم‌موجودی نیست
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              lowStock?.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    {p.title}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {p.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        stockStatusLabels[p.stock_status] || p.stock_status
                      }
                      color="error"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{p.waiting_customers_count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
        سفارش‌های راکد (در انتظار بررسی طولانی‌مدت)
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>سفارش</TableCell>
              <TableCell>مشتری</TableCell>
              <TableCell>مبلغ</TableCell>
              <TableCell>تاریخ ثبت</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staleOrders && staleOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    سفارش راکدی نیست
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              staleOrders?.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell>#{o.id}</TableCell>
                  <TableCell>
                    {o.user?.name}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {o.user?.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatPrice(o.total_amount)}</TableCell>
                  <TableCell>{formatDateTime(o.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
