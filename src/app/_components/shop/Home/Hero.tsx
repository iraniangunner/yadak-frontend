import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { DirectionsCar, VerifiedUser } from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/Hero.tsx
|--------------------------------------------------------------------------
*/
export function Hero({ productCount }: { productCount: number }) {
  return (
    <Box
      sx={{ position: "relative", pt: { xs: 4, md: 6 }, pb: { xs: 8, md: 10 } }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", maxWidth: 640, mx: "auto", mb: 5 }}>
          <Typography
            variant="overline"
            sx={{
              display: "block",
              color: "accent.main",
              fontWeight: 700,
              letterSpacing: 2,
              mb: 1.5,
            }}
          >
            یدکی · قطعات اصلی و گارانتی‌دار
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: "1.7rem", md: "2.4rem" },
            }}
          >
            سفرت رو ادامه بده،{" "}
            <Box component="span" sx={{ color: "accent.main" }}>
              قطعه‌ش
            </Box>{" "}
            رو داریم!
          </Typography>
          <Button
            component={NextLink}
            href="/products"
            variant="contained"
            disableElevation
            size="large"
            sx={{ px: 4 }}
          >
            مشاهده‌ی محصولات
          </Button>
        </Box>

        {/* پنل بصری هیرو - خط راهنمای جاده */}
        <Box sx={{ position: "relative", maxWidth: 640, mx: "auto" }}>
          <Box
            sx={{
              position: "relative",
              bgcolor: "rgba(30,58,138,0.06)",
              borderRadius: 6,
              py: 8,
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 500 200"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <path
                d="M -20 160 Q 150 40 250 100 T 520 60"
                fill="none"
                stroke="#1E3A8A"
                strokeOpacity="0.18"
                strokeWidth="3"
                strokeDasharray="14 12"
                strokeLinecap="round"
              />
            </Box>
            <DirectionsCar
              sx={{
                fontSize: { xs: 90, md: 130 },
                color: "primary.main",
                position: "relative",
              }}
            />
          </Box>

          {/* پلاک - اصالت کالا */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: { xs: 8, md: -24 },
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "rgba(30,58,138,0.12)",
              boxShadow: "0 6px 20px rgba(15,23,42,0.08)",
              px: 1.75,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <VerifiedUser sx={{ color: "success.main", fontSize: 20 }} />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 800, lineHeight: 1 }}
              >
                اصالت کالا
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  color: "text.secondary",
                  letterSpacing: 0.5,
                }}
              >
                تضمین‌شده
              </Typography>
            </Box>
          </Box>

          {/* پلاک - تعداد محصول */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: { xs: 8, md: -24 },
              bgcolor: "primary.main",
              color: "#fff",
              borderRadius: 2,
              boxShadow: "0 6px 20px rgba(30,58,138,0.35)",
              px: 2.25,
              py: 1.1,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, lineHeight: 1, fontFamily: "monospace" }}
            >
              {productCount.toLocaleString("fa-IR")}+
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              محصول متنوع
            </Typography>
          </Box>
        </Box>
      </Container>

      <Box
        component="svg"
        viewBox="0 0 1440 80"
        sx={{
          position: "absolute",
          bottom: -1,
          left: 0,
          width: "100%",
          height: 60,
          display: "block",
        }}
      >
        <path
          fill="#1E3A8A"
          fillOpacity="0.06"
          d="M0,40 C360,90 1080,0 1440,40 L1440,80 L0,80 Z"
        />
      </Box>
    </Box>
  );
}
