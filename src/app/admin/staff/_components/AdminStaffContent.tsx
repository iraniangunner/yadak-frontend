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
  Alert,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminStaffContent.tsx
|--------------------------------------------------------------------------
| ⚠️ بک‌اند برای ویرایش (StaffController::update) فقط name/role/is_active
| رو قبول می‌کنه - نه ایمیل نه رمز عبور. برای همین فرم ویرایش این دو فیلد
| رو نشون نمی‌ده، فقط فرم ساخت نشونشون می‌ده.
| همچنین «حذف» در واقع غیرفعال‌سازیه (destroy فقط is_active=false می‌کنه،
| رکورد پاک نمی‌شه) - طبق طراحی خودِ بک‌اند.
*/

const roleLabels: Record<string, string> = {
  admin: "مدیر",
  warehouse: "انبار",
  sales: "فروش",
  support: "پشتیبانی",
};

type Staff = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

const emptyCreateForm = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "support",
};

const emptyEditForm = {
  name: "",
  role: "support",
  is_active: true,
};

export function AdminStaffContent() {
  const [staff, setStaff] = useState<Staff[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadStaff = () => {
    setStaff(null);
    adminAPI.staff
      .list({ page: page + 1, per_page: rowsPerPage } as any)
      .then((res) => {
        setStaff(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const openCreateDialog = () => {
    setEditingId(null);
    setCreateForm(emptyCreateForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (member: Staff) => {
    setEditingId(member.id);
    setEditForm({
      name: member.name,
      role: member.role,
      is_active: member.is_active,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    try {
      if (editingId) {
        await adminAPI.staff.update(editingId, editForm);
      } else {
        await adminAPI.staff.create(createForm);
      }
      setDialogOpen(false);
      loadStaff();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی کارمند."] },
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این کارمند غیرفعال بشه؟")) return;
    await adminAPI.staff.delete(id);
    loadStaff();
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
          کارمندان
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن کارمند
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نام</TableCell>
              <TableCell>ایمیل</TableCell>
              <TableCell>نقش</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff === null ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    کارمندی یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>{member.name}</TableCell>
                  <TableCell sx={{ direction: "ltr", textAlign: "right" }}>
                    {member.email}
                  </TableCell>
                  <TableCell>
                    {roleLabels[member.role] || member.role}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.is_active ? "فعال" : "غیرفعال"}
                      color={member.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(member)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(member.id)}
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
          {editingId ? "ویرایش کارمند" : "افزودن کارمند"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          {editingId ? (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <TextField
                label="نام"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                error={!!errors.name}
                helperText={errors.name?.[0]}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>نقش</InputLabel>
                <Select
                  label="نقش"
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>وضعیت</InputLabel>
                <Select
                  label="وضعیت"
                  value={editForm.is_active ? "1" : "0"}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      is_active: e.target.value === "1",
                    })
                  }
                >
                  <MenuItem value="1">فعال</MenuItem>
                  <MenuItem value="0">غیرفعال</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <TextField
                label="نام"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                error={!!errors.name}
                helperText={errors.name?.[0]}
                fullWidth
              />
              <TextField
                label="ایمیل"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                error={!!errors.email}
                helperText={errors.email?.[0]}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>نقش</InputLabel>
                <Select
                  label="نقش"
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, role: e.target.value })
                  }
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="رمز عبور"
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                error={!!errors.password}
                helperText={errors.password?.[0]}
                fullWidth
              />
              <TextField
                label="تکرار رمز عبور"
                type="password"
                value={createForm.password_confirmation}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    password_confirmation: e.target.value,
                  })
                }
                fullWidth
              />
            </Box>
          )}
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
