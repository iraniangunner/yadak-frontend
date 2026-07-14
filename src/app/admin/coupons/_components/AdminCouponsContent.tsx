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
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminCouponsContent.tsx
|--------------------------------------------------------------------------
*/

type Coupon = {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_cart_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  usage_limit_per_user: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

const emptyForm = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  min_cart_amount: "",
  max_discount_amount: "",
  usage_limit: "",
  usage_limit_per_user: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

export function AdminCouponsContent() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadCoupons = () => {
    setCoupons(null);
    adminAPI.coupons
      .list({ page: page + 1, per_page: rowsPerPage } as any)
      .then((res) => {
        setCoupons(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      min_cart_amount: coupon.min_cart_amount
        ? String(coupon.min_cart_amount)
        : "",
      max_discount_amount: coupon.max_discount_amount
        ? String(coupon.max_discount_amount)
        : "",
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : "",
      usage_limit_per_user: coupon.usage_limit_per_user
        ? String(coupon.usage_limit_per_user)
        : "",
      starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 10) : "",
      ends_at: coupon.ends_at ? coupon.ends_at.slice(0, 10) : "",
      is_active: coupon.is_active,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      min_cart_amount: form.min_cart_amount
        ? Number(form.min_cart_amount)
        : undefined,
      max_discount_amount: form.max_discount_amount
        ? Number(form.max_discount_amount)
        : undefined,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : undefined,
      usage_limit_per_user: form.usage_limit_per_user
        ? Number(form.usage_limit_per_user)
        : undefined,
      starts_at: form.starts_at || undefined,
      ends_at: form.ends_at || undefined,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await adminAPI.coupons.update(editingId, payload);
      } else {
        await adminAPI.coupons.create(payload);
      }
      setDialogOpen(false);
      loadCoupons();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || {
          general: ["خطا در ذخیره‌ی کد تخفیف."],
        },
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این کد تخفیف حذف بشه؟")) return;
    await adminAPI.coupons.delete(id);
    loadCoupons();
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          کدهای تخفیف
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن کد تخفیف
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>کد</TableCell>
              <TableCell>مقدار</TableCell>
              <TableCell>حداقل سبد</TableCell>
              <TableCell>مصرف</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons === null ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    کد تخفیفی یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id} hover>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      direction: "ltr",
                      textAlign: "right",
                    }}
                  >
                    {coupon.code}
                  </TableCell>
                  <TableCell>
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : formatPrice(coupon.value)}
                  </TableCell>
                  <TableCell>
                    {coupon.min_cart_amount
                      ? formatPrice(coupon.min_cart_amount)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {coupon.used_count} / {coupon.usage_limit ?? "∞"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={coupon.is_active ? "فعال" : "غیرفعال"}
                      color={coupon.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(coupon)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Delete fontSize="small" color="error" />
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

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "ویرایش کد تخفیف" : "افزودن کد تخفیف"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="کد"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              error={!!errors.code}
              helperText={errors.code?.[0]}
              fullWidth
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl sx={{ flex: "1 1 160px" }}>
                <InputLabel>نوع</InputLabel>
                <Select
                  label="نوع"
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as "percentage" | "fixed",
                    })
                  }
                >
                  <MenuItem value="percentage">درصدی</MenuItem>
                  <MenuItem value="fixed">مبلغ ثابت</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={form.type === "percentage" ? "درصد" : "مبلغ (تومان)"}
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                error={!!errors.value}
                helperText={errors.value?.[0]}
                sx={{ flex: "1 1 160px" }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="حداقل مبلغ سبد (اختیاری)"
                type="number"
                value={form.min_cart_amount}
                onChange={(e) =>
                  setForm({ ...form, min_cart_amount: e.target.value })
                }
                sx={{ flex: "1 1 200px" }}
              />
              {form.type === "percentage" && (
                <TextField
                  label="سقف تخفیف (اختیاری)"
                  type="number"
                  value={form.max_discount_amount}
                  onChange={(e) =>
                    setForm({ ...form, max_discount_amount: e.target.value })
                  }
                  sx={{ flex: "1 1 200px" }}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="سقف کل مصرف (اختیاری)"
                type="number"
                value={form.usage_limit}
                onChange={(e) =>
                  setForm({ ...form, usage_limit: e.target.value })
                }
                sx={{ flex: "1 1 200px" }}
              />
              <TextField
                label="سقف مصرف هر کاربر (اختیاری)"
                type="number"
                value={form.usage_limit_per_user}
                onChange={(e) =>
                  setForm({ ...form, usage_limit_per_user: e.target.value })
                }
                sx={{ flex: "1 1 200px" }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="تاریخ شروع (اختیاری)"
                type="date"
                value={form.starts_at}
                onChange={(e) =>
                  setForm({ ...form, starts_at: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: "1 1 200px" }}
              />
              <TextField
                label="تاریخ پایان (اختیاری)"
                type="date"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: "1 1 200px" }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
              }
              label="فعال"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            color="inherit"
            onClick={() => setDialogOpen(false)}
            disabled={isSaving}
          >
            انصراف
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
