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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { Download, Search, Clear } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/format";
import { returnStatusLabels, getReturnStatusMeta } from "@/lib/returnStatus";
import { JalaliDateField } from "./JalaliDateField";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminReportsContent.tsx
|--------------------------------------------------------------------------
| تاریخ‌ها دیگه خودکار جستجو نمی‌کنن - فقط بعد از زدن دکمه‌ی «جستجو».
| دکمه‌ی «پاک‌کردن» هم فیلترها رو خالی می‌کنه و دوباره جستجو می‌کنه.
*/

type ProductSalesRow = {
  product_id: number;
  title: string;
  sku: string;
  total_quantity: number;
  total_revenue: number;
};

type CustomerSalesRow = {
  user_id: number;
  name: string;
  phone: string | null;
  total_orders: number;
  total_spent: number;
};

type CitySalesRow = {
  city: string | null;
  total_orders: number;
  total_sales: number;
};

type ReturnRow = {
  id: number;
  quantity: number;
  status: string;
  created_at: string;
  user: { name: string };
  order_item: { title: string };
};

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * فیلتر بازه‌ی تاریخ + دکمه‌ی جستجو + دکمه‌ی پاک‌کردن.
 * resetKey باعث می‌شه با هر «پاک‌کردن»، خودِ کامپوننت‌های JalaliDateField
 * هم دوباره mount بشن و مقدار نمایشی‌شون خالی بشه (چون خودشون state
 * داخلی دارن که از بیرون قابل reset نیست، جز با remount).
 */
function DateRangeFilter({
  onFromChange,
  onToChange,
  onSearch,
  onClear,
  resetKey,
}: {
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onSearch: () => void;
  onClear: () => void;
  resetKey: number;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
      <JalaliDateField key={`from-${resetKey}`} label="از تاریخ" onChange={onFromChange} />
      <JalaliDateField key={`to-${resetKey}`} label="تا تاریخ" onChange={onToChange} />
      <Button variant="contained" disableElevation size="small" startIcon={<Search />} onClick={onSearch}>
        جستجو
      </Button>
      <Button variant="text" color="inherit" size="small" startIcon={<Clear />} onClick={onClear}>
        پاک کردن
      </Button>
    </Box>
  );
}

export function AdminReportsContent() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        گزارش‌های فروش
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} variant="scrollable">
        <Tab label="فروش محصولات" />
        <Tab label="فروش مشتریان" />
        <Tab label="فروش شهرها" />
        <Tab label="مرجوعی‌ها" />
      </Tabs>

      {tab === 0 && <ProductSalesTab />}
      {tab === 1 && <CustomerSalesTab />}
      {tab === 2 && <CitySalesTab />}
      {tab === 3 && <ReturnsReportTab />}
    </Box>
  );
}

// ------------------------------------------------------------------
// فروش محصولات
// ------------------------------------------------------------------

