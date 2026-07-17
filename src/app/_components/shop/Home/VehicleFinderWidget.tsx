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
import { Search } from "@mui/icons-material";
import { ServerVehicle } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/VehicleFinderWidget.tsx
|--------------------------------------------------------------------------
| لیست خودروها از سرور (SSR) میاد، فقط منطق انتخاب/جستجو کلاینتیه.
*/
function vehicleLabel(v: ServerVehicle) {
  let label = v.model;
  if (v.generation) label += ` (${v.generation})`;
  return label;
}

export function VehicleFinderWidget({
  vehicles,
}: {
  vehicles: ServerVehicle[];
}) {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const brands = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.brand))),
    [vehicles],
  );
  const modelsForBrand = useMemo(
    () => vehicles.filter((v) => v.brand === brand),
    [vehicles, brand],
  );

  const handleSearch = () => {
    if (vehicleId) router.push(`/products?vehicle_id=${vehicleId}`);
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
        boxShadow: "0 10px 30px rgba(15,23,42,0.18)",
      }}
    >
      <FormControl size="small" sx={{ flex: "1 1 180px" }}>
        <InputLabel>برند خودرو</InputLabel>
        <Select
          label="برند خودرو"
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setVehicleId("");
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
        <InputLabel>مدل</InputLabel>
        <Select
          label="مدل"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        >
          {modelsForBrand.map((v) => (
            <MenuItem key={v.id} value={String(v.id)}>
              {vehicleLabel(v)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        disableElevation
        size="large"
        onClick={handleSearch}
        disabled={!vehicleId}
        startIcon={<Search />}
        sx={{ flex: "0 0 auto", px: 4 }}
      >
        جستجوی قطعات
      </Button>
    </Box>
  );
}
