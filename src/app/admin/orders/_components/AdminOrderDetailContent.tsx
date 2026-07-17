"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatPrice, formatDateTime } from "@/lib/format";
import { getOrderStatusMeta } from "@/lib/orderStatus";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminOrderDetailContent.tsx
|--------------------------------------------------------------------------
| این کامپوننت هم می‌تونه مستقیم توی یه صفحه استفاده بشه، هم (که الان
| موردنظره) داخل یه Dialog/مودال روی همون صفحه‌ی لیست سفارش‌ها - برای
| همین onClose و onChanged رو اختیاری قبول می‌کنه.
*/

type OrderItem = {
  id: number;
  product_id: number | null;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  is_available: boolean;
};

type StatusHistory = {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_by: { id: number; name: string } | null;
  created_at: string;
};

type OrderDetail = {
  id: number;
  status: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  customer_note: string | null;
  admin_note: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  coupon: { id: number; code: string; type: string; value: number } | null;
  referral_code: {
    id: number;
    code: string;
    user: { id: number; name: string } | null;
  } | null;
  shipping_receiver_name: string | null;
  shipping_receiver_phone: string | null;
  shipping_city: string | null;
  shipping_full_address: string | null;
  shipping_carrier: string | null;
  shipping_service_name: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
  };
  items: OrderItem[];
  status_histories: StatusHistory[];
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        p: 3,
        mb: 3,
      }}
    >
      <Typography sx={{ fontWeight: 700, mb: 2 }}>{title}</Typography>
      {children}
    </Box>
  );
}

export function AdminOrderDetailContent({
  orderId,
  onClose,
  onChanged,
  readOnly = false,
}: {
  orderId: number;
  onClose?: () => void;
  onChanged?: () => void;
  readOnly?: boolean;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [itemsEdit, setItemsEdit] = useState<OrderItem[]>([]);
  const [adminNote, setAdminNote] = useState("");
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadOrder = () => {
    adminAPI.orders.show(orderId).then((res) => {
      setOrder(res.data.order);
      setItemsEdit(res.data.order.items);
      setAdminNote(res.data.order.admin_note || "");
    });
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!order) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const status = getOrderStatusMeta(order.status);

  const handleApprove = async () => {
    setActionError("");
    try {
      await adminAPI.orders.approve(order.id);
      loadOrder();
      onChanged?.();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "خطا در تأیید سفارش.");
    }
  };

  const handleCancel = async () => {
    const note = prompt("دلیل لغو (اختیاری):") || undefined;
    setActionError("");
    try {
      await adminAPI.orders.cancel(order.id, note);
      loadOrder();
      onChanged?.();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "خطا در لغو سفارش.");
    }
  };

  const handleSaveItems = async () => {
    setIsSaving(true);
    setActionError("");
    try {
      await adminAPI.orders.updateItems(order.id, {
        items: itemsEdit.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          is_available: i.is_available,
        })),
        admin_note: adminNote,
      });
      setIsEditingItems(false);
      loadOrder();
      onChanged?.();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || "خطا در ذخیره‌ی تغییرات آیتم‌ها.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleIssueInvoice = async () => {
    setActionError("");
    try {
      await adminAPI.orders.issueInvoice(order.id);
      loadOrder();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "صدور فاکتور شکست خورد.");
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            سفارش #{order.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDateTime(order.created_at)}
          </Typography>
        </Box>
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
                alignItems: "center",
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

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {/* دکمه‌های عملیات کلی - فقط وقتی readOnly نیست (مثلاً برای sales/support) */}
      {!readOnly && (
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
          {order.status === "pending_review" && !isEditingItems && (
            <Button
              variant="contained"
              disableElevation
              onClick={handleApprove}
            >
              تأیید سفارش (همه‌ی اقلام موجود)
            </Button>
          )}
          {order.status === "pending_review" && (
            <Button
              variant="outlined"
              onClick={() => setIsEditingItems((v) => !v)}
            >
              {isEditingItems
                ? "انصراف از ویرایش آیتم‌ها"
                : "ویرایش آیتم‌ها (بعضی ناموجودند)"}
            </Button>
          )}
          {[
            "pending_review",
            "needs_customer_confirmation",
            "awaiting_payment",
          ].includes(order.status) && (
            <Button variant="outlined" color="error" onClick={handleCancel}>
              لغو سفارش
            </Button>
          )}
          {order.status === "paid" && !order.invoice_number && (
            <Button variant="outlined" onClick={handleIssueInvoice}>
              صدور فاکتور
            </Button>
          )}
        </Stack>
      )}

      {/* اطلاعات مشتری و ارسال */}
      <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <Section title="مشتری">
            <Typography variant="body2">{order.user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.user.phone || order.user.email}
            </Typography>
          </Section>
        </Box>

        {order.shipping_full_address && (
          <Box sx={{ flex: "1 1 300px" }}>
            <Section title="ارسال">
              <Typography variant="body2">
                {order.shipping_receiver_name} - {order.shipping_receiver_phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.shipping_city}، {order.shipping_full_address}
              </Typography>
              {order.shipping_carrier && (
                <Typography variant="body2" color="text.secondary">
                  {order.shipping_carrier} ({order.shipping_service_name})
                </Typography>
              )}
            </Section>
          </Box>
        )}
      </Stack>

      {/* جدول آیتم‌ها */}
      <Section title="اقلام سفارش">
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>عنوان</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>قیمت واحد</TableCell>
                <TableCell>تعداد</TableCell>
                <TableCell>جمع</TableCell>
                {isEditingItems && (
                  <TableCell align="center">موجود است؟</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {itemsEdit.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{formatPrice(item.price)}</TableCell>
                  <TableCell>
                    {isEditingItems ? (
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => {
                          const next = [...itemsEdit];
                          next[idx] = {
                            ...item,
                            quantity: Math.max(1, Number(e.target.value)),
                          };
                          setItemsEdit(next);
                        }}
                        sx={{ width: 80 }}
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {formatPrice(item.price * item.quantity)}
                  </TableCell>
                  {isEditingItems && (
                    <TableCell align="center">
                      <Checkbox
                        checked={item.is_available}
                        onChange={(e) => {
                          const next = [...itemsEdit];
                          next[idx] = {
                            ...item,
                            is_available: e.target.checked,
                          };
                          setItemsEdit(next);
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {isEditingItems && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="یادداشت ادمین (برای مشتری)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              disableElevation
              onClick={handleSaveItems}
              disabled={isSaving}
            >
              {isSaving ? "در حال ذخیره..." : "ذخیره و ارسال برای تأیید مشتری"}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack spacing={0.5} sx={{ maxWidth: 300, mr: "auto" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              جمع جزء
            </Typography>
            <Typography variant="body2">
              {formatPrice(order.subtotal)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              تخفیف{order.coupon && ` (کد: ${order.coupon.code})`}
            </Typography>
            <Typography variant="body2">
              {formatPrice(order.discount_amount)}
            </Typography>
          </Stack>
          {order.referral_code && (
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                کد معرف
              </Typography>
              <Typography variant="body2" sx={{ direction: "ltr" }}>
                {order.referral_code.code}
                {order.referral_code.user &&
                  ` (${order.referral_code.user.name})`}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              هزینه ارسال
            </Typography>
            <Typography variant="body2">
              {formatPrice(order.shipping_cost)}
            </Typography>
          </Stack>
          <Divider />
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700 }}>مبلغ نهایی</Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {formatPrice(order.total_amount)}
            </Typography>
          </Stack>
        </Stack>
      </Section>

      {/* یادداشت مشتری */}
      {order.customer_note && (
        <Section title="یادداشت مشتری">
          <Typography variant="body2">{order.customer_note}</Typography>
        </Section>
      )}

      {/* تاریخچه وضعیت */}
      <Section title="تاریخچه وضعیت">
        <Stack spacing={1.5}>
          {order.status_histories.map((h) => (
            <Box
              key={h.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="body2">
                  {h.from_status
                    ? `${getOrderStatusMeta(h.from_status).label} ← `
                    : ""}
                  {getOrderStatusMeta(h.to_status).label}
                </Typography>
                {h.note && (
                  <Typography variant="caption" color="text.secondary">
                    {h.note}
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: "left" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {h.changed_by?.name || "سیستم"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(h.created_at)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Section>
    </Box>
  );
}
