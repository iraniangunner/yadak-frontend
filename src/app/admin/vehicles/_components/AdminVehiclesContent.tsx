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
  Avatar,
  Autocomplete,
} from "@mui/material";
import { Add, Edit, Delete, DirectionsCar } from "@mui/icons-material";
import { adminAPI, vehiclesAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminVehiclesContent.tsx
|--------------------------------------------------------------------------
| ⚠️ تصویر روی همین جدول vehicles ذخیره می‌شه (نه یه جدول جدا). چون
| چندتا ردیف می‌تونن یه برند مشترک داشته باشن، برای نمایش «عکس برند
| خودرو» توی فروشگاه، بک‌اند اولین ردیفی که برای اون برند thumbnail
| داره رو انتخاب می‌کنه - پس کافیه حداقل روی یکی از ردیف‌های هر برند
| (نیازی نیست همه) عکس بذارید.
*/

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  generation: string[] | null;
  thumbnail_url: string | null;
  year_from: number | null;
  year_to: number | null;
  is_active: boolean;
};

const emptyForm = {
  brand: "",
  model: "",
  generation: [] as string[],
  year_from: "",
  year_to: "",
  is_active: true,
};

export function AdminVehiclesContent() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
    string | null
  >(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadVehicles = () => {
    setVehicles(null);
    vehiclesAPI
      .list({
        search: search || undefined,
        with_inactive: true,
        page: page + 1,
        per_page: rowsPerPage,
      } as any)
      .then((res) => {
        setVehicles(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setThumbnailFile(null);
    setExistingThumbnailUrl(null);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      brand: vehicle.brand,
      model: vehicle.model,
      generation: vehicle.generation || [],
      year_from: vehicle.year_from ? String(vehicle.year_from) : "",
      year_to: vehicle.year_to ? String(vehicle.year_to) : "",
      is_active: vehicle.is_active,
    });
    setThumbnailFile(null);
    setExistingThumbnailUrl(vehicle.thumbnail_url);
    setErrors({});
    setDialogOpen(true);
  };

  const thumbnailPreviewUrl = useMemo(() => {
    if (thumbnailFile) return URL.createObjectURL(thumbnailFile);
    return existingThumbnailUrl;
  }, [thumbnailFile, existingThumbnailUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const fd = new FormData();
    fd.append("brand", form.brand);
    fd.append("model", form.model);
    if (form.generation.length > 0)
      form.generation.forEach((g) => fd.append("generation[]", g));
    if (form.year_from) fd.append("year_from", form.year_from);
    if (form.year_to) fd.append("year_to", form.year_to);
    fd.append("is_active", form.is_active ? "1" : "0");
    if (thumbnailFile) fd.append("thumbnail", thumbnailFile);

    try {
      if (editingId) {
        await adminAPI.vehicles.update(editingId, fd);
      } else {
        await adminAPI.vehicles.create(fd);
      }
      setDialogOpen(false);
      loadVehicles();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی خودرو."] }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این خودرو حذف بشه؟")) return;
    await adminAPI.vehicles.delete(id);
    loadVehicles();
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
          خودروها
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن خودرو
        </Button>
      </Box>

      <TextField
        placeholder="جستجو در برند یا مدل..."
        size="small"
        value={search}
        onChange={(e) => {
          setPage(0);
          setSearch(e.target.value);
        }}
        sx={{ mb: 2, minWidth: 260 }}
      />

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>برند</TableCell>
              <TableCell>مدل</TableCell>
              <TableCell>نسل</TableCell>
              <TableCell>بازه‌ی سال</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles === null ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    خودرویی یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} hover>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={vehicle.thumbnail_url || undefined}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "background.default",
                      }}
                    >
                      <DirectionsCar fontSize="small" />
                    </Avatar>
                  </TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>
                    {vehicle.generation && vehicle.generation.length > 0
                      ? vehicle.generation.join("، ")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {vehicle.year_from || vehicle.year_to
                      ? `${vehicle.year_from ?? "?"} تا ${
                          vehicle.year_to ?? "?"
                        }`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={vehicle.is_active ? "فعال" : "غیرفعال"}
                      color={vehicle.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(vehicle)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(vehicle.id)}
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
          {editingId ? "ویرایش خودرو" : "افزودن خودرو"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="برند"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                error={!!errors.brand}
                helperText={errors.brand?.[0]}
                sx={{ flex: "1 1 160px" }}
              />
              <TextField
                label="مدل"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                error={!!errors.model}
                helperText={errors.model?.[0]}
                sx={{ flex: "1 1 160px" }}
              />
            </Box>

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={form.generation}
              onChange={(_, newValue) =>
                setForm({ ...form, generation: newValue })
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="نسل/تیپ (اختیاری، چندتایی)"
                  placeholder="تایپ کنید و Enter بزنید..."
                />
              )}
              fullWidth
            />

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="سال شروع تولید (اختیاری)"
                type="number"
                value={form.year_from}
                onChange={(e) =>
                  setForm({ ...form, year_from: e.target.value })
                }
                error={!!errors.year_from}
                helperText={errors.year_from?.[0]}
                sx={{ flex: "1 1 180px" }}
              />
              <TextField
                label="سال پایان تولید (اختیاری)"
                type="number"
                value={form.year_to}
                onChange={(e) => setForm({ ...form, year_to: e.target.value })}
                error={!!errors.year_to}
                helperText={errors.year_to?.[0]}
                sx={{ flex: "1 1 180px" }}
              />
            </Box>

            {/* تصویر - دقیقاً هم‌الگو با دسته‌بندی/برند. اگه چندتا ردیف
                یه برند مشترک دارن، همینکه روی یکیشون عکس بذارید کافیه -
                فروشگاه همون رو برای کل اون برند نشون می‌ده. */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {thumbnailPreviewUrl && (
                <Avatar
                  variant="rounded"
                  src={thumbnailPreviewUrl}
                  sx={{ width: 56, height: 56, bgcolor: "background.default" }}
                >
                  <DirectionsCar fontSize="small" />
                </Avatar>
              )}
              <Box>
                <Button variant="outlined" component="label">
                  {thumbnailFile
                    ? thumbnailFile.name
                    : editingId
                    ? "تعویض تصویر برند"
                    : "انتخاب تصویر برند (اختیاری)"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      setThumbnailFile(e.target.files?.[0] || null)
                    }
                  />
                </Button>
                {errors.thumbnail && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {errors.thumbnail[0]}
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
