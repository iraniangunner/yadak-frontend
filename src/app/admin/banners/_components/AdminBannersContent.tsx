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
  Autocomplete,
} from "@mui/material";
import { Add, Edit, Delete, ViewCarousel } from "@mui/icons-material";
import { adminAPI, bannersAPI, productsAPI } from "@/lib/api";

type Banner = {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  product: { id: number; title: string } | null;
};

type ProductOption = { id: number; title: string; sku: string };

const emptyForm = {
  title: "",
  link_url: "",
  sort_order: "0",
  is_active: true,
};

export function AdminBannersContent() {
  const [banners, setBanners] = useState<Banner[] | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null
  );
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadBanners = () => {
    setBanners(null);
    bannersAPI.list({ with_inactive: true } as any).then((res) => {
      setBanners(res.data.data);
    });
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setSelectedProduct(null);
    setProductOptions([]);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      link_url: banner.link_url || "",
      sort_order: String(banner.sort_order),
      is_active: banner.is_active,
    });
    setImageFile(null);
    setSelectedProduct(
      banner.product
        ? { id: banner.product.id, title: banner.product.title, sku: "" }
        : null
    );
    setProductOptions([]);
    setErrors({});
    setDialogOpen(true);
  };

  const handleProductSearch = (query: string) => {
    if (!query) {
      setProductOptions([]);
      return;
    }
    setProductSearchLoading(true);
    productsAPI
      .list({ search: query })
      .then((res) => setProductOptions(res.data.data))
      .finally(() => setProductSearchLoading(false));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const fd = new FormData();
    fd.append("title", form.title);
    if (form.link_url) fd.append("link_url", form.link_url);
    if (selectedProduct) fd.append("product_id", String(selectedProduct.id));
    fd.append("sort_order", form.sort_order);
    fd.append("is_active", form.is_active ? "1" : "0");
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editingId) {
        await adminAPI.banners.update(editingId, fd);
      } else {
        await adminAPI.banners.create(fd);
      }
      setDialogOpen(false);
      loadBanners();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی بنر."] }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این بنر حذف بشه؟")) return;
    await adminAPI.banners.delete(id);
    loadBanners();
  };

  const imagePreviewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (editingId)
      return banners?.find((b) => b.id === editingId)?.image_url || null;
    return null;
  }, [imageFile, editingId, banners]);

  useEffect(() => {
    return () => {
      if (imageFile) URL.revokeObjectURL(imagePreviewUrl!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

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
          بنرها
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن بنر
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>عنوان</TableCell>
              <TableCell>لینک به</TableCell>
              <TableCell>ترتیب</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banners === null ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">بنری یافت نشد</Typography>
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner.id} hover>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={banner.image_url || undefined}
                      sx={{
                        width: 56,
                        height: 36,
                        bgcolor: "background.default",
                      }}
                    >
                      <ViewCarousel fontSize="small" />
                    </Avatar>
                  </TableCell>
                  <TableCell>{banner.title}</TableCell>
                  <TableCell>
                    {banner.product?.title || banner.link_url || "—"}
                  </TableCell>
                  <TableCell>{banner.sort_order}</TableCell>
                  <TableCell>
                    <Chip
                      label={banner.is_active ? "فعال" : "غیرفعال"}
                      color={banner.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(banner.id)}
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
          {editingId ? "ویرایش بنر" : "افزودن بنر"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="عنوان بنر"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title?.[0]}
              fullWidth
            />

            <Autocomplete
              options={productOptions}
              loading={productSearchLoading}
              getOptionLabel={(p) => `${p.title}${p.sku ? ` (${p.sku})` : ""}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={selectedProduct}
              onChange={(_, newValue) => setSelectedProduct(newValue)}
              onInputChange={(_, newInput) => handleProductSearch(newInput)}
              noOptionsText="محصولی پیدا نشد"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="لینک به محصول (اختیاری)"
                  placeholder="جستجو..."
                />
              )}
            />

            <TextField
              label="یا لینک دلخواه (اختیاری، اگه محصول انتخاب نشده)"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              error={!!errors.link_url}
              helperText={errors.link_url?.[0]}
              fullWidth
              placeholder="https://..."
            />

            <TextField
              label="ترتیب نمایش"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              sx={{ maxWidth: 200 }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {imagePreviewUrl && (
                <Avatar
                  variant="rounded"
                  src={imagePreviewUrl}
                  sx={{ width: 72, height: 44, bgcolor: "background.default" }}
                >
                  <ViewCarousel fontSize="small" />
                </Avatar>
              )}
              <Box>
                <Button variant="outlined" component="label">
                  {imageFile
                    ? imageFile.name
                    : editingId
                    ? "تعویض تصویر بنر"
                    : "انتخاب تصویر بنر"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </Button>
                {errors.image && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {errors.image[0]}
                  </Typography>
                )}
              </Box>
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
