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
| مسیر فایل: src/app/admin/_components/AdminCartDiscountRulesContent.tsx
|--------------------------------------------------------------------------
| ⚠️ باید adminAPI.cartDiscountRules رو به src/lib/api.ts اضافه کنید:
|
| export const adminAPI = {
|   ...
|   cartDiscountRules: {
|     list: () => api.get("/admin/cart-discount-rules", { requiresAuth: true }),
|     create: (payload: any) => api.post("/admin/cart-discount-rules", payload, { requiresAuth: true }),
|     update: (id: number, payload: any) => api.post(`/admin/cart-discount-rules/${id}`, payload, { requiresAuth: true }),
|     delete: (id: number) => api.delete(`/admin/cart-discount-rules/${id}`, { requiresAuth: true }),
|   },
| };
*/

type Rule = {
  id: number;
  min_amount: number;
  type: "percentage" | "fixed";
  value: number;
  is_active: boolean;
};

const emptyForm = {
  min_amount: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  is_active: true,
};

export function AdminCartDiscountRulesContent() {
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadRules = () => {
    setRules(null);
    adminAPI.cartDiscountRules.list().then((res) => setRules(res.data.data));
  };

  useEffect(() => {
    loadRules();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (rule: Rule) => {
    setEditingId(rule.id);
    setForm({
      min_amount: String(rule.min_amount),
      type: rule.type,
      value: String(rule.value),
      is_active: rule.is_active,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const payload = {
      min_amount: Number(form.min_amount),
      type: form.type,
      value: Number(form.value),
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await adminAPI.cartDiscountRules.update(editingId, payload);
      } else {
        await adminAPI.cartDiscountRules.create(payload);
      }
      setDialogOpen(false);
      loadRules();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌سازی."] }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این قانون تخفیف حذف بشه؟")) return;
    await adminAPI.cartDiscountRules.delete(id);
    loadRules();
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
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            تخفیف خودکار سبد خرید
          </Typography>
          <Typography variant="body2" color="text.secondary">
            وقتی مبلغ سبد از یه سقف مشخص رد بشه، خودکار (بدون نیاز به کد تخفیف)
            اعمال می‌شه.
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن قانون
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>حداقل مبلغ سبد</TableCell>
              <TableCell>مقدار تخفیف</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules === null ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    هنوز قانونی تعریف نشده
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell>{formatPrice(rule.min_amount)} به بالا</TableCell>
                  <TableCell>
                    {rule.type === "percentage"
                      ? `٪${rule.value}`
                      : formatPrice(rule.value)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.is_active ? "فعال" : "غیرفعال"}
                      color={rule.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(rule)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(rule.id)}
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
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "ویرایش قانون" : "افزودن قانون"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="حداقل مبلغ سبد (تومان)"
              type="number"
              value={form.min_amount}
              onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
              error={!!errors.min_amount}
              helperText={errors.min_amount?.[0]}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>نوع تخفیف</InputLabel>
              <Select
                label="نوع تخفیف"
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
              label={
                form.type === "percentage" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"
              }
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              error={!!errors.value}
              helperText={errors.value?.[0]}
              fullWidth
            />
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
