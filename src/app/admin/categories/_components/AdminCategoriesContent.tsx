"use client";

import { useEffect, useMemo, useState } from "react";
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
  Avatar,
} from "@mui/material";
import { Add, Edit, Delete, Category as CategoryIcon } from "@mui/icons-material";
import { adminAPI, categoriesAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminCategoriesContent.tsx
|--------------------------------------------------------------------------
*/

type Category = {
  id: number;
  name: string;
  parent_id: number | null;
  thumbnail_url: string | null;
  is_active: boolean;
  sort_order: number;
};

const emptyForm = {
  name: "",
  parent_id: "",
  is_active: true,
  sort_order: "0",
};

export function AdminCategoriesContent() {
  const [categories, setCategories] = useState<Category[] | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = () => {
    setCategories(null);
    categoriesAPI.list({ with_inactive: true, per_page: 100 } as any).then((res) => {
      setCategories(res.data.data);
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setThumbnailFile(null);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      parent_id: category.parent_id ? String(category.parent_id) : "",
      is_active: category.is_active,
      sort_order: String(category.sort_order),
    });
    setThumbnailFile(null);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const fd = new FormData();
    fd.append("name", form.name);
    if (form.parent_id) fd.append("parent_id", form.parent_id);
    fd.append("is_active", form.is_active ? "1" : "0");
    fd.append("sort_order", form.sort_order);
    if (thumbnailFile) fd.append("thumbnail", thumbnailFile);

    try {
      if (editingId) {
        await adminAPI.categories.update(editingId, fd);
      } else {
        await adminAPI.categories.create(fd);
      }
      setDialogOpen(false);
      loadCategories();
    } catch (err: any) {
      setErrors(err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی دسته‌بندی."] });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این دسته‌بندی حذف بشه؟")) return;
    await adminAPI.categories.delete(id);
    loadCategories();
  };

  const parentOptions = categories?.filter((c) => c.id !== editingId) || [];

  // اگه فایل جدیدی انتخاب شده، پیش‌نمایش زنده‌ش رو بساز؛ وگرنه عکس قبلی
  // محصول (در حالت ویرایش) رو نشون بده.
  const thumbnailPreviewUrl = useMemo(() => {
    if (thumbnailFile) return URL.createObjectURL(thumbnailFile);
    if (editingId) return categories?.find((c) => c.id === editingId)?.thumbnail_url || null;
    return null;
  }, [thumbnailFile, editingId, categories]);

  useEffect(() => {
    return () => {
      if (thumbnailFile) URL.revokeObjectURL(thumbnailPreviewUrl!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnailFile]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          دسته‌بندی‌ها
        </Typography>
        <Button variant="contained" disableElevation startIcon={<Add />} onClick={openCreateDialog}>
          افزودن دسته‌بندی
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>نام</TableCell>
              <TableCell>زیرمجموعه‌ی</TableCell>
              <TableCell>ترتیب</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories === null ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">دسته‌بندی‌ای یافت نشد</Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={category.thumbnail_url || undefined}
                      sx={{ width: 36, height: 36, bgcolor: "background.default" }}
                    >
                      <CategoryIcon fontSize="small" />
                    </Avatar>
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    {category.parent_id
                      ? categories.find((c) => c.id === category.parent_id)?.name || "—"
                      : "—"}
                  </TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell>
                    <Chip
                      label={category.is_active ? "فعال" : "غیرفعال"}
                      color={category.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEditDialog(category)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(category.id)}>
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="نام دسته‌بندی"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name?.[0]}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>زیرمجموعه‌ی (اختیاری)</InputLabel>
              <Select
                label="زیرمجموعه‌ی (اختیاری)"
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              >
                <MenuItem value="">بدون والد (دسته‌ی اصلی)</MenuItem>
                {parentOptions.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="ترتیب نمایش"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              sx={{ maxWidth: 200 }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {thumbnailPreviewUrl && (
                <Avatar
                  variant="rounded"
                  src={thumbnailPreviewUrl}
                  sx={{ width: 56, height: 56, bgcolor: "background.default" }}
                >
                  <CategoryIcon fontSize="small" />
                </Avatar>
              )}
              <Button variant="outlined" component="label">
                {thumbnailFile ? thumbnailFile.name : editingId ? "تعویض تصویر" : "انتخاب تصویر"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                />
              </Button>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
              }
              label="فعال"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)} disabled={isSaving}>
            انصراف
          </Button>
          <Button variant="contained" disableElevation onClick={handleSave} disabled={isSaving}>
            {isSaving ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}