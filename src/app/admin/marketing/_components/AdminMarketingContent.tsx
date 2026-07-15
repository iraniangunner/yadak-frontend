"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
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
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import { Preview, Send } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { JalaliDateField } from "../../../_components/JalaliDateField";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminMarketingContent.tsx
|--------------------------------------------------------------------------
*/

type Campaign = {
  id: number;
  message: string;
  recipient_count: number;
  filters: Record<string, any>;
  created_at: string;
  sent_by: { id: number; name: string } | null;
};

type PreviewSample = {
  id: number;
  name: string;
  phone: string;
  city: string | null;
};

const emptyFilters = {
  vehicle_id: "",
  purchased_product_id: "",
  has_purchased: false,
  no_purchase_since: "",
  city: "",
};

export function AdminMarketingContent() {
  const [filters, setFilters] = useState(emptyFilters);
  const [useHasPurchased, setUseHasPurchased] = useState(false);
  const [message, setMessage] = useState("");

  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewSample, setPreviewSample] = useState<PreviewSample[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const buildFilterPayload = () => ({
    vehicle_id: filters.vehicle_id ? Number(filters.vehicle_id) : undefined,
    purchased_product_id: filters.purchased_product_id
      ? Number(filters.purchased_product_id)
      : undefined,
    has_purchased: useHasPurchased ? true : undefined,
    no_purchase_since: filters.no_purchase_since || undefined,
    city: filters.city || undefined,
  });

  const loadCampaigns = () => {
    setCampaigns(null);
    adminAPI.marketing
      .campaigns({ page: page + 1, per_page: rowsPerPage } as any)
      .then((res) => {
        setCampaigns(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handlePreview = async () => {
    setIsPreviewing(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await adminAPI.marketing.preview(buildFilterPayload());
      setPreviewCount(res.data.recipient_count);
      setPreviewSample(res.data.sample);
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در پیش‌نمایش مخاطبان.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setError("متن پیام را وارد کنید.");
      return;
    }
    if (!confirm(`این پیامک برای ${previewCount ?? "؟"} مشتری ارسال بشه؟`))
      return;

    setIsSending(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await adminAPI.marketing.send({
        ...buildFilterPayload(),
        message,
      });
      setSuccessMsg(res.data.message);
      setMessage("");
      setPreviewCount(null);
      setPreviewSample([]);
      loadCampaigns();
    } catch (err: any) {
      setError(
        err?.response?.data?.errors?.message?.[0] ||
          err?.response?.data?.message ||
          "خطا در ارسال پیامک."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        پیامک گروهی
      </Typography>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          p: 3,
          mb: 4,
        }}
      >
        <Typography sx={{ fontWeight: 700, mb: 2 }}>فیلتر مخاطبان</Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <TextField
            label="شناسه‌ی خودرو (اختیاری)"
            type="number"
            value={filters.vehicle_id}
            onChange={(e) =>
              setFilters({ ...filters, vehicle_id: e.target.value })
            }
            sx={{ flex: "1 1 200px" }}
          />
          <TextField
            label="شناسه‌ی محصول خریداری‌شده (اختیاری)"
            type="number"
            value={filters.purchased_product_id}
            onChange={(e) =>
              setFilters({ ...filters, purchased_product_id: e.target.value })
            }
            sx={{ flex: "1 1 220px" }}
          />
          <TextField
            label="شهر (اختیاری)"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            sx={{ flex: "1 1 160px" }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            mb: 2,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={useHasPurchased}
                onChange={(e) => setUseHasPurchased(e.target.checked)}
              />
            }
            label="فقط مشتریانی که قبلاً خرید کرده‌اند"
          />
          <JalaliDateField
            label="بدون خرید از این تاریخ (اختیاری)"
            onChange={(v) => setFilters({ ...filters, no_purchase_since: v })}
          />
        </Box>

        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={handlePreview}
          disabled={isPreviewing}
        >
          {isPreviewing ? "در حال محاسبه..." : "پیش‌نمایش تعداد مخاطب"}
        </Button>

        {previewCount !== null && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`${previewCount} مخاطب مطابق فیلتر`}
              color="info"
              sx={{ mb: 1 }}
            />
            {previewSample.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                نمونه: {previewSample.map((s) => s.name).join("، ")}
                {previewCount > previewSample.length && " و ..."}
              </Typography>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography sx={{ fontWeight: 700, mb: 2 }}>متن پیامک</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={3}
          fullWidth
          placeholder="متن پیامک را بنویسید (حداکثر ۲۰۰ کاراکتر)"
          slotProps={{ htmlInput: { maxLength: 200 } }}
          helperText={`${message.length}/200`}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          disableElevation
          startIcon={<Send />}
          onClick={handleSend}
          disabled={isSending}
        >
          {isSending ? "در حال ارسال..." : "ارسال پیامک"}
        </Button>
      </Box>

      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
        تاریخچه‌ی کمپین‌ها
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>پیام</TableCell>
              <TableCell>تعداد مخاطب</TableCell>
              <TableCell>ارسال‌کننده</TableCell>
              <TableCell>تاریخ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns === null ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    کمپینی ارسال نشده
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" noWrap>
                      {c.message}
                    </Typography>
                  </TableCell>
                  <TableCell>{c.recipient_count}</TableCell>
                  <TableCell>{c.sent_by?.name || "—"}</TableCell>
                  <TableCell>{formatDateTime(c.created_at)}</TableCell>
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
