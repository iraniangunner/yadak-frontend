"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatPrice, formatDateTime } from "@/lib/format";
import { getReturnStatusMeta } from "@/lib/returnStatus";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminReturnDetailContent.tsx
|--------------------------------------------------------------------------
*/

type ReturnItem = {
  id: number;
  quantity: number;
  reason: string;
  status: string;
  refund_amount: number | null;
  admin_note: string | null;
  created_at: string;
  user: { id: number; name: string; phone: string | null };
  order_item: { id: number; title: string; sku: string };
  order: { id: number; status: string };
};

export function AdminReturnDetailContent({
  returnItem,
  onClose,
  onChanged,
}: {
  returnItem: ReturnItem;
  onClose?: () => void;
  onChanged?: () => void;
}) {
  const [adminNote, setAdminNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const status = getReturnStatusMeta(returnItem.status);

  const handleApprove = async () => {
    setIsSaving(true);
    setError("");
    try {
      await adminAPI.returns.approve(returnItem.id, adminNote || undefined);
      onChanged?.();
      onClose?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در تأیید مرجوعی.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim()) {
      setError("برای رد کردن، نوشتن دلیل الزامی است.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await adminAPI.returns.reject(returnItem.id, adminNote);
      onChanged?.();
      onClose?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در رد مرجوعی.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkRefunded = async () => {
    const amount = Number(refundAmount);
    if (!amount || amount <= 0) {
      setError("مبلغ واریزی را وارد کنید.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await adminAPI.returns.markRefunded(returnItem.id, amount);
      onChanged?.();
      onClose?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در ثبت واریز.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          درخواست مرجوعی #{returnItem.id}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip label={status.label} color={status.color} />
          {onClose && (
            <Box
              component="button"
              onClick={onClose}
              sx={{
                border: "none",
                bgcolor: "transparent",
                cursor: "pointer",
                display: "flex",
                p: 0.5,
                borderRadius: "50%",
                "&:hover": { bgcolor: "background.default" },
              }}
            >
              <CloseIcon fontSize="small" />
            </Box>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            مشتری
          </Typography>
          <Typography variant="body2">
            {returnItem.user.name} - {returnItem.user.phone}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            مربوط به سفارش
          </Typography>
          <Typography variant="body2">#{returnItem.order.id}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            کالا
          </Typography>
          <Typography variant="body2">
            {returnItem.order_item.title} ({returnItem.order_item.sku}) - تعداد{" "}
            {returnItem.quantity}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            دلیل مشتری
          </Typography>
          <Typography variant="body2">{returnItem.reason}</Typography>
        </Box>
        {returnItem.admin_note && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              یادداشت ادمین
            </Typography>
            <Typography variant="body2">{returnItem.admin_note}</Typography>
          </Box>
        )}
        {returnItem.refund_amount !== null && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              مبلغ واریزشده
            </Typography>
            <Typography variant="body2">
              {formatPrice(returnItem.refund_amount)}
            </Typography>
          </Box>
        )}
        <Box>
          <Typography variant="caption" color="text.secondary">
            تاریخ ثبت
          </Typography>
          <Typography variant="body2">
            {formatDateTime(returnItem.created_at)}
          </Typography>
        </Box>
      </Stack>

      {returnItem.status === "requested" && (
        <Box>
          <TextField
            label="یادداشت (برای تأیید اختیاری، برای رد الزامی)"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              disableElevation
              onClick={handleApprove}
              disabled={isSaving}
            >
              تأیید مرجوعی
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleReject}
              disabled={isSaving}
            >
              رد درخواست
            </Button>
          </Stack>
        </Box>
      )}

      {returnItem.status === "approved" && (
        <Box>
          <TextField
            label="مبلغ واریزشده (تومان)"
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            disableElevation
            onClick={handleMarkRefunded}
            disabled={isSaving}
          >
            ثبت واریز
          </Button>
        </Box>
      )}
    </Box>
  );
}