function ProductSalesTab() {
  const [rows, setRows] = useState<ProductSalesRow[] | null>(null);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const load = (fromValue: string, toValue: string, pageValue: number, perPage: number) => {
    setRows(null);
    setError("");
    adminAPI.reports
      .productSales({ from: fromValue || undefined, to: toValue || undefined, page: pageValue + 1, per_page: perPage })
      .then((res) => {
        setRows(res.data.data);
        setTotal(res.data.total);
      })
      .catch((err) => {
        console.error("خطا در دریافت گزارش فروش محصولات:", err);
        setError(err?.response?.data?.message || "خطا در دریافت گزارش. دوباره تلاش کنید.");
        setRows([]);
      });
  };

  useEffect(() => {
    load(from, to, page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleClear = () => {
    setFrom("");
    setTo("");
    setResetKey((k) => k + 1);
    setPage(0);
    load("", "", 0, rowsPerPage);
  };

  const handleSearch = () => {
    setPage(0);
    load(from, to, 0, rowsPerPage);
  };

  const handleDownload = async () => {
    const res = await adminAPI.reports.downloadExcel("product-sales", { from, to });
    downloadBlob(res.data, "product-sales.xlsx");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <DateRangeFilter
          onFromChange={setFrom}
          onToChange={setTo}
          onSearch={handleSearch}
          onClear={handleClear}
          resetKey={resetKey}
        />
        <Button variant="outlined" startIcon={<Download />} onClick={handleDownload}>
          دانلود اکسل
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>محصول</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>تعداد فروش</TableCell>
              <TableCell>مبلغ فروش</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows === null ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {error ? "بارگذاری با خطا مواجه شد" : "داده‌ای برای این بازه یافت نشد"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.product_id} hover>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.sku}</TableCell>
                  <TableCell>{row.total_quantity}</TableCell>
                  <TableCell>{formatPrice(row.total_revenue)}</TableCell>
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
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count}`}
        />
      </TableContainer>
    </Box>
  );
}

// ------------------------------------------------------------------
// فروش مشتریان
// ------------------------------------------------------------------

function CustomerSalesTab() {
  const [rows, setRows] = useState<CustomerSalesRow[] | null>(null);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const load = (fromValue: string, toValue: string, pageValue: number, perPage: number) => {
    setRows(null);
    setError("");
    adminAPI.reports
      .customerSales({ from: fromValue || undefined, to: toValue || undefined, page: pageValue + 1, per_page: perPage })
      .then((res) => {
        setRows(res.data.data);
        setTotal(res.data.total);
      })
      .catch((err) => {
        console.error("خطا در دریافت گزارش فروش مشتریان:", err);
        setError(err?.response?.data?.message || "خطا در دریافت گزارش. دوباره تلاش کنید.");
        setRows([]);
      });
  };

  useEffect(() => {
    load(from, to, page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleClear = () => {
    setFrom("");
    setTo("");
    setResetKey((k) => k + 1);
    setPage(0);
    load("", "", 0, rowsPerPage);
  };

  const handleSearch = () => {
    setPage(0);
    load(from, to, 0, rowsPerPage);
  };

  const handleDownload = async () => {
    const res = await adminAPI.reports.downloadExcel("customer-sales", { from, to });
    downloadBlob(res.data, "customer-sales.xlsx");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <DateRangeFilter
          onFromChange={setFrom}
          onToChange={setTo}
          onSearch={handleSearch}
          onClear={handleClear}
          resetKey={resetKey}
        />
        <Button variant="outlined" startIcon={<Download />} onClick={handleDownload}>
          دانلود اکسل
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>مشتری</TableCell>
              <TableCell>موبایل</TableCell>
              <TableCell>تعداد سفارش</TableCell>
              <TableCell>مجموع خرید</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows === null ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {error ? "بارگذاری با خطا مواجه شد" : "داده‌ای برای این بازه یافت نشد"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.user_id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell sx={{ direction: "ltr", textAlign: "right" }}>{row.phone}</TableCell>
                  <TableCell>{row.total_orders}</TableCell>
                  <TableCell>{formatPrice(row.total_spent)}</TableCell>
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
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count}`}
        />
      </TableContainer>
    </Box>
  );
}

// ------------------------------------------------------------------
// فروش شهرها
// ------------------------------------------------------------------

