import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  VerifiedUser,
  LocalShipping,
  SupportAgent,
  Inventory,
} from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/about/page.tsx
|--------------------------------------------------------------------------
*/

export const metadata = {
  title: "درباره‌ی ما | یدکی",
};

const features = [
  {
    icon: VerifiedUser,
    title: "اصالت کالا",
    desc: "همه‌ی قطعات دارای گارانتی اصالت و سلامت فیزیکی هستن.",
  },
  {
    icon: LocalShipping,
    title: "ارسال سریع",
    desc: "ارسال به سراسر کشور با همکاری شرکت‌های حمل معتبر.",
  },
  {
    icon: SupportAgent,
    title: "پشتیبانی واقعی",
    desc: "تیم پشتیبانی ما قبل و بعد از خرید همراهتونه.",
  },
  {
    icon: Inventory,
    title: "تنوع قطعات",
    desc: "قطعات متنوع برای اکثر خودروهای رایج داخلی و خارجی.",
  },
];

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="overline"
          sx={{
            display: "inline-block",
            color: "accent.main",
            fontWeight: 800,
            letterSpacing: 2,
            mb: 1.5,
            px: 2,
            py: 0.5,
            borderRadius: 999,
            bgcolor: "rgba(249,115,22,0.08)",
          }}
        >
          یدکی
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: "1.6rem", md: "2.1rem" },
          }}
        >
          فروشگاه تخصصی قطعات یدکی خودرو
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 560, mx: "auto", lineHeight: 2 }}
        >
          یدکی با هدف ساده‌کردن مسیر پیدا کردن قطعه‌ی درست برای خودروی شما
          راه‌اندازی شده. ما تلاش می‌کنیم بدون نیاز به دانش فنی خاص، بتونید سریع
          و مطمئن قطعه‌ی مناسب خودروتون رو پیدا کنید، سفارش بدید، و با خیال راحت
          تحویل بگیرید.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2.5,
          mb: 6,
        }}
      >
        {features.map((f) => (
          <Box
            key={f.title}
            sx={{
              display: "flex",
              gap: 2,
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "rgba(30,58,138,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <f.icon sx={{ color: "primary.main" }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                {f.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {f.desc}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          bgcolor: "primary.main",
          color: "#fff",
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          سؤالی دارید یا به کمک نیاز دارید؟
        </Typography>
        <Typography sx={{ opacity: 0.9, mb: 3 }}>
          تیم پشتیبانی ما آماده‌ی کمک به شماست.
        </Typography>
        <Box
          component="a"
          href="/contact"
          sx={{
            display: "inline-block",
            bgcolor: "#fff",
            color: "primary.main",
            fontWeight: 700,
            px: 3,
            py: 1.25,
            borderRadius: 999,
            textDecoration: "none",
          }}
        >
          تماس با ما
        </Box>
      </Box>
    </Container>
  );
}
