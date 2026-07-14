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
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { adminAPI, vehiclesAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminVehiclesContent.tsx
|--------------------------------------------------------------------------
*/

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  generation: string | null;
  year_from: number | null;
  year_to: number | null;
  is_active: boolean;
};

const emptyForm = {
  brand: "",
  model: "",
  generation: "",
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
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      brand: vehicle.brand,
      model: vehicle.model,
      generation: vehicle.generation || "",
      year_from: vehicle.year_from ? String(vehicle.year_from) : "",
      year_to: vehicle.year_to ? String(vehicle.year_to) : "",
      is_active: vehicle.is_active,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const payload = {
      brand: form.brand,
      model: form.model,
      generation: form.generation || undefined,
      year_from: form.year_from ? Number(form.year_from) : undefined,
      year_to: form.year_to ? Number(form.year_to) : undefined,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await adminAPI.vehicles.update(editingId, payload);
      } else {
        await adminAPI.vehicles.create(payload);
      }
      setDialogOpen(false);
      loadVehicles();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی خودرو."] },
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
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    خودرویی یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} hover>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.generation || "—"}</TableCell>
                  <TableCell>
                    {vehicle.year_from || vehicle.year_to
                      ? `${vehicle.year_from ?? "?"} تا ${vehicle.year_to ?? "?"}`
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

            <TextField
              label="نسل (اختیاری)"
              value={form.generation}
              onChange={(e) => setForm({ ...form, generation: e.target.value })}
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
