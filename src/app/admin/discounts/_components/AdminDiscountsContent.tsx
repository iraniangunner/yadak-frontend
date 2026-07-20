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
  Autocomplete,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { adminAPI, brandsAPI, categoriesAPI, productsAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { JalaliDateField } from "@/app/_components/JalaliDateField";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminDiscountsContent.tsx
|--------------------------------------------------------------------------
*/

const typeLabels: Record<string, string> = {
  product: "محصول",
  category: "دسته‌بندی",
  brand: "برند",
};

type DiscountableOption = { id: number; title?: string; name?: string };

type Discount = {
  id: number;
  discountable_type: string;
  discountable_id: number;
  type: "percentage" | "fixed";
  value: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  discountable: DiscountableOption | null;
};

const emptyForm = {
  discountable_type: "product" as "product" | "category" | "brand",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

function labelOf(item: DiscountableOption | null): string {
  if (!item) return "—";
  return item.title || item.name || `#${item.id}`;
}

export function AdminDiscountsContent() {
  const [discounts, setDiscounts] = useState<Discount[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [typeFilter, setTypeFilter] = useState("");

  const [categories, setCategories] = useState<DiscountableOption[]>([]);
  const [brands, setBrands] = useState<DiscountableOption[]>([]);
  const [productOptions, setProductOptions] = useState<DiscountableOption[]>(
    [],
  );
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedItem, setSelectedItem] = useState<DiscountableOption | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadDiscounts = () => {
    setDiscounts(null);
    adminAPI.discounts
      .list({
        discountable_type: typeFilter || undefined,
        page: page + 1,
        per_page: rowsPerPage,
      } as any)
      .then((res) => {
        setDiscounts(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, typeFilter]);

  useEffect(() => {
    categoriesAPI.list().then((res) => setCategories(res.data.data));
    brandsAPI.list().then((res) => setBrands(res.data.data));
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedItem(null);
    setProductOptions([]);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (discount: Discount) => {
    setEditingId(discount.id);
    setForm({
      discountable_type: discount.discountable_type as
        | "product"
        | "category"
        | "brand",
      type: discount.type,
      value: String(discount.value),
      starts_at: discount.starts_at ? discount.starts_at.slice(0, 10) : "",
      ends_at: discount.ends_at ? discount.ends_at.slice(0, 10) : "",
      is_active: discount.is_active,
    });
    setSelectedItem(
      discount.discountable || {
        id: discount.discountable_id,
        name: `#${discount.discountable_id}`,
      },
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
      .list({ search: query } as any)
      .then((res) => setProductOptions(res.data.data))
      .finally(() => setProductSearchLoading(false));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    if (!selectedItem) {
      setErrors({ discountable_id: ["یه مورد رو انتخاب کنید."] });
      setIsSaving(false);
      return;
    }

    const payload = {
      discountable_type: form.discountable_type,
      discountable_id: selectedItem.id,
      type: form.type,
      value: Number(form.value),
      starts_at: form.starts_at || undefined,
      ends_at: form.ends_at || undefined,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await adminAPI.discounts.update(editingId, payload);
      } else {
        await adminAPI.discounts.create(payload);
      }
      setDialogOpen(false);
      loadDiscounts();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی تخفیف."] },
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این تخفیف حذف بشه؟")) return;
    await adminAPI.discounts.delete(id);
    loadDiscounts();
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          تخفیف‌ها
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن تخفیف
        </Button>
      </Box>

      <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>نوع</InputLabel>
        <Select
          label="نوع"
          value={typeFilter}
          onChange={(e) => {
            setPage(0);
            setTypeFilter(e.target.value);
          }}
        >
          <MenuItem value="">همه</MenuItem>
          {Object.entries(typeLabels).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>روی</TableCell>
              <TableCell>نوع</TableCell>
              <TableCell>مقدار</TableCell>
              <TableCell>بازه</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {discounts === null ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : discounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    تخفیفی یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              discounts.map((discount) => (
                <TableRow key={discount.id} hover>
                  <TableCell>
                    {labelOf(discount.discountable)}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {typeLabels[discount.discountable_type] ||
                        discount.discountable_type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {discount.type === "percentage" ? "درصدی" : "مبلغ ثابت"}
                  </TableCell>
                  <TableCell>
                    {discount.type === "percentage"
                      ? `${discount.value}%`
                      : formatPrice(discount.value)}
                  </TableCell>
                  <TableCell>
                    {discount.starts_at || discount.ends_at
                      ? `${discount.starts_at?.slice(0, 10) ?? "؟"} تا ${discount.ends_at?.slice(0, 10) ?? "؟"}`
                      : "همیشه"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={discount.is_active ? "فعال" : "غیرفعال"}
                      color={discount.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(discount)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(discount.id)}
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
          {editingId ? "ویرایش تخفیف" : "افزودن تخفیف"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth disabled={!!editingId}>
              <InputLabel>اعمال روی</InputLabel>
              <Select
                label="اعمال روی"
                value={form.discountable_type}
                onChange={(e) => {
                  setForm({
                    ...form,
                    discountable_type: e.target.value as
                      | "product"
                      | "category"
                      | "brand",
                  });
                  setSelectedItem(null);
                }}
              >
                <MenuItem value="product">محصول</MenuItem>
                <MenuItem value="category">دسته‌بندی</MenuItem>
                <MenuItem value="brand">برند</MenuItem>
              </Select>
            </FormControl>

            {form.discountable_type === "product" ? (
              <Autocomplete
                options={productOptions}
                loading={productSearchLoading}
                getOptionLabel={(o) => o.title || o.name || `#${o.id}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={selectedItem}
                onChange={(_, newValue) => setSelectedItem(newValue)}
                onInputChange={(_, newInput) => handleProductSearch(newInput)}
                noOptionsText="محصولی پیدا نشد"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="جستجوی محصول"
                    error={!!errors.discountable_id}
                    helperText={errors.discountable_id?.[0]}
                  />
                )}
              />
            ) : (
              <FormControl fullWidth error={!!errors.discountable_id}>
                <InputLabel>
                  {form.discountable_type === "category" ? "دسته‌بندی" : "برند"}
                </InputLabel>
                <Select
                  label={
                    form.discountable_type === "category" ? "دسته‌بندی" : "برند"
                  }
                  value={selectedItem ? String(selectedItem.id) : ""}
                  onChange={(e) => {
                    const list =
                      form.discountable_type === "category"
                        ? categories
                        : brands;
                    const found =
                      list.find((i) => String(i.id) === e.target.value) || null;
                    setSelectedItem(found);
                  }}
                >
                  {(form.discountable_type === "category"
                    ? categories
                    : brands
                  ).map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl sx={{ flex: "1 1 160px" }}>
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
                label={form.type === "percentage" ? "درصد" : "مبلغ (تومان)"}
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                error={!!errors.value}
                helperText={errors.value?.[0]}
                sx={{ flex: "1 1 160px" }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <JalaliDateField
                label="تاریخ شروع (اختیاری)"
                defaultValue={editingId ? form.starts_at || null : null}
                onChange={(iso) => setForm({ ...form, starts_at: iso })}
              />
              <JalaliDateField
                label="تاریخ پایان (اختیاری)"
                defaultValue={editingId ? form.ends_at || null : null}
                onChange={(iso) => setForm({ ...form, ends_at: iso })}
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
