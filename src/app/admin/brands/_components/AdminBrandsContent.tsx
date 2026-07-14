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
  FormControlLabel,
  Switch,
  Alert,
  Avatar,
} from "@mui/material";
import { Add, Edit, Delete, Storefront } from "@mui/icons-material";
import { adminAPI, brandsAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminBrandsContent.tsx
|--------------------------------------------------------------------------
*/

type Brand = {
  id: number;
  name: string;
  thumbnail_url: string | null;
  is_active: boolean;
};

const emptyForm = { name: "", is_active: true };

export function AdminBrandsContent() {
  const [brands, setBrands] = useState<Brand[] | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadBrands = () => {
    setBrands(null);
    brandsAPI.list({ with_inactive: true, per_page: 100 }).then((res) => {
      setBrands(res.data.data);
    });
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setThumbnailFile(null);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (brand: Brand) => {
    setEditingId(brand.id);
    setForm({ name: brand.name, is_active: brand.is_active });
    setThumbnailFile(null);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("is_active", form.is_active ? "1" : "0");
    if (thumbnailFile) fd.append("thumbnail", thumbnailFile);

    try {
      if (editingId) {
        await adminAPI.brands.update(editingId, fd);
      } else {
        await adminAPI.brands.create(fd);
      }
      setDialogOpen(false);
      loadBrands();
    } catch (err: any) {
      setErrors(err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی برند."] });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این برند حذف بشه؟")) return;
    await adminAPI.brands.delete(id);
    loadBrands();
  };

  const thumbnailPreviewUrl = useMemo(() => {
    if (thumbnailFile) return URL.createObjectURL(thumbnailFile);
    if (editingId) return brands?.find((b) => b.id === editingId)?.thumbnail_url || null;
    return null;
  }, [thumbnailFile, editingId, brands]);

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
          برندها
        </Typography>
        <Button variant="contained" disableElevation startIcon={<Add />} onClick={openCreateDialog}>
          افزودن برند
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>نام</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands === null ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">برندی یافت نشد</Typography>
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id} hover>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={brand.thumbnail_url || undefined}
                      sx={{ width: 36, height: 36, bgcolor: "background.default" }}
                    >
                      <Storefront fontSize="small" />
                    </Avatar>
                  </TableCell>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={brand.is_active ? "فعال" : "غیرفعال"}
                      color={brand.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEditDialog(brand)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(brand.id)}>
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
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? "ویرایش برند" : "افزودن برند"}</DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="نام برند"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name?.[0]}
              fullWidth
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {thumbnailPreviewUrl && (
                <Avatar
                  variant="rounded"
                  src={thumbnailPreviewUrl}
                  sx={{ width: 56, height: 56, bgcolor: "background.default" }}
                >
                  <Storefront fontSize="small" />
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