"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
import { Add, Edit, Delete, Payments } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatPrice, formatDateTime } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminReferralContent.tsx
|--------------------------------------------------------------------------
*/

type ReferralCode = {
  id: number;
  code: string;
  user_id: number;
  commission_type: "percentage" | "fixed";
  commission_value: number;
  is_active: boolean;
  user?: { id: number; name: string; phone: string | null };
};

type Commission = {
  id: number;
  commission_amount: number | null;
  status: "pending" | "approved" | "paid" | "cancelled";
  created_at: string;
  user: { id: number; name: string; phone: string | null };
  order: { id: number; status: string; total_amount: number };
  referral_code: { id: number; code: string };
};

const commissionStatusLabels: Record<
  string,
  { label: string; color: "default" | "warning" | "info" | "success" | "error" }
> = {
  pending: { label: "در انتظار پرداخت سفارش", color: "warning" },
  approved: { label: "قابل پرداخت", color: "info" },
  paid: { label: "پرداخت‌شده", color: "success" },
  cancelled: { label: "لغوشده", color: "default" },
};

type UserOption = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
};

const emptyCodeForm = {
  code: "",
  commission_type: "percentage" as "percentage" | "fixed",
  commission_value: "",
  is_active: true,
};

export function AdminReferralContent() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        کد معرف و پورسانت
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="کدهای معرف" />
        <Tab label="پورسانت‌ها" />
      </Tabs>

      {tab === 0 ? <ReferralCodesTab /> : <CommissionsTab />}
    </Box>
  );
}

// ------------------------------------------------------------------
// تب ۱: کدهای معرف
// ------------------------------------------------------------------

function ReferralCodesTab() {
  const [codes, setCodes] = useState<ReferralCode[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyCodeForm);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadCodes = () => {
    setCodes(null);
    adminAPI.referralCodes
      .list({ page: page + 1, per_page: rowsPerPage } as any)
      .then((res) => {
        setCodes(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyCodeForm);
    setSelectedUser(null);
    setUserOptions([]);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (code: ReferralCode) => {
    setEditingId(code.id);
    setForm({
      code: code.code,
      commission_type: code.commission_type,
      commission_value: String(code.commission_value),
      is_active: code.is_active,
    });
    setSelectedUser(
      code.user
        ? {
            id: code.user.id,
            name: code.user.name,
            phone: code.user.phone,
            email: null,
          }
        : {
            id: code.user_id,
            name: `کاربر #${code.user_id}`,
            phone: null,
            email: null,
          },
    );
    setUserOptions([]);
    setErrors({});
    setDialogOpen(true);
  };

  const handleUserSearch = (query: string) => {
    if (!query) {
      setUserOptions([]);
      return;
    }
    setUserSearchLoading(true);
    adminAPI.users
      .search(query)
      .then((res) => setUserOptions(res.data.data))
      .finally(() => setUserSearchLoading(false));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    if (!selectedUser) {
      setErrors({ user_id: ["یه کاربر رو انتخاب کنید."] });
      setIsSaving(false);
      return;
    }

    const payload = {
      code: form.code,
      user_id: selectedUser.id,
      commission_type: form.commission_type,
      commission_value: Number(form.commission_value),
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await adminAPI.referralCodes.update(editingId, payload);
      } else {
        await adminAPI.referralCodes.create(payload);
      }
      setDialogOpen(false);
      loadCodes();
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی کد معرف."] },
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این کد معرف حذف بشه؟")) return;
    await adminAPI.referralCodes.delete(id);
    loadCodes();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن کد معرف
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>کد</TableCell>
              <TableCell>صاحب کد</TableCell>
              <TableCell>پورسانت</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {codes === null ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    کد معرفی یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              codes.map((code) => (
                <TableRow key={code.id} hover>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      direction: "ltr",
                      textAlign: "right",
                    }}
                  >
                    {code.code}
                  </TableCell>
                  <TableCell>
                    {code.user?.name || `کاربر #${code.user_id}`}
                    {code.user?.phone && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {code.user.phone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {code.commission_type === "percentage"
                      ? `${code.commission_value}%`
                      : formatPrice(code.commission_value)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={code.is_active ? "فعال" : "غیرفعال"}
                      color={code.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(code)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(code.id)}
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
          {editingId ? "ویرایش کد معرف" : "افزودن کد معرف"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="کد"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              error={!!errors.code}
              helperText={errors.code?.[0]}
              fullWidth
            />
            <Autocomplete
              options={userOptions}
              loading={userSearchLoading}
              getOptionLabel={(u) =>
                `${u.name}${u.phone ? ` (${u.phone})` : ""}`
              }
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={selectedUser}
              onChange={(_, newValue) => setSelectedUser(newValue)}
              onInputChange={(_, newInput) => handleUserSearch(newInput)}
              noOptionsText="کاربری پیدا نشد"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="صاحب کد (جستجو با نام یا موبایل)"
                  error={!!errors.user_id}
                  helperText={errors.user_id?.[0]}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {userSearchLoading && <CircularProgress size={18} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl sx={{ flex: "1 1 160px" }}>
                <InputLabel>نوع پورسانت</InputLabel>
                <Select
                  label="نوع پورسانت"
                  value={form.commission_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      commission_type: e.target.value as "percentage" | "fixed",
                    })
                  }
                >
                  <MenuItem value="percentage">درصدی</MenuItem>
                  <MenuItem value="fixed">مبلغ ثابت</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={
                  form.commission_type === "percentage"
                    ? "درصد پورسانت"
                    : "مبلغ پورسانت (تومان)"
                }
                type="number"
                value={form.commission_value}
                onChange={(e) =>
                  setForm({ ...form, commission_value: e.target.value })
                }
                error={!!errors.commission_value}
                helperText={errors.commission_value?.[0]}
                sx={{ flex: "1 1 160px" }}
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

// ------------------------------------------------------------------
// تب ۲: پورسانت‌ها
// ------------------------------------------------------------------

function CommissionsTab() {
  const [commissions, setCommissions] = useState<Commission[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");

  const loadCommissions = () => {
    setCommissions(null);
    adminAPI.referralCommissions
      .list({
        status: statusFilter || undefined,
        page: page + 1,
        per_page: rowsPerPage,
      } as any)
      .then((res) => {
        setCommissions(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter]);

  const handleMarkPaid = async (id: number) => {
    if (!confirm("پرداخت این پورسانت ثبت بشه؟")) return;
    await adminAPI.referralCommissions.markPaid(id);
    loadCommissions();
  };

  return (
    <Box>
      <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
        <InputLabel>وضعیت</InputLabel>
        <Select
          label="وضعیت"
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value);
          }}
        >
          <MenuItem value="">همه</MenuItem>
          {Object.entries(commissionStatusLabels).map(([value, { label }]) => (
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
              <TableCell>معرف</TableCell>
              <TableCell>کد</TableCell>
              <TableCell>سفارش</TableCell>
              <TableCell>مبلغ پورسانت</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>تاریخ</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commissions === null ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : commissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    پورسانتی یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              commissions.map((c) => {
                const status = commissionStatusLabels[c.status];

                return (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      {c.user.name}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {c.user.phone}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ direction: "ltr", textAlign: "right" }}>
                      {c.referral_code.code}
                    </TableCell>
                    <TableCell>#{c.order.id}</TableCell>
                    <TableCell>
                      {c.commission_amount
                        ? formatPrice(c.commission_amount)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(c.created_at)}</TableCell>
                    <TableCell align="center">
                      {c.status === "approved" && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleMarkPaid(c.id)}
                          title="ثبت پرداخت"
                        >
                          <Payments fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
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
    </Box>
  );
}
