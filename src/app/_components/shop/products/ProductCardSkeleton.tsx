import { Card, CardContent, CardActions, Box, Skeleton } from "@mui/material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductCardSkeleton.tsx
|--------------------------------------------------------------------------
| ساختارش عیناً مطابق ProductCard واقعیه (تصویر، عنوان دوخطی، امتیاز
| هم‌سطح قیمت، وضعیت موجودی، دکمه) - تا موقع لود، اسکلتون واقعاً شبیه
| نتیجه‌ی نهایی باشه، نه یه مستطیل خام بی‌ربط.
*/

export function ProductCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.06)",
        boxShadow: "none",
      }}
    >
      <Skeleton variant="rectangular" height={190} animation="wave" />

      <CardContent sx={{ pb: 1.25, pt: 1.5 }}>
        <Skeleton variant="text" width="90%" height={20} animation="wave" />
        <Skeleton
          variant="text"
          width="60%"
          height={20}
          sx={{ mb: 1 }}
          animation="wave"
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Skeleton variant="text" width={70} height={20} animation="wave" />
          <Skeleton variant="text" width={60} height={24} animation="wave" />
        </Box>

        <Skeleton variant="rounded" width={60} height={20} animation="wave" />
      </CardContent>

      <CardActions sx={{ px: 1.75, pb: 1.75, pt: 0 }}>
        <Skeleton variant="rounded" width="100%" height={34} animation="wave" />
      </CardActions>
    </Card>
  );
}
