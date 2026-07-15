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
  FormControlLabel,
  Switch,
  Alert,
  Autocomplete,
  Avatar,
} from "@mui/material";
import { Add, Edit, Delete, Article as ArticleIcon } from "@mui/icons-material";
import { adminAPI, productsAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminArticlesContent.tsx
|--------------------------------------------------------------------------
*/

type Article = {
  id: number;
  title: string;
  is_published: boolean;
  published_at: string | null;
  thumbnail_url: string | null;
  author: { id: number; name: string } | null;
};

type ProductOption = { id: number; title: string; sku: string };

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  is_published: false,
};

export function AdminArticlesContent() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const loadArticles = () => {
    setArticles(null);
    adminAPI.articles
      .list({ page: page + 1, per_page: rowsPerPage } as any)
      .then((res) => {
        setArticles(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setThumbnailFile(null);
    setSelectedProducts([]);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (article: Article) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      excerpt: "",
      content: "",
      is_published: article.is_published,
    });
    setThumbnailFile(null);
    setSelectedProducts([]);
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
    if (form.excerpt) fd.append("excerpt", form.excerpt);
    fd.append("content", form.content);
    fd.append("is_published", form.is_published ? "1" : "0");
    if (thumbnailFile) fd.append("thumbnail", thumbnailFile);
    selectedProducts.forEach((p) => fd.append("product_ids[]", String(p.id)));

    try {
      if (editingId) {
        await adminAPI.articles.update(editingId, fd);
      } else {
        await adminAPI.articles.create(fd);
      }
      setDialogOpen(false);
      loadArticles();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی مقاله."] }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این مقاله حذف بشه؟")) return;
    await adminAPI.articles.delete(id);
    loadArticles();
  };

  const thumbnailPreviewUrl = useMemo(() => {
    if (thumbnailFile) return URL.createObjectURL(thumbnailFile);
    if (editingId)
      return articles?.find((a) => a.id === editingId)?.thumbnail_url || null;
    return null;
  }, [thumbnailFile, editingId, articles]);

  useEffect(() => {
    return () => {
      if (thumbnailFile) URL.revokeObjectURL(thumbnailPreviewUrl!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnailFile]);

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
          مقالات
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن مقاله
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>عنوان</TableCell>
              <TableCell>نویسنده</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles === null ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    مقاله‌ای یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} hover>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>{article.author?.name || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={article.is_published ? "منتشرشده" : "پیش‌نویس"}
                      color={article.is_published ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(article)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(article.id)}
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
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "ویرایش مقاله" : "افزودن مقاله"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="عنوان مقاله"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title?.[0]}
              fullWidth
            />
            <TextField
              label="خلاصه (اختیاری)"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="متن کامل مقاله"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              error={!!errors.content}
              helperText={errors.content?.[0]}
              fullWidth
              multiline
              rows={6}
            />

            <Autocomplete
              multiple
              options={productOptions}
              loading={productSearchLoading}
              getOptionLabel={(p) => `${p.title} (${p.sku})`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={selectedProducts}
              onChange={(_, newValue) => setSelectedProducts(newValue)}
              onInputChange={(_, newInput) => handleProductSearch(newInput)}
              noOptionsText="محصولی پیدا نشد"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="محصولات مرتبط (اختیاری)"
                  placeholder="جستجو..."
                />
              )}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {thumbnailPreviewUrl && (
                <Avatar
                  variant="rounded"
                  src={thumbnailPreviewUrl}
                  sx={{ width: 56, height: 56, bgcolor: "background.default" }}
                >
                  <ArticleIcon fontSize="small" />
                </Avatar>
              )}
              <Button variant="outlined" component="label">
                {thumbnailFile
                  ? thumbnailFile.name
                  : editingId
                  ? "تعویض تصویر شاخص"
                  : "انتخاب تصویر شاخص"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] || null)
                  }
                />
              </Button>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                />
              }
              label="منتشر شود"
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
