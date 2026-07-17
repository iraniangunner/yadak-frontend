import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { LaneStripe } from "./LaneStripe";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/IntroText.tsx
|--------------------------------------------------------------------------
*/
export function IntroText() {
  return (
    <Container maxWidth="md" sx={{ pb: 6, textAlign: "center" }}>
      <LaneStripe color="#1E3A8A" opacity={0.15} width="72px" />
      <Box sx={{ display: "inline-block", mt: 2 }} />
      <Typography color="text.secondary" sx={{ lineHeight: 2.1 }}>
        «یدکی» فروشگاه اینترنتی تخصصی قطعات یدکی خودروئه که باور داریم هر
        خودرویی که سالم و ایمن نگه داشته بشه، تجربه‌ی رانندگی رو به یه لذت واقعی
        تبدیل می‌کنه. به همین دلیل بهترین و باکیفیت‌ترین قطعات اصلی و
        گارانتی‌دار رو براتون فراهم کردیم؛ از قطعات موتوری سبک تا سیستم‌های ترمز
        پرحجم، همه‌چیز آماده‌ست تا با خیال راحت جاده رو زیر چرخ‌هاتون بذارید.
      </Typography>
    </Container>
  );
}
