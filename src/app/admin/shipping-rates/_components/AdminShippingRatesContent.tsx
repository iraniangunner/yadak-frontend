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
  Alert,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminShippingRatesContent.tsx
|--------------------------------------------------------------------------
| هیچ pagination ای نداره چون بک‌اند کل لیست رو یه‌جا می‌ده (تعداد نرخ‌های
| ارسال معمولاً خیلی کمه - یه نرخ پیش‌فرض + چندتا نرخ شهر خاص).
*/

type ShippingRate = {
  id: number;
  city: string | null;
  base_price: number;
  price_per_kg: number;
};

const emptyForm = { city: "", base_price: "", price_per_kg: "" };

export function AdminShippingRatesContent() {
  const [rates, setRates] = useState<ShippingRate[] | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadRates = () => {
    setRates(null);
    adminAPI.shippingRates.list().then((res) => setRates(res.data.data));
  };

  useEffect(() => {
    loadRates();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (rate: ShippingRate) => {
    setEditingId(rate.id);
    setForm({
      city: rate.city || "",
      base_price: String(rate.base_price),
      price_per_kg: String(rate.price_per_kg),
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const payload = {
      city: form.city || null,
      base_price: Number(form.base_price),
      price_per_kg: Number(form.price_per_kg),
    };

    try {
      if (editingId) {
        await adminAPI.shippingRates.update(editingId, payload);
      } else {
        await adminAPI.shippingRates.create(payload);
      }
      setDialogOpen(false);
      loadRates();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || {
          general: ["خطا در ذخیره‌ی نرخ ارسال."],
        },
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این نرخ ارسال حذف بشه؟")) return;
    await adminAPI.shippingRates.delete(id);
    loadRates();
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
          نرخ ارسال
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن نرخ
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        نرخی که شهرش خالی باشه، به‌عنوان نرخ پیش‌فرض (برای شهرهایی که نرخ
        اختصاصی ندارن) استفاده می‌شه.
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شهر</TableCell>
              <TableCell>هزینه‌ی پایه</TableCell>
              <TableCell>هزینه به ازای هر کیلوگرم</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rates === null ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    نرخ ارسالی تعریف نشده
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rates.map((rate) => (
                <TableRow key={rate.id} hover>
                  <TableCell>
                    {rate.city || (
                      <Chip label="پیش‌فرض" size="small" color="primary" />
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(rate.base_price)}</TableCell>
                  <TableCell>{formatPrice(rate.price_per_kg)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(rate)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(rate.id)}
                    >
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "ویرایش نرخ ارسال" : "افزودن نرخ ارسال"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="شهر (خالی = نرخ پیش‌فرض)"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              error={!!errors.city}
              helperText={errors.city?.[0]}
              fullWidth
            />
            <TextField
              label="هزینه‌ی پایه (تومان)"
              type="number"
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: e.target.value })}
              error={!!errors.base_price}
              helperText={errors.base_price?.[0]}
              fullWidth
            />
            <TextField
              label="هزینه به ازای هر کیلوگرم (تومان)"
              type="number"
              value={form.price_per_kg}
              onChange={(e) =>
                setForm({ ...form, price_per_kg: e.target.value })
              }
              error={!!errors.price_per_kg}
              helperText={errors.price_per_kg?.[0]}
              fullWidth
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
