"use client";

import { useState } from "react";
import { Box, TextField, Button, Snackbar, Alert } from "@mui/material";
// import { newsletterAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/home/NewsletterForm.tsx
|--------------------------------------------------------------------------
| قبلاً این فرم کاملاً ساختگی بود (فقط toast نمایشی، بدون ذخیره‌سازی واقعی).
| الان به /newsletter/subscribe واقعی وصله.
*/

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
    //   const res = await newsletterAPI.subscribe(email);
    //   setToastMessage(res.data.message || "عضویت شما با موفقیت ثبت شد.");
    //   setToastSeverity("success");
    //   setEmail("");
    } catch (err: any) {
      setToastMessage(
        err?.response?.data?.errors?.email?.[0] || "ثبت عضویت ناموفق بود.",
      );
      setToastSeverity("error");
    } finally {
      setToastOpen(true);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 480,
          mx: "auto",
        }}
      >
        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="آدرس ایمیل شما"
          type="email"
          required
          size="small"
          sx={{
            flex: "1 1 220px",
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disableElevation
          color="secondary"
          sx={{ px: 4 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "..." : "ارسال"}
        </Button>
      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
      >
        <Alert severity={toastSeverity}>{toastMessage}</Alert>
      </Snackbar>
    </>
  );
}
