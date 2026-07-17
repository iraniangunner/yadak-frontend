"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { addressesAPI, shippingAPI, ordersAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/CheckoutContent.tsx
|--------------------------------------------------------------------------
| فرض‌های این فایل (چون منبع اصلی این endpoint ها جلوم نبود، اگه فرق
| داشت فقط اسم فیلدها رو بگید تا اصلاح کنم):
| - پاسخ shippingAPI.options یه آرایه data با فیلدهای
|   {carrier, service_name, cost, eta_days} برمی‌گردونه.
| - پاسخ ordersAPI.create یه فیلد order (با id) برمی‌گردونه.
*/

type Address = {
  id: number;
  title: string | null;
  receiver_name: string;
  receiver_phone: string;
  city: string;
  full_address: string;
  is_default: boolean;
};

type ShippingOption = {
  carrier: string;
  service_name: string;
  cost: number;
  eta_days?: number;
};

const emptyAddressForm = {
  title: "",
  receiver_name: "",
  receiver_phone: "",
  city: "",
  full_address: "",
  postal_code: "",
};

export function CheckoutContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressErrors, setAddressErrors] = useState<Record<string, string[]>>({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [selectedShippingIndex, setSelectedShippingIndex] = useState<number | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/checkout");
      return;
    }
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [mounted, authLoading, user, items.length, router]);

  useEffect(() => {
    if (!user) return;
    addressesAPI.list().then((res:any) => {
      const list: Address[] = res.data.data;
      setAddresses(list);
      const defaultAddr = list.find((a) => a.is_default) || list[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    });
  }, [user]);

  useEffect(() => {
    const address = addresses?.find((a) => a.id === selectedAddressId);
    if (!address) return;

    setIsLoadingShipping(true);
    setSelectedShippingIndex(null);
    shippingAPI
      .options({
        city: address.city,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      })
      .then((res) => {
        const options: ShippingOption[] = res.data.options || [];
        setShippingOptions(options);
        if (options.length > 0) setSelectedShippingIndex(0);
      })
      .catch(() => setShippingOptions([]))
      .finally(() => setIsLoadingShipping(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId, addresses]);

  const handleSaveAddress = async () => {
    setIsSavingAddress(true);
    setAddressErrors({});
    try {
      const res = await addressesAPI.create(addressForm);
      const newAddress = res.data.address || res.data.data;
      setAddresses((prev) => [...(prev || []), newAddress]);
      setSelectedAddressId(newAddress.id);
      setAddressDialogOpen(false);
      setAddressForm(emptyAddressForm);
    } catch (err: any) {
      setAddressErrors(err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی آدرس."] });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const shippingCost = selectedShippingIndex !== null ? shippingOptions?.[selectedShippingIndex]?.cost || 0 : 0;
  const estimatedTotal = subtotal + shippingCost;

  const handleSubmit = async () => {
    if (!selectedAddressId) {
      setSubmitError("لطفاً یه آدرس انتخاب کنید.");
      return;
    }
    const shippingOption = selectedShippingIndex !== null ? shippingOptions?.[selectedShippingIndex] : null;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await ordersAPI.create({
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_address_id: selectedAddressId,
        shipping_carrier: shippingOption?.carrier,
        shipping_service_name: shippingOption?.service_name,
        coupon_code: couponCode || undefined,
        referral_code: referralCode || undefined,
        customer_note: customerNote || undefined,
      });

      clearCart();
      const orderId = res.data.order?.id;
      router.push(orderId ? `/account/orders?created=${orderId}` : "/account/orders?created=1");
    } catch (err: any) {
      const errors: Record<string, string[]> | undefined = err?.response?.data?.errors;
      const firstFieldError = errors ? Object.values(errors)[0]?.[0] : undefined;

      setSubmitError(err?.response?.data?.message || firstFieldError || "ثبت سفارش ناموفق بود.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || authLoading || !user || items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        تسویه‌حساب
      </Typography>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Box sx={{ flex: "2 1 400px", display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ bgcolor: "background.paper", borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>آدرس تحویل</Typography>
              <Button size="small" onClick={() => setAddressDialogOpen(true)}>
                افزودن آدرس جدید
              </Button>
            </Box>

            {addresses === null ? (
              <CircularProgress size={24} />
            ) : addresses.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                هنوز آدرسی ثبت نکردید. یه آدرس جدید اضافه کنید.
              </Typography>
            ) : (
              <RadioGroup
                value={selectedAddressId ? String(selectedAddressId) : ""}
                onChange={(e) => setSelectedAddressId(Number(e.target.value))}
              >
                {addresses.map((address) => (
                  <FormControlLabel
                    key={address.id}
                    value={String(address.id)}
                    control={<Radio />}
                    sx={{
                      alignItems: "flex-start",
                      border: "1px solid",
                      borderColor: selectedAddressId === address.id ? "primary.main" : "divider",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 1.5,
                      mr: 0,
                    }}
                    label={
                      <Box sx={{ pt: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {address.title || address.city} — {address.receiver_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {address.city}، {address.full_address}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {address.receiver_phone}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            )}
          </Box>

          {selectedAddressId && (
            <Box sx={{ bgcolor: "background.paper", borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", p: 3 }}>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>روش ارسال</Typography>

              {isLoadingShipping ? (
                <CircularProgress size={24} />
              ) : !shippingOptions || shippingOptions.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  روش ارسالی برای این آدرس پیدا نشد.
                </Typography>
              ) : (
                <RadioGroup
                  value={selectedShippingIndex !== null ? String(selectedShippingIndex) : ""}
                  onChange={(e) => setSelectedShippingIndex(Number(e.target.value))}
                >
                  {shippingOptions.map((option, idx) => (
                    <FormControlLabel
                      key={idx}
                      value={String(idx)}
                      control={<Radio />}
                      sx={{
                        border: "1px solid",
                        borderColor: selectedShippingIndex === idx ? "primary.main" : "divider",
                        borderRadius: 2,
                        p: 1.5,
                        mb: 1.5,
                        mr: 0,
                        width: "100%",
                      }}
                      label={
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {option.carrier} — {option.service_name}
                            </Typography>
                            {option.eta_days && (
                              <Typography variant="caption" color="text.secondary">
                                تحویل طی {option.eta_days} روز کاری
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatPrice(option.cost)}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              )}
            </Box>
          )}

          <Box sx={{ bgcolor: "background.paper", borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", p: 3 }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>کد تخفیف و معرف (اختیاری)</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <TextField
                label="کد تخفیف"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                size="small"
                sx={{ flex: "1 1 200px" }}
              />
              <TextField
                label="کد معرف"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                size="small"
                sx={{ flex: "1 1 200px" }}
              />
            </Box>
            <TextField
              label="توضیحات سفارش (اختیاری)"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </Box>

        <Box
          sx={{
            flex: "1 1 280px",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 3,
            position: "sticky",
            top: 90,
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 2 }}>خلاصه‌ی سفارش</Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              جمع جزء
            </Typography>
            <Typography variant="body2">{formatPrice(subtotal)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              هزینه‌ی ارسال
            </Typography>
            <Typography variant="body2">{shippingCost ? formatPrice(shippingCost) : "—"}</Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>مبلغ تقریبی</Typography>
            <Typography sx={{ fontWeight: 700 }}>{formatPrice(estimatedTotal)}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            کد تخفیف (در صورت وجود) روی مبلغ نهایی بعد از ثبت اعمال می‌شه.
          </Typography>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Button
            variant="contained"
            disableElevation
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedAddressId}
          >
            {isSubmitting ? "در حال ثبت..." : "ثبت نهایی سفارش"}
          </Button>
        </Box>
      </Box>

      <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>افزودن آدرس جدید</DialogTitle>
        <DialogContent>
          {addressErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addressErrors.general[0]}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="عنوان آدرس (مثلاً منزل، محل کار)"
              value={addressForm.title}
              onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="نام گیرنده"
              value={addressForm.receiver_name}
              onChange={(e) => setAddressForm({ ...addressForm, receiver_name: e.target.value })}
              error={!!addressErrors.receiver_name}
              helperText={addressErrors.receiver_name?.[0]}
              fullWidth
            />
            <TextField
              label="موبایل گیرنده"
              value={addressForm.receiver_phone}
              onChange={(e) => setAddressForm({ ...addressForm, receiver_phone: e.target.value })}
              error={!!addressErrors.receiver_phone}
              helperText={addressErrors.receiver_phone?.[0]}
              fullWidth
            />
            <TextField
              label="شهر"
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              error={!!addressErrors.city}
              helperText={addressErrors.city?.[0]}
              fullWidth
            />
            <TextField
              label="آدرس کامل"
              value={addressForm.full_address}
              onChange={(e) => setAddressForm({ ...addressForm, full_address: e.target.value })}
              error={!!addressErrors.full_address}
              helperText={addressErrors.full_address?.[0]}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="کد پستی (اختیاری)"
              value={addressForm.postal_code}
              onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button color="inherit" onClick={() => setAddressDialogOpen(false)} disabled={isSavingAddress}>
            انصراف
          </Button>
          <Button variant="contained" disableElevation onClick={handleSaveAddress} disabled={isSavingAddress}>
            {isSavingAddress ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}