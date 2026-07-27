"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
} from "@mui/material";
import { ServerVehicle } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/home/VehicleFinderWidget.tsx
|--------------------------------------------------------------------------
| ⚠️ توی موبایل، دکمه‌ی «جستجوی قطعات» به‌صورت تمام‌عرض و بزرگ زیرِ هردو
| دراپ‌داون میاد (نه کنارشون) - چون فضای کافی برای هم‌ردیف بودن نیست.
| موقع کلیک هم یه لودینگ نشون داده می‌شه تا ناوبری کامل بشه.
*/

export function VehicleFinderWidget({
  vehicles,
}: {
  vehicles: ServerVehicle[];
}) {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const brands = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.brand))),
    [vehicles]
  );
  const modelsForBrand = useMemo(
    () =>
      Array.from(
        new Set(vehicles.filter((v) => v.brand === brand).map((v) => v.model))
      ),
    [vehicles, brand]
  );

  const handleSearch = () => {
    if (!brand || isSearching) return;
    setIsSearching(true);

    if (model) {
      router.push(`/vehicle/${encodeURIComponent(`لوازم-یدکی-${model}`)}`);
    } else {
      router.push(`/vehicle/${encodeURIComponent(brand)}`);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 4,
        p: { xs: 2, sm: 2.5 },
        display: "flex",
        flexWrap: "wrap",
        gap: 1.5,
        alignItems: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      }}
    >
      <FormControl
        size="small"
        sx={{ flex: { xs: "1 1 100%", sm: "1 1 180px" } }}
        disabled={isSearching}
      >
        <InputLabel>برند خودرو</InputLabel>
        <Select
          label="برند خودرو"
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setModel("");
          }}
        >
          {brands.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{ flex: { xs: "1 1 100%", sm: "1 1 180px" } }}
        disabled={!brand || isSearching}
      >
        <InputLabel>مدل (اختیاری)</InputLabel>
        <Select
          label="مدل (اختیاری)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <MenuItem value="">همه‌ی مدل‌ها</MenuItem>
          {modelsForBrand.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        disableElevation
        size="large"
        onClick={handleSearch}
        disabled={!brand || isSearching}
        startIcon={
          isSearching ? (
            <CircularProgress size={18} color="inherit" />
          ) : undefined
        }
        sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" }, px: 4 }}
      >
        {isSearching ? "در حال انتقال..." : "جستجوی قطعات"}
      </Button>
    </Box>
  );
}
