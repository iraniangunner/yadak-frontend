"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add, Delete, DirectionsCar } from "@mui/icons-material";
import { myVehiclesAPI, vehiclesAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/account/_components/VehiclesContent.tsx
|--------------------------------------------------------------------------
| بر اساس ساختار واقعی بک‌اند:
| - Vehicle model: brand, model, generation, year_from, year_to (نه name)
| - GET  /my-vehicles   → { vehicles: [...] }   (نه { data: [...] })
| - POST /my-vehicles   → { message, vehicles: [...] }
| - GET  /vehicles      → پاگینیشن استاندارد لاراول → { data: [...] }
*/

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  generation: string | null;
  year_from: number | null;
  year_to: number | null;
};

function vehicleLabel(vehicle: Vehicle): string {
  let label = `${vehicle.brand} ${vehicle.model}`;
  if (vehicle.generation) label += ` (${vehicle.generation})`;
  if (vehicle.year_from || vehicle.year_to) {
    label += ` - ${vehicle.year_from ?? "?"} تا ${vehicle.year_to ?? "?"}`;
  }
  return label;
}

export function VehiclesContent() {
  const [myVehicles, setMyVehicles] = useState<Vehicle[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [options, setOptions] = useState<Vehicle[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadMyVehicles = () => {
    myVehiclesAPI.list().then((res) => setMyVehicles(res.data.vehicles));
  };

  useEffect(() => {
    loadMyVehicles();
  }, []);

  const handleSearch = (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }
    setSearchLoading(true);
    vehiclesAPI
      .list({ search: query })
      .then((res) => setOptions(res.data.data))
      .finally(() => setSearchLoading(false));
  };

  const openDialog = () => {
    setSelected(null);
    setOptions([]);
    setError("");
    setDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!selected) return;

    setIsSaving(true);
    setError("");

    try {
      await myVehiclesAPI.add(selected.id);
      setDialogOpen(false);
      loadMyVehicles();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در افزودن خودرو.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (vehicleId: number) => {
    if (!confirm("این خودرو از لیست شما حذف بشه؟")) return;
    await myVehiclesAPI.remove(vehicleId);
    loadMyVehicles();
  };

  if (myVehicles === null) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          خودروهای من
        </Typography>
        <Button variant="contained" disableElevation startIcon={<Add />} onClick={openDialog}>
          افزودن خودرو
        </Button>
      </Stack>

      {myVehicles.length === 0 ? (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            p: 5,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            هنوز خودرویی به حساب خود اضافه نکرده‌اید
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {myVehicles.map((vehicle) => (
            <Box
              key={vehicle.id}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <DirectionsCar color="action" />
                <Typography sx={{ fontWeight: 600 }}>{vehicleLabel(vehicle)}</Typography>
              </Stack>

              <IconButton size="small" onClick={() => handleRemove(vehicle.id)}>
                <Delete fontSize="small" color="error" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>افزودن خودرو</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Autocomplete
            options={options}
            loading={searchLoading}
            getOptionLabel={vehicleLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selected}
            onChange={(_, newValue) => setSelected(newValue)}
            onInputChange={(_, newInput) => handleSearch(newInput)}
            noOptionsText="خودرویی پیدا نشد"
            sx={{ mt: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="جستجوی خودرو (برند یا مدل)"
                placeholder="مثلاً پژو، 206..."
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading && <CircularProgress size={18} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)} disabled={isSaving}>
            انصراف
          </Button>
          <Button variant="contained" disableElevation onClick={handleAdd} disabled={isSaving || !selected}>
            {isSaving ? "در حال افزودن..." : "افزودن"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}