import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VerifiedIcon from "@mui/icons-material/Verified";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import type { getVehicles } from "@/lib/serverApi";
import { VehicleFinderWidget } from "./VehicleFinderWidget";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/VehicleFinderSection.tsx
|--------------------------------------------------------------------------
| «جستجو بر اساس خودرو» - بدون پس‌زمینه‌ی رنگی (شفاف، هم‌رنگ خودِ صفحه):
| عنوان، فرم یک‌ردیفه‌ی برند/مدل/جستجو، و زیرش ۴ تا آیکون ویژگی.
*/
type Vehicle = Awaited<ReturnType<typeof getVehicles>>[number];

const features = [
  {
    icon: LocalShippingIcon,
    title: "ارسال سریع",
    subtitle: "ارسال به سراسر ایران",
  },
  { icon: SupportAgentIcon, title: "پشتیبانی", subtitle: "پاسخگویی همه‌روزه" },
  { icon: VerifiedIcon, title: "اصالت کالا", subtitle: "تضمین کیفیت و اصالت" },
  {
    icon: AssignmentReturnIcon,
    title: "ضمانت بازگشت",
    subtitle: "تا ۷ روز پس از خرید",
  },
];

export function VehicleFinderSection({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <Box sx={{ py: { xs: 3, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2.5,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          جستجو بر اساس خودرو
        </Typography>

        <VehicleFinderWidget vehicles={vehicles} />

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            mt: 3.5,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {features.map(({ icon: Icon, title, subtitle }) => (
            <Box
              key={title}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                flex: "1 1 200px",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "rgba(249,115,22,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ color: "accent.main", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, lineHeight: 1.3 }}
                >
                  {title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
