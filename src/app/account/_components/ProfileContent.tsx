"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Alert,
  Snackbar,
  Avatar,
  Chip,
} from "@mui/material";
import { Edit, Email, Phone, LocationCity, Close } from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";
import { authAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/ProfileContent.tsx
|--------------------------------------------------------------------------
*/

const roleLabels: Record<string, string> = {
  admin: "مدیر",
  warehouse: "انبار",
  sales: "فروش",
  support: "پشتیبانی",
  customer: "مشتری",
};

function initialsOf(name: string) {
  const parts = name.trim().split(" ");
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        flex: "1 1 220px",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 2,
        borderRadius: 2,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export function ProfileContent() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", city: "" });

  const startEditing = () => {
    if (!user) return;
    setForm({ name: user.name, email: user.email || "", city: user.city || "" });
    setErrors({});
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    try {
      await authAPI.updateProfile({
        name: form.name,
        email: form.email || undefined,
        city: form.city || undefined,
      });
      await refreshUser();
      setIsEditing(false);
      setShowSuccess(true);
    } catch (err: any) {
      const responseErrors = err?.response?.data?.errors;
      setErrors(responseErrors || { general: ["خطا در ذخیره‌ی اطلاعات. دوباره تلاش کنید."] });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Typography color="text.secondary">در حال بارگذاری...</Typography>;
  }

  if (!user) {
    return <Typography color="text.secondary">اطلاعاتی برای نمایش وجود ندارد.</Typography>;
  }

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* هدر */}
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          display: "flex",
          alignItems: "center",
          gap: 2.5,
          flexWrap: "wrap",
        }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontSize: "1.6rem",
            fontWeight: 700,
          }}
        >
          {initialsOf(user.name)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 160 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {user.name}
          </Typography>
          <Chip
            label={roleLabels[user.role] || user.role}
            size="small"
            sx={{
              mt: 0.5,
              bgcolor: "accent.main",
              color: "accent.contrastText",
              fontWeight: 600,
            }}
          />
        </Box>

        {!isEditing && (
          <Button variant="contained" startIcon={<Edit />} onClick={startEditing} disableElevation>
            ویرایش پروفایل
          </Button>
        )}
      </Box>

      <Box sx={{ height: "1px", bgcolor: "divider" }} />

      {/* بدنه */}
      <Box sx={{ p: { xs: 3, sm: 4 } }}>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general[0]}
          </Alert>
        )}

        {isEditing ? (
          <Box>
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                ویرایش اطلاعات
              </Typography>
              <Button
                size="small"
                color="inherit"
                startIcon={<Close />}
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                بستن
              </Button>
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
              <TextField
                label="نام و نام خانوادگی"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name?.[0]}
                sx={{ flex: "1 1 240px" }}
              />
              <TextField
                label="ایمیل"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email?.[0]}
                sx={{ flex: "1 1 240px" }}
              />
              <TextField
                label="شهر"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                error={!!errors.city}
                helperText={errors.city?.[0]}
                sx={{ flex: "1 1 240px" }}
              />
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button variant="contained" disableElevation onClick={handleSave} disabled={isSaving}>
                {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                انصراف
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <InfoBox icon={<Email fontSize="small" />} label="ایمیل" value={user.email || "ثبت نشده"} />
            <InfoBox icon={<Phone fontSize="small" />} label="شماره موبایل" value={user.phone || "ثبت نشده"} />
            <InfoBox icon={<LocationCity fontSize="small" />} label="شهر" value={user.city || "ثبت نشده"} />
          </Box>
        )}
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          اطلاعات با موفقیت ذخیره شد
        </Alert>
      </Snackbar>
    </Box>
  );
}