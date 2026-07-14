"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, LocationOn, Person, Phone } from "@mui/icons-material";
import { addressesAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/AddressesContent.tsx
|--------------------------------------------------------------------------
*/

type Address = {
  id: number;
  title: string | null;
  receiver_name: string;
  receiver_phone: string;
  province: string | null;
  city: string;
  full_address: string;
  postal_code: string | null;
  is_default: boolean;
};

const emptyForm = {
  title: "",
  receiver_name: "",
  receiver_phone: "",
  province: "",
  city: "",
  full_address: "",
  postal_code: "",
  is_default: false,
};

export function AddressesContent() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadAddresses = () => {
    addressesAPI.list().then((res:any) => setAddresses(res.data.data));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingId(address.id);
    setForm({
      title: address.title || "",
      receiver_name: address.receiver_name,
      receiver_phone: address.receiver_phone,
      province: address.province || "",
      city: address.city,
      full_address: address.full_address,
      postal_code: address.postal_code || "",
      is_default: address.is_default,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    try {
      if (editingId) {
        await addressesAPI.update(editingId, form);
      } else {
        await addressesAPI.create(form);
      }
      setDialogOpen(false);
      loadAddresses();
    } catch (err: any) {
      setErrors(err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی آدرس."] });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این آدرس حذف بشه؟")) return;
    await addressesAPI.delete(id);
    loadAddresses();
  };

  if (addresses === null) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          آدرس‌های من
        </Typography>
        <Button variant="contained" disableElevation startIcon={<Add />} onClick={openCreateDialog}>
          افزودن آدرس
        </Button>
      </Stack>

      {addresses.length === 0 ? (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 5,
            textAlign: "center",
          }}
        >
          <LocationOn sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">هنوز آدرسی ثبت نکرده‌اید</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {addresses.map((address) => (
            <Box
              key={address.id}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                borderInlineStart: "4px solid",
                borderColor: address.is_default ? "primary.main" : "transparent",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 3 }}>
                {/* هدر کارت: آیکون + عنوان + بج پیش‌فرض + دکمه‌ها */}
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "rgba(30,58,138,0.08)",
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <LocationOn fontSize="small" />
                    </Box>
                    <Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography sx={{ fontWeight: 700 }}>
                          {address.title || "بدون عنوان"}
                        </Typography>
                        {address.is_default && (
                          <Chip
                            label="پیش‌فرض"
                            size="small"
                            sx={{
                              bgcolor: "rgba(30,58,138,0.08)",
                              color: "primary.main",
                              fontWeight: 600,
                              height: 22,
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {address.province ? `${address.province}, ` : ""}
                        {address.city}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => openEditDialog(address)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(address.id)}>
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </Stack>
                </Stack>

                {/* اطلاعات گیرنده */}
                <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: "wrap" }}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    <Person fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography variant="body2">{address.receiver_name}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    <Phone fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ direction: "ltr" }}>
                      {address.receiver_phone}
                    </Typography>
                  </Stack>
                </Stack>

                {/* آدرس کامل، توی یه باکس بردردار */}
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {address.full_address}
                    {address.postal_code && ` — کدپستی: ${address.postal_code}`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "ویرایش آدرس" : "افزودن آدرس جدید"}
        </DialogTitle>
        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="عنوان (مثلاً خانه، محل کار)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="نام گیرنده"
                value={form.receiver_name}
                onChange={(e) => setForm({ ...form, receiver_name: e.target.value })}
                error={!!errors.receiver_name}
                helperText={errors.receiver_name?.[0]}
                sx={{ flex: "1 1 200px" }}
              />
              <TextField
                label="موبایل گیرنده"
                value={form.receiver_phone}
                onChange={(e) => setForm({ ...form, receiver_phone: e.target.value })}
                error={!!errors.receiver_phone}
                helperText={errors.receiver_phone?.[0]}
                sx={{ flex: "1 1 200px" }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="استان"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                sx={{ flex: "1 1 160px" }}
              />
              <TextField
                label="شهر"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                error={!!errors.city}
                helperText={errors.city?.[0]}
                sx={{ flex: "1 1 160px" }}
              />
              <TextField
                label="کدپستی"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                sx={{ flex: "1 1 160px" }}
              />
            </Box>
            <TextField
              label="آدرس کامل"
              value={form.full_address}
              onChange={(e) => setForm({ ...form, full_address: e.target.value })}
              error={!!errors.full_address}
              helperText={errors.full_address?.[0]}
              multiline
              rows={2}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                />
              }
              label="آدرس پیش‌فرض باشد"
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