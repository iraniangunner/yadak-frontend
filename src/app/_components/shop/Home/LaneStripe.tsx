import Box from "@mui/material/Box";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/LaneStripe.tsx
|--------------------------------------------------------------------------
| خط‌چینِ راهنمای جاده - امضای بصری مشترک بین Hero و TrustFeatures.
*/
export function LaneStripe({
  color = "#fff",
  opacity = 0.5,
  width = "100%",
}: {
  color?: string;
  opacity?: number;
  width?: string;
}) {
  return (
    <Box
      sx={{
        width,
        height: 2,
        backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 14px, transparent 14px 26px)`,
        opacity,
      }}
    />
  );
}
