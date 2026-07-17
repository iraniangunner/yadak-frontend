import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import {
  VerifiedUser,
  LocalShipping,
  Build,
  AssignmentReturn,
} from "@mui/icons-material";
import { LaneStripe } from "./LaneStripe";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/TrustFeatures.tsx
|--------------------------------------------------------------------------
*/
const features = [
  { icon: <VerifiedUser />, label: "ضمانت اصالت کالا" },
  { icon: <LocalShipping />, label: "ارسال سریع به سراسر کشور" },
  { icon: <Build />, label: "پشتیبانی فنی تخصصی" },
  { icon: <AssignmentReturn />, label: "امکان مرجوعی و بازگشت کالا" },
];

export function TrustFeatures() {
  return (
    <Box sx={{ bgcolor: "#12172B", py: { xs: 6, md: 8 }, mt: 2 }}>
      <Container maxWidth="lg">
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: 22,
              left: "12%",
              right: "12%",
              display: { xs: "none", md: "block" },
            }}
          >
            <LaneStripe color="#F97316" opacity={0.4} />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {features.map((f) => (
              <Box
                key={f.label}
                sx={{ flex: "1 1 200px", maxWidth: 220, position: "relative" }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    mx: "auto",
                    mb: 1.5,
                    borderRadius: "50%",
                    bgcolor: "#1C2333",
                    border: "1px solid rgba(249,115,22,0.35)",
                    color: "accent.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {f.icon}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {f.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
