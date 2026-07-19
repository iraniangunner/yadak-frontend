import Box from "@mui/material/Box";
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
      sx={{
        position: "relative",
        pt: { xs: 5, md: 7 },
        pb: { xs: 8, md: 11 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -120,
          insetInlineStart: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(30,58,138,0.08) 0%, transparent 70%)",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Box sx={{ textAlign: "center", maxWidth: 640, mx: "auto", mb: 5 }}>
          <Typography
            variant="overline"
            sx={{
              display: "inline-block",
              color: "accent.main",
              fontWeight: 800,
              letterSpacing: 3,
              mb: 2,
              px: 2,
              py: 0.5,
              borderRadius: 999,
              bgcolor: "rgba(249,115,22,0.08)",
            }}
          >
            یدکی · قطعات اصلی و گارانتی‌دار
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              lineHeight: 1.35,
              fontSize: { xs: "1.9rem", md: "2.7rem" },
              letterSpacing: "-0.02em",
            }}
          >
            سفرت رو ادامه بده،{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg, #F97316, #FB923C)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              قطعه‌ش
            </Box>{" "}
            رو داریم!
          </Typography>
        </Box>

        <Box sx={{ position: "relative", maxWidth: 640, mx: "auto" }}>
          <Box
            sx={{
              position: "relative",
              background:
                "linear-gradient(145deg, rgba(30,58,138,0.08), rgba(249,115,22,0.05))",
              border: "1px solid",
              borderColor: "rgba(30,58,138,0.08)",
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

            <Box
              sx={{
                width: { xs: 150, md: 200 },
                height: { xs: 150, md: 200 },
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <DirectionsCar
                sx={{ fontSize: { xs: 80, md: 110 }, color: "primary.main" }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              position: "absolute",
              top: 16,
              insetInlineEnd: { xs: 8, md: -24 },
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "rgba(30,58,138,0.12)",
              boxShadow: "0 8px 24px rgba(15,23,42,0.1)",
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

          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              insetInlineStart: { xs: 8, md: -24 },
              bgcolor: "primary.main",
              color: "#fff",
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(30,58,138,0.35)",
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
          insetInlineStart: 0,
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
