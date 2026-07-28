import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/StaticCategoryBanners.tsx
|--------------------------------------------------------------------------
| ۴ تا بنر تبلیغاتی استاتیک (نه از پنل ادمین) - عکس + متن دوخطی + لینک،
| دقیقاً مثل ردیف «انواع شمع و سوزن»، «انواع کمک فنر»... توی سایت مرجع.
|
| ⚠️ برای اضافه/ویرایش/حذف یه بنر، فقط همین آرایه‌ی BANNERS رو دستکاری
| کنید - بقیه‌ی فایل خودکار باهاش کار می‌کنه.
*/

const BANNERS = [
  {
    image: "/banners/spark-plug.webp",
    line1: "انواع",
    line2: "شمع و سوزن",
    href: "/category/شمع-موتور", 
  },
  {
    image: "/banners/dumper.webp",
    line1: "انواع کمک فنر",
    line2: "مناسب خودروهای داخلی و خارجی",
    href: "/category/کمک-فنر",
  },
  {
    image: "/banners/car-motor-oil.webp",
    line1: "انواع روغن موتور",
    line2: "خودروهای داخلی و خارجی",
    href: "/category/روغن-موتور",
  },
  {
    image: "/banners/filter.webp",
    line1: "انواع فیلتر هوای",
    line2: "موتور خودرو",
    href: "/category/فیلتر-هوا-موتور",
  },
];

export function StaticCategoryBanners() {
  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        {BANNERS.map((banner) => (
          <Box
            key={banner.href}
            component={NextLink}
            href={banner.href}
            sx={{
              position: "relative",
              display: "block",
              textDecoration: "none",
              borderRadius: 3,
              overflow: "hidden",
              aspectRatio: "4 / 3",
              transition: "transform .2s",
              "&:hover": { transform: "translateY(-3px)" },
            }}
          >
            <Box
              component="img"
              src={banner.image}
              alt={`${banner.line1} ${banner.line2}`}
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.25) 55%, transparent 100%)",
              }}
            />
            <Box
              sx={{
                position: "relative",
                height: "100%",
                display: "flex",
                alignItems: "flex-start",
                p: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{ color: "#fff", fontWeight: 500, fontSize: "0.85rem" }}
                >
                  {banner.line1}
                </Typography>
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    lineHeight: 1.4,
                  }}
                >
                  {banner.line2}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
