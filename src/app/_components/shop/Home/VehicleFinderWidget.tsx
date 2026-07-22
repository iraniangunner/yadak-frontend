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
} from "@mui/material";
import { ServerVehicle } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/home/VehicleFinderWidget.tsx
|--------------------------------------------------------------------------
| ⚠️ هماهنگ‌شده با معماری جدید: جدول Vehicle فقط منبع گزینه‌های
| دراپ‌داونه (برند/مدل واقعاً روی محصولات ثبت شدن، نه رابطه). با انتخاب
| برند+مدل، مستقیم می‌ره به /vehicle/[برند]?vehicle_model=مدل - همون
| صفحه‌ای که بخش کارتی «خرید بر اساس خودرو» هم بهش وصله.
*/

export function VehicleFinderWidget({
  vehicles,
}: {
  vehicles: ServerVehicle[];
}) {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

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
    if (!brand) return;
    const query = model ? `?vehicle_model=${encodeURIComponent(model)}` : "";
    router.push(`/vehicle/${encodeURIComponent(brand)}${query}`);
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
      <FormControl size="small" sx={{ flex: "1 1 180px" }}>
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

      <FormControl size="small" sx={{ flex: "1 1 180px" }} disabled={!brand}>
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
        disabled={!brand}
        sx={{ flex: "0 0 auto", px: 4 }}
      >
        جستجوی قطعات
      </Button>
    </Box>
  );
}
