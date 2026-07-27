"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Avatar,
  Autocomplete,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  DirectionsCar,
} from "@mui/icons-material";
import { adminAPI, vehiclesAPI, vehicleBrandsAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminVehiclesContent.tsx
|--------------------------------------------------------------------------
| ⚠️ یکپارچه‌شده - قبلاً «برندهای خودرو» و «خودروها» دو تا صفحه‌ی جدا
| بودن؛ الان همه‌چیز اینجاست. هر برند یه آکاردئونه: هدرش لوگو+اسم+
| ویرایش/حذف برند، بدنه‌ش جدول مدل‌های همون برند (با افزودن/ویرایش/حذف).
|
| دیتابیس دست‌نخورده موند (vehicle_brands برای عکس، vehicles برای
| برند+مدل+تیپ) - فقط UI یکی شد.
*/

type VehicleBrand = {
  id: number;
  name: string;
  thumbnail_url: string | null;
  is_active: boolean;
};
type Vehicle = {
  id: number;
  vehicle_brand_id: number;
  brand: string; // محاسبه‌شده از رابطه‌ی vehicleBrand، سازگاری با کدهای قدیمی
  model: string;
  thumbnail_url: string | null;
  generation: string[] | null;
  year_from: number | null;
  year_to: number | null;
  is_active: boolean;
};

const emptyBrandForm = { name: "", is_active: true };
const emptyVehicleForm = {
  model: "",
  generation: [] as string[],
  year_from: "",
  year_to: "",
  is_active: true,
};

export function AdminVehiclesContent() {
  const [brands, setBrands] = useState<VehicleBrand[] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);

  // --- دیالوگ برند ---
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [brandForm, setBrandForm] = useState(emptyBrandForm);
  const [brandThumbnailFile, setBrandThumbnailFile] = useState<File | null>(
    null
  );
  const [brandErrors, setBrandErrors] = useState<Record<string, string[]>>({});
  const [isSavingBrand, setIsSavingBrand] = useState(false);

  // --- دیالوگ مدل (خودرو) ---
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [vehicleDialogBrandId, setVehicleDialogBrandId] = useState<
    number | null
  >(null);
  const [vehicleDialogBrandName, setVehicleDialogBrandName] =
    useState<string>("");
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);
  const [vehicleThumbnailFile, setVehicleThumbnailFile] = useState<File | null>(
    null
  );
  const [existingVehicleThumbnailUrl, setExistingVehicleThumbnailUrl] =
    useState<string | null>(null);
  const [vehicleErrors, setVehicleErrors] = useState<Record<string, string[]>>(
    {}
  );
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);

  const loadAll = () => {
    setBrands(null);
    setVehicles(null);
    vehicleBrandsAPI
      .adminList({ per_page: 200 })
      .then((res) => setBrands(res.data.data));
    vehiclesAPI
      .list({ with_inactive: true, per_page: 500 } as any)
      .then((res) => setVehicles(res.data.data));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const vehiclesByBrand = useMemo(() => {
    const map = new Map<string, Vehicle[]>();
    (vehicles || []).forEach((v) => {
      if (!map.has(v.brand)) map.set(v.brand, []);
      map.get(v.brand)!.push(v);
    });
    return map;
  }, [vehicles]);

  const thumbnailPreviewUrl = useMemo(() => {
    if (brandThumbnailFile) return URL.createObjectURL(brandThumbnailFile);
    if (editingBrandId)
      return (
        brands?.find((b) => b.id === editingBrandId)?.thumbnail_url || null
      );
    return null;
  }, [brandThumbnailFile, editingBrandId, brands]);

  const vehicleThumbnailPreviewUrl = useMemo(() => {
    if (vehicleThumbnailFile) return URL.createObjectURL(vehicleThumbnailFile);
    return existingVehicleThumbnailUrl;
  }, [vehicleThumbnailFile, existingVehicleThumbnailUrl]);

  // ------------------------------------------------------------------
  // برند
  // ------------------------------------------------------------------

  const openCreateBrandDialog = () => {
    setEditingBrandId(null);
    setBrandForm(emptyBrandForm);
    setBrandThumbnailFile(null);
    setBrandErrors({});
    setBrandDialogOpen(true);
  };

  const openEditBrandDialog = (brand: VehicleBrand) => {
    setEditingBrandId(brand.id);
    setBrandForm({ name: brand.name, is_active: brand.is_active });
    setBrandThumbnailFile(null);
    setBrandErrors({});
    setBrandDialogOpen(true);
  };

  const handleSaveBrand = async () => {
    setIsSavingBrand(true);
    setBrandErrors({});

    const fd = new FormData();
    fd.append("name", brandForm.name);
    fd.append("is_active", brandForm.is_active ? "1" : "0");
    if (brandThumbnailFile) fd.append("thumbnail", brandThumbnailFile);

    try {
      if (editingBrandId) {
        await adminAPI.vehicleBrands.update(editingBrandId, fd);
      } else {
        await adminAPI.vehicleBrands.create(fd);
      }
      setBrandDialogOpen(false);
      loadAll();
    } catch (err: any) {
      setBrandErrors(
        err?.response?.data?.errors || {
          general: ["خطا در ذخیره‌ی برند خودرو."],
        }
      );
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleDeleteBrand = async (id: number, name: string) => {
    const hasModels = (vehiclesByBrand.get(name) || []).length > 0;
    const msg = hasModels
      ? `این برند مدل‌های ثبت‌شده داره. اگه حذفش کنید، اون مدل‌ها بی‌برند نمی‌شن ولی دیگه توی این لیست گروه‌بندی نمی‌شن. ادامه بدم؟`
      : "این برند خودرو حذف بشه؟";
    if (!confirm(msg)) return;
    await adminAPI.vehicleBrands.delete(id);
    loadAll();
  };

  // ------------------------------------------------------------------
  // مدل (خودرو)
  // ------------------------------------------------------------------

  const openCreateVehicleDialog = (brandId: number, brandName: string) => {
    setVehicleDialogBrandId(brandId);
    setVehicleDialogBrandName(brandName);
    setEditingVehicleId(null);
    setVehicleForm(emptyVehicleForm);
    setVehicleThumbnailFile(null);
    setExistingVehicleThumbnailUrl(null);
    setVehicleErrors({});
    setVehicleDialogOpen(true);
  };

  const openEditVehicleDialog = (vehicle: Vehicle) => {
    setVehicleDialogBrandId(vehicle.vehicle_brand_id);
    setVehicleDialogBrandName(vehicle.brand);
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      model: vehicle.model,
      generation: vehicle.generation || [],
      year_from: vehicle.year_from ? String(vehicle.year_from) : "",
      year_to: vehicle.year_to ? String(vehicle.year_to) : "",
      is_active: vehicle.is_active,
    });
    setVehicleThumbnailFile(null);
    setExistingVehicleThumbnailUrl(vehicle.thumbnail_url);
    setVehicleErrors({});
    setVehicleDialogOpen(true);
  };

  const handleSaveVehicle = async () => {
    setIsSavingVehicle(true);
    setVehicleErrors({});

    const fd = new FormData();
    fd.append("vehicle_brand_id", String(vehicleDialogBrandId));
    fd.append("model", vehicleForm.model);
    vehicleForm.generation.forEach((g) => fd.append("generation[]", g));
    if (vehicleForm.year_from) fd.append("year_from", vehicleForm.year_from);
    if (vehicleForm.year_to) fd.append("year_to", vehicleForm.year_to);
    fd.append("is_active", vehicleForm.is_active ? "1" : "0");
    if (vehicleThumbnailFile) fd.append("thumbnail", vehicleThumbnailFile);

    try {
      if (editingVehicleId) {
        await adminAPI.vehicles.update(editingVehicleId, fd);
      } else {
        await adminAPI.vehicles.create(fd);
      }
      setVehicleDialogOpen(false);
      loadAll();
    } catch (err: any) {
      setVehicleErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی مدل."] }
      );
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm("این مدل حذف بشه؟")) return;
    await adminAPI.vehicles.delete(id);
    loadAll();
  };

  if (brands === null || vehicles === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          خودروها (برندها و مدل‌ها)
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateBrandDialog}
        >
          افزودن برند خودرو
        </Button>
      </Box>

      {brands.length === 0 ? (
        <Alert severity="info">
          هنوز هیچ برند خودرویی نساختید. با دکمه‌ی بالا شروع کنید.
        </Alert>
      ) : (
        brands.map((brand) => {
          const models = vehiclesByBrand.get(brand.name) || [];

          return (
            <Accordion
              key={brand.id}
              sx={{ mb: 1, borderRadius: 2, "&:before": { display: "none" } }}
              variant="outlined"
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                    pr: 1,
                  }}
                >
                  <Avatar
                    variant="rounded"
                    src={brand.thumbnail_url || undefined}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "background.default",
                    }}
                  >
                    <DirectionsCar fontSize="small" />
                  </Avatar>
                  <Typography sx={{ fontWeight: 700, flex: 1 }}>
                    {brand.name}
                  </Typography>
                  <Chip label={`${models.length} مدل`} size="small" />
                  <Chip
                    label={brand.is_active ? "فعال" : "غیرفعال"}
                    color={brand.is_active ? "success" : "default"}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditBrandDialog(brand);
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBrand(brand.id, brand.name);
                    }}
                  >
                    <Delete fontSize="small" color="error" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}
                >
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() =>
                      openCreateVehicleDialog(brand.id, brand.name)
                    }
                  >
                    افزودن مدل برای {brand.name}
                  </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>مدل</TableCell>
                        <TableCell>تیپ/نسل</TableCell>
                        <TableCell>بازه‌ی سال</TableCell>
                        <TableCell>وضعیت</TableCell>
                        <TableCell align="center">عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {models.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body2" color="text.secondary">
                              هنوز مدلی برای این برند ثبت نشده
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        models.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell>
                              <Avatar
                                variant="rounded"
                                src={vehicle.thumbnail_url || undefined}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: "background.default",
                                }}
                              >
                                <DirectionsCar fontSize="small" />
                              </Avatar>
                            </TableCell>
                            <TableCell>{vehicle.model}</TableCell>
                            <TableCell>
                              {vehicle.generation &&
                              vehicle.generation.length > 0
                                ? vehicle.generation.join("، ")
                                : "—"}
                            </TableCell>
                            <TableCell>
                              {vehicle.year_from || vehicle.year_to
                                ? `${vehicle.year_from ?? "?"} تا ${
                                    vehicle.year_to ?? "?"
                                  }`
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={vehicle.is_active ? "فعال" : "غیرفعال"}
                                color={
                                  vehicle.is_active ? "success" : "default"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => openEditVehicleDialog(vehicle)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                              >
                                <Delete fontSize="small" color="error" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

      {/* دیالوگ برند */}
      <Dialog
        open={brandDialogOpen}
        onClose={() => setBrandDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingBrandId ? "ویرایش برند خودرو" : "افزودن برند خودرو"}
        </DialogTitle>
        <DialogContent>
          {brandErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {brandErrors.general[0]}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="نام برند (مثلاً پژو، هیوندای)"
              value={brandForm.name}
              onChange={(e) =>
                setBrandForm({ ...brandForm, name: e.target.value })
              }
              error={!!brandErrors.name}
              helperText={brandErrors.name?.[0]}
              fullWidth
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {thumbnailPreviewUrl && (
                <Avatar
                  variant="rounded"
                  src={thumbnailPreviewUrl}
                  sx={{ width: 56, height: 56, bgcolor: "background.default" }}
                >
                  <DirectionsCar fontSize="small" />
                </Avatar>
              )}
              <Button variant="outlined" component="label">
                {brandThumbnailFile
                  ? brandThumbnailFile.name
                  : editingBrandId
                  ? "تعویض لوگو"
                  : "انتخاب لوگو"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setBrandThumbnailFile(e.target.files?.[0] || null)
                  }
                />
              </Button>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={brandForm.is_active}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, is_active: e.target.checked })
                  }
                />
              }
              label="فعال"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            color="inherit"
            onClick={() => setBrandDialogOpen(false)}
            disabled={isSavingBrand}
          >
            انصراف
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSaveBrand}
            disabled={isSavingBrand}
          >
            {isSavingBrand ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* دیالوگ مدل */}
      <Dialog
        open={vehicleDialogOpen}
        onClose={() => setVehicleDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingVehicleId ? "ویرایش مدل" : "افزودن مدل"} —{" "}
          {vehicleDialogBrandName}
        </DialogTitle>
        <DialogContent>
          {vehicleErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {vehicleErrors.general[0]}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="مدل"
              value={vehicleForm.model}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, model: e.target.value })
              }
              error={!!vehicleErrors.model}
              helperText={vehicleErrors.model?.[0]}
              fullWidth
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={vehicleForm.generation}
              onChange={(_, newValue) =>
                setVehicleForm({
                  ...vehicleForm,
                  generation: newValue as string[],
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="نسل/تیپ (اختیاری، چندتایی)"
                  placeholder="تایپ کنید و Enter بزنید..."
                />
              )}
              fullWidth
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {vehicleThumbnailPreviewUrl && (
                <Avatar
                  variant="rounded"
                  src={vehicleThumbnailPreviewUrl}
                  sx={{ width: 56, height: 56, bgcolor: "background.default" }}
                >
                  <DirectionsCar fontSize="small" />
                </Avatar>
              )}
              <Button variant="outlined" component="label">
                {vehicleThumbnailFile
                  ? vehicleThumbnailFile.name
                  : editingVehicleId
                  ? "تعویض عکس مدل"
                  : "انتخاب عکس مدل (اختیاری)"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setVehicleThumbnailFile(e.target.files?.[0] || null)
                  }
                />
              </Button>
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="سال شروع تولید (اختیاری)"
                type="number"
                value={vehicleForm.year_from}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, year_from: e.target.value })
                }
                error={!!vehicleErrors.year_from}
                helperText={vehicleErrors.year_from?.[0]}
                sx={{ flex: "1 1 180px" }}
              />
              <TextField
                label="سال پایان تولید (اختیاری)"
                type="number"
                value={vehicleForm.year_to}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, year_to: e.target.value })
                }
                error={!!vehicleErrors.year_to}
                helperText={vehicleErrors.year_to?.[0]}
                sx={{ flex: "1 1 180px" }}
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={vehicleForm.is_active}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      is_active: e.target.checked,
                    })
                  }
                />
              }
              label="فعال"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            color="inherit"
            onClick={() => setVehicleDialogOpen(false)}
            disabled={isSavingVehicle}
          >
            انصراف
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSaveVehicle}
            disabled={isSavingVehicle}
          >
            {isSavingVehicle ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