function CitySalesTab() {
  const [rows, setRows] = useState<CitySalesRow[] | null>(null);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const load = (fromValue: string, toValue: string, pageValue: number, perPage: number) => {
    setRows(null);
    setError("");
    adminAPI.reports
      .citySales({ from: fromValue || undefined, to: toValue || undefined, page: pageValue + 1, per_page: perPage })
      .then((res) => {
        setRows(res.data.data);
        setTotal(res.data.total);
      })
      .catch((err) => {
        console.error("خطا در دریافت گزارش فروش شهرها:", err);
        setError(err?.response?.data?.message || "خطا در دریافت گزارش. دوباره تلاش کنید.");
        setRows([]);
      });
  };

  useEffect(() => {
    load(from, to, page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleClear = () => {
    setFrom("");
    setTo("");
    setResetKey((k) => k + 1);
    setPage(0);
    load("", "", 0, rowsPerPage);
  };

  const handleSearch = () => {
    setPage(0);
    load(from, to, 0, rowsPerPage);
  };

  const handleDownload = async () => {
    const res = await adminAPI.reports.downloadExcel("city-sales", { from, to });
    downloadBlob(res.data, "city-sales.xlsx");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <DateRangeFilter
          onFromChange={setFrom}
          onToChange={setTo}
          onSearch={handleSearch}
          onClear={handleClear}
          resetKey={resetKey}
        />
        <Button variant="outlined" startIcon={<Download />} onClick={handleDownload}>
          دانلود اکسل
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شهر</TableCell>
              <TableCell>تعداد سفارش</TableCell>
              <TableCell>مجموع فروش</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows === null ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {error ? "بارگذاری با خطا مواجه شد" : "داده‌ای برای این بازه یافت نشد"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{row.city || "نامشخص"}</TableCell>
                  <TableCell>{row.total_orders}</TableCell>
                  <TableCell>{formatPrice(row.total_sales)}</TableCell>
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
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count}`}
        />
      </TableContainer>
    </Box>
  );
}

// ------------------------------------------------------------------
// مرجوعی‌ها (این یکی صفحه‌بندی و فیلتر وضعیت هم داره - اونا همچنان
// خودکار عمل می‌کنن، فقط بازه‌ی تاریخ نیاز به دکمه‌ی جستجو داره)
// ------------------------------------------------------------------

function ReturnsReportTab() {
  const [rows, setRows] = useState<ReturnRow[] | null>(null);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const load = (
    fromValue: string,
    toValue: string,
    statusValue: string,
    pageValue: number,
    perPage: number
  ) => {
    setRows(null);
    setError("");
    adminAPI.reports
      .returns({
        from: fromValue || undefined,
        to: toValue || undefined,
        status: statusValue || undefined,
        page: pageValue + 1,
        per_page: perPage,
      })
      .then((res) => {
        setRows(res.data.data);
        setTotal(res.data.total);
      })
      .catch((err) => {
        console.error("خطا در دریافت گزارش مرجوعی‌ها:", err);
        setError(err?.response?.data?.message || "خطا در دریافت گزارش. دوباره تلاش کنید.");
        setRows([]);
      });
  };

  // این‌ها (وضعیت، صفحه، تعداد ردیف) همچنان خودکار عمل می‌کنن - فقط
  // بازه‌ی تاریخ نیاز به دکمه‌ی «جستجو» داره.
  useEffect(() => {
    load(from, to, status, page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, rowsPerPage]);

  const handleClear = () => {
    setFrom("");
    setTo("");
    setResetKey((k) => k + 1);
    setPage(0);
    load("", "", status, 0, rowsPerPage);
  };

  const handleSearch = () => {
    setPage(0);
    load(from, to, status, 0, rowsPerPage);
  };

  const handleDownload = async () => {
    const res = await adminAPI.reports.downloadExcel("returns", { from, to, status });
    downloadBlob(res.data, "returns.xlsx");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <DateRangeFilter
            onFromChange={setFrom}
            onToChange={setTo}
            onSearch={handleSearch}
            onClear={handleClear}
            resetKey={resetKey}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>وضعیت</InputLabel>
            <Select
              label="وضعیت"
              value={status}
              onChange={(e) => {
                setPage(0);
                setStatus(e.target.value);
              }}
            >
              <MenuItem value="">همه</MenuItem>
              {Object.entries(returnStatusLabels).map(([value, { label }]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button variant="outlined" startIcon={<Download />} onClick={handleDownload}>
          دانلود اکسل
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>مشتری</TableCell>
              <TableCell>کالا</TableCell>
              <TableCell>تعداد</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>تاریخ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows === null ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {error ? "بارگذاری با خطا مواجه شد" : "داده‌ای برای این بازه یافت نشد"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const meta = getReturnStatusMeta(row.status);
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.user.name}</TableCell>
                    <TableCell>{row.order_item.title}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>
                      <Chip label={meta.label} color={meta.color} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(row.created_at)}</TableCell>
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
    </Box>
  );
}