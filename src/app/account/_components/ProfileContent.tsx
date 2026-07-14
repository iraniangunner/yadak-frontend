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
  Chip,
} from "@mui/material";
import { useAuthStore } from "@/lib/store/authStore";
import { authAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/ProfileContent.tsx
|--------------------------------------------------------------------------
*/

function DisplayField({
  label,
  value,
  verified,
}: {
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <Box sx={{ flex: "1 1 240px" }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography variant="body2" noWrap>
          {value}
        </Typography>
        {verified && (
          <Chip
            label="تأییدشده"
            size="small"
            sx={{
              bgcolor: "rgba(22,163,74,0.1)",
              color: "#16a34a",
              fontWeight: 600,
              fontSize: "0.7rem",
              flexShrink: 0,
            }}
          />
        )}
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
        email: form.email,
        city: form.city,
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
    <Box>
      {/* هدر شبه‌تب، فقط برای هماهنگی بصری */}
      <Box sx={{ display: "flex", gap: 3, mb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.95rem",
            pb: 1.5,
            borderBottom: "2px solid",
            borderColor: "primary.main",
            color: "primary.main",
          }}
        >
          اطلاعات فردی
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          p: { xs: 2.5, sm: 4 },
        }}
      >
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general[0]}
          </Alert>
        )}

        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5 }}
        >
          <Typography sx={{ fontWeight: 700 }}>اطلاعات شخصی</Typography>

          {!isEditing ? (
            <Button variant="outlined" size="small" onClick={startEditing}>
              ویرایش
            </Button>
          ) : (
            <Button variant="text" size="small" color="inherit" onClick={() => setIsEditing(false)}>
              انصراف
            </Button>
          )}
        </Stack>

        {isEditing ? (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, mb: 3 }}>
              <TextField
                label="نام و نام خانوادگی"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name?.[0]}
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

            <Typography sx={{ fontWeight: 700, mb: 2 }}>سایر اطلاعات</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, mb: 3 }}>
              <TextField
                label="ایمیل"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email?.[0]}
                sx={{ flex: "1 1 240px" }}
              />
            </Box>

            <Button variant="contained" disableElevation onClick={handleSave} disabled={isSaving}>
              {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </>
        ) : (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, mb: 4 }}>
              <DisplayField label="نام و نام خانوادگی" value={user.name} />
              <DisplayField label="شهر" value={user.city || "ثبت نشده"} />
            </Box>

            <Typography sx={{ fontWeight: 700, mb: 2 }}>سایر اطلاعات</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
              <DisplayField
                label="ایمیل"
                value={user.email || "ثبت نشده"}
                verified={!!user.email}
              />
              <DisplayField
                label="شماره موبایل"
                value={user.phone || "ثبت نشده"}
                verified={!!user.phone}
              />
            </Box>
          </>
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