"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Alert,
  Avatar,
  Tabs,
  Tab,
  Autocomplete,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Inventory as InventoryIcon,
  Close,
} from "@mui/icons-material";
import {
  adminAPI,
  brandsAPI,
  categoriesAPI,
  vehiclesAPI,
  productsAPI,
} from "@/lib/api";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminProductsContent.tsx
|--------------------------------------------------------------------------
| تب «خودروهای سازگار» اضافه شد. برخلاف گالری/قیمت‌پلکانی/ویژگی‌ها (که
| endpoint جدای خودشون رو دارن)، vehicle_ids از قبل روی خودِ
| update() محصول پشتیبانی می‌شه - برای همین این تب یه دکمه‌ی «ذخیره»ی
| مستقل داره که مستقیم adminAPI.products.update رو با vehicle_ids صدا
| می‌زنه.
*/

const stockStatusLabels: Record<
  string,
  { label: string; color: "success" | "error" | "warning" | "info" }
> = {
  available: { label: "موجود", color: "success" },
  stopped: { label: "متوقف‌شده", color: "warning" },
  out_of_stock: { label: "ناموجود", color: "error" },
  incoming: { label: "در حال تأمین", color: "info" },
};

type Product = {
  id: number;
  title: string;
  sku: string;
  price: number;
  compare_price: number | null;
  stock_status: string;
  is_active: boolean;
  thumbnail_url: string | null;
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
};

type ProductImage = { id: number; url: string };
type PriceTier = {
  id: number;
  min_quantity: number;
  max_quantity: number | null;
  price: number;
};
type ProductAttribute = {
  id: number;
  name: string;
  value: string;
  sort_order: number;
  is_filterable: boolean;
};

type Option = { id: number; name: string };

// ⚠️ فیلدهای Vehicle همچنان به‌عنوان «منبع گزینه‌های دراپ‌داون» استفاده
// می‌شن (نه رابطه‌ی محصول) - برای ساخت لیست‌های کاسکید برند→مدل→تیپ.
type VehicleRef = {
  id: number;
  brand: string;
  model: string;
  generation?: string | null;
};

const emptyForm = {
  title: "",
  sku: "",
  description: "",
  price: "",
  compare_price: "",
  category_id: "",
  brand_id: "",
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_type: "",
  stock_status: "available",
  weight_kg: "",
  dimensions: "",
  package_type: "",
  is_active: true,
};

export function AdminProductsContent() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  // منبع گزینه‌های دراپ‌داون کاسکید برند→مدل→تیپ خودرو (از جدول Vehicle،
  // ولی فقط برای گزینه‌ها - مقدار انتخاب‌شده مستقیم روی خودِ محصول ذخیره می‌شه)
  const [allVehicleRefs, setAllVehicleRefs] = useState<VehicleRef[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // گالری و قیمت پلکانی - فقط وقتی محصولی در حال ویرایشه معنی دارن
  const [images, setImages] = useState<ProductImage[]>([]);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [newTier, setNewTier] = useState({
    min_quantity: "",
    max_quantity: "",
    price: "",
  });
  const [newAttribute, setNewAttribute] = useState({
    name: "",
    value: "",
    is_filterable: false,
  });

  // گزینه‌های کاسکید: برند خودرو (یکتا) → مدل‌های همون برند → تیپ‌های همون برند+مدل
  const vehicleBrandChoices = Array.from(
    new Set(allVehicleRefs.map((v) => v.brand))
  ).sort();
  const vehicleModelChoices = Array.from(
    new Set(
      allVehicleRefs
        .filter((v) => v.brand === form.vehicle_brand)
        .map((v) => v.model)
    )
  ).sort();
  const vehicleTrimChoices = Array.from(
    new Set(
      allVehicleRefs
        .filter(
          (v) =>
            v.brand === form.vehicle_brand &&
            v.model === form.vehicle_model &&
            v.generation
        )
        .map((v) => v.generation as string)
    )
  ).sort();

  // کالای مکمل
  type ProductRef = { id: number; title: string; sku: string };
  const [selectedComplementary, setSelectedComplementary] = useState<
    ProductRef[]
  >([]);
  const [complementaryOptions, setComplementaryOptions] = useState<
    ProductRef[]
  >([]);
  const [isSearchingComplementary, setIsSearchingComplementary] =
    useState(false);
  const [isSavingComplementary, setIsSavingComplementary] = useState(false);

  const loadProducts = () => {
    setProducts(null);
    adminAPI.products
      .list({
        search: search || undefined,
        page: page + 1,
        per_page: rowsPerPage,
      })
      .then((res) => {
        setProducts(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    categoriesAPI.list().then((res) => setCategories(res.data.data));
    brandsAPI.list().then((res) => setBrands(res.data.data));
    vehiclesAPI
      .list({ per_page: 300 })
      .then((res) => setAllVehicleRefs(res.data.data));
  }, []);

  const loadProductDetails = (id: number) => {
    adminAPI.products.get(id).then((res) => {
      setImages(res.data.product.images || []);
      setPriceTiers(res.data.product.price_tiers || []);
      setAttributes(res.data.product.product_attributes || []);
      setSelectedComplementary(res.data.product.complementary_products || []);
      // فیلدهای برند/مدل/تیپ خودرو توی لیست سبک محصولات نیستن، فقط
      // موقع گرفتن جزئیات کامل میان - همین‌جا فرم رو باهاشون پر می‌کنیم.
      setForm((prev) => ({
        ...prev,
        vehicle_brand: res.data.product.vehicle_brand || "",
        vehicle_model: res.data.product.vehicle_model || "",
        vehicle_type: res.data.product.vehicle_type || "",
      }));
    });
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setThumbnailFile(null);
    setImages([]);
    setPriceTiers([]);
    setAttributes([]);
    setSelectedComplementary([]);
    setErrors({});
    setTab(0);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      sku: product.sku,
      description: "",
      price: String(product.price),
      compare_price: product.compare_price ? String(product.compare_price) : "",
      category_id: product.category ? String(product.category.id) : "",
      brand_id: product.brand ? String(product.brand.id) : "",
      vehicle_brand: "",
      vehicle_model: "",
      vehicle_type: "",
      stock_status: product.stock_status,
      weight_kg: "",
      dimensions: "",
      package_type: "",
      is_active: product.is_active,
    });
    setThumbnailFile(null);
    setErrors({});
    setTab(0);
    loadProductDetails(product.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("sku", form.sku);
    if (form.description) fd.append("description", form.description);
    fd.append("price", form.price);
    if (form.compare_price) fd.append("compare_price", form.compare_price);
    if (form.category_id) fd.append("category_id", form.category_id);
    if (form.brand_id) fd.append("brand_id", form.brand_id);
    if (form.vehicle_brand) fd.append("vehicle_brand", form.vehicle_brand);
    if (form.vehicle_model) fd.append("vehicle_model", form.vehicle_model);
    if (form.vehicle_type) fd.append("vehicle_type", form.vehicle_type);
    fd.append("stock_status", form.stock_status);
    if (form.weight_kg) fd.append("weight_kg", form.weight_kg);
    if (form.dimensions) fd.append("dimensions", form.dimensions);
    if (form.package_type) fd.append("package_type", form.package_type);
    fd.append("is_active", form.is_active ? "1" : "0");
    if (thumbnailFile) fd.append("thumbnail", thumbnailFile);

    try {
      if (editingId) {
        await adminAPI.products.update(editingId, fd);
        loadProducts();
      } else {
        const res = await adminAPI.products.create(fd);
        // بعد از ساخت موفق، همون‌جا می‌مونیم و می‌ریم توی حالت ویرایش تا
        // بشه گالری/قیمت پلکانی/خودروها رو هم بدون بستن مودال اضافه کرد.
        setEditingId(res.data.product.id);
        loadProducts();
        loadProductDetails(res.data.product.id);
        setIsSaving(false);
        return;
      }
      setDialogOpen(false);
    } catch (err: any) {
      setErrors(
        err?.response?.data?.errors || { general: ["خطا در ذخیره‌ی محصول."] }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این محصول حذف بشه؟")) return;
    await adminAPI.products.delete(id);
    loadProducts();
  };

  const thumbnailPreviewUrl = useMemo(() => {
    if (thumbnailFile) return URL.createObjectURL(thumbnailFile);
    if (editingId)
      return products?.find((p) => p.id === editingId)?.thumbnail_url || null;
    return null;
  }, [thumbnailFile, editingId, products]);

  useEffect(() => {
    return () => {
      if (thumbnailFile) URL.revokeObjectURL(thumbnailPreviewUrl!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnailFile]);

  // ------------------------------------------------------------------
  // گالری تصاویر
  // ------------------------------------------------------------------

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || !editingId) return;

    setIsUploadingImages(true);
    const fd = new FormData();
    Array.from(files).forEach((file) => fd.append("images[]", file));

    try {
      await adminAPI.products.update(editingId, fd);
      loadProductDetails(editingId);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!editingId) return;
    await adminAPI.products.deleteImage(editingId, imageId);
    loadProductDetails(editingId);
  };

  // ------------------------------------------------------------------
  // قیمت پلکانی
  // ------------------------------------------------------------------

  const handleAddTier = async () => {
    if (!editingId) return;

    await adminAPI.products.priceTiers.create(editingId, {
      min_quantity: Number(newTier.min_quantity),
      max_quantity: newTier.max_quantity ? Number(newTier.max_quantity) : null,
      price: Number(newTier.price),
    });
    setNewTier({ min_quantity: "", max_quantity: "", price: "" });
    loadProductDetails(editingId);
  };

  const handleDeleteTier = async (tierId: number) => {
    if (!editingId) return;
    await adminAPI.products.priceTiers.delete(editingId, tierId);
    loadProductDetails(editingId);
  };

  // ------------------------------------------------------------------
  // ویژگی‌های محصول
  // ------------------------------------------------------------------

  const handleAddAttribute = async () => {
    if (!editingId || !newAttribute.name || !newAttribute.value) return;

    await adminAPI.products.attributes.create(editingId, {
      name: newAttribute.name,
      value: newAttribute.value,
      sort_order: attributes.length,
      is_filterable: newAttribute.is_filterable,
    });
    setNewAttribute({ name: "", value: "", is_filterable: false });
    loadProductDetails(editingId);
  };

  const handleDeleteAttribute = async (attributeId: number) => {
    if (!editingId) return;
    await adminAPI.products.attributes.delete(editingId, attributeId);
    loadProductDetails(editingId);
  };

  // ------------------------------------------------------------------
  // کالای مکمل
  // ------------------------------------------------------------------

  const handleSearchComplementary = async (query: string) => {
    if (!query.trim()) {
      setComplementaryOptions([]);
      return;
    }
    setIsSearchingComplementary(true);
    try {
      const res = await productsAPI.list({ search: query, per_page: 15 });
      // خودِ محصولی که الان در حال ویرایششیم رو از نتایج جستجو حذف کن -
      // یه محصول نباید مکمل خودش باشه
      setComplementaryOptions(
        res.data.data.filter((p: ProductRef) => p.id !== editingId)
      );
    } finally {
      setIsSearchingComplementary(false);
    }
  };

  const handleSaveComplementary = async () => {
    if (!editingId) return;

    setIsSavingComplementary(true);
    const fd = new FormData();
    selectedComplementary.forEach((p) =>
      fd.append("complementary_product_ids[]", String(p.id))
    );
    if (selectedComplementary.length === 0)
      fd.append("complementary_product_ids", "");

    try {
      await adminAPI.products.update(editingId, fd);
      loadProductDetails(editingId);
    } finally {
      setIsSavingComplementary(false);
    }
  };

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
          محصولات
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          افزودن محصول
        </Button>
      </Box>

      <TextField
        placeholder="جستجو در عنوان یا SKU..."
        size="small"
        value={search}
        onChange={(e) => {
          setPage(0);
          setSearch(e.target.value);
        }}
        sx={{ mb: 2, minWidth: 260 }}
      />

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>عنوان / SKU</TableCell>
              <TableCell>دسته / برند</TableCell>
              <TableCell>قیمت</TableCell>
              <TableCell>موجودی</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products === null ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    محصولی یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const stock = stockStatusLabels[product.stock_status] || {
                  label: product.stock_status,
                  color: "default" as any,
                };

                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={product.thumbnail_url || undefined}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "background.default",
                        }}
                      >
                        <InventoryIcon fontSize="small" />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      {product.title}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {product.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {product.category?.name || "—"}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {product.brand?.name || ""}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={stock.label}
                        color={stock.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.is_active ? "فعال" : "غیرفعال"}
                        color={product.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="ردیف در صفحه"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} از ${count}`
          }
        />
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "ویرایش محصول" : "افزودن محصول"}
        </DialogTitle>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 3, borderBottom: "1px solid", borderColor: "divider" }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="اطلاعات پایه" />
          <Tab label="گالری تصاویر" disabled={!editingId} />
          <Tab label="قیمت پلکانی" disabled={!editingId} />
          <Tab label="ویژگی‌ها" disabled={!editingId} />
          <Tab label="کالای مکمل" disabled={!editingId} />
        </Tabs>

        <DialogContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general[0]}
            </Alert>
          )}

          {/* ---------------- تب ۱: اطلاعات پایه ---------------- */}
          {tab === 0 && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  label="عنوان محصول"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  error={!!errors.title}
                  helperText={errors.title?.[0]}
                  sx={{ flex: "2 1 300px" }}
                />
                <TextField
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  error={!!errors.sku}
                  helperText={errors.sku?.[0]}
                  sx={{ flex: "1 1 160px" }}
                />
              </Box>

              <TextField
                label="توضیحات"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                multiline
                rows={3}
                fullWidth
              />

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  label="قیمت (تومان)"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  error={!!errors.price}
                  helperText={errors.price?.[0]}
                  sx={{ flex: "1 1 160px" }}
                />
                <TextField
                  label="قیمت قبل از تخفیف (اختیاری)"
                  type="number"
                  value={form.compare_price}
                  onChange={(e) =>
                    setForm({ ...form, compare_price: e.target.value })
                  }
                  sx={{ flex: "1 1 200px" }}
                />
                <FormControl sx={{ flex: "1 1 160px" }}>
                  <InputLabel>وضعیت موجودی</InputLabel>
                  <Select
                    label="وضعیت موجودی"
                    value={form.stock_status}
                    onChange={(e) =>
                      setForm({ ...form, stock_status: e.target.value })
                    }
                  >
                    {Object.entries(stockStatusLabels).map(
                      ([value, { label }]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl sx={{ flex: "1 1 200px" }}>
                  <InputLabel>دسته‌بندی</InputLabel>
                  <Select
                    label="دسته‌بندی"
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                  >
                    <MenuItem value="">بدون دسته</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: "1 1 200px" }}>
                  <InputLabel>برند</InputLabel>
                  <Select
                    label="برند"
                    value={form.brand_id}
                    onChange={(e) =>
                      setForm({ ...form, brand_id: e.target.value })
                    }
                  >
                    <MenuItem value="">بدون برند</MenuItem>
                    {brands.map((b) => (
                      <MenuItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* خودروی سازگار - اختیاری، سه دراپ‌داون آبشاری. مقدارها
                  مستقیم روی خودِ محصول ذخیره می‌شن (نه یه رابطه‌ی جدا) -
                  اگه پر بشن، هم توی فیلتر فروشگاه هم توی جزئیات محصول
                  نمایش داده می‌شن. */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl sx={{ flex: "1 1 200px" }}>
                  <InputLabel>برند خودرو (اختیاری)</InputLabel>
                  <Select
                    label="برند خودرو (اختیاری)"
                    value={form.vehicle_brand}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        vehicle_brand: e.target.value,
                        vehicle_model: "",
                        vehicle_type: "",
                      })
                    }
                  >
                    <MenuItem value="">بدون برند خودرو</MenuItem>
                    {vehicleBrandChoices.map((b) => (
                      <MenuItem key={b} value={b}>
                        {b}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  sx={{ flex: "1 1 200px" }}
                  disabled={!form.vehicle_brand}
                >
                  <InputLabel>مدل خودرو (اختیاری)</InputLabel>
                  <Select
                    label="مدل خودرو (اختیاری)"
                    value={form.vehicle_model}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        vehicle_model: e.target.value,
                        vehicle_type: "",
                      })
                    }
                  >
                    <MenuItem value="">بدون مدل</MenuItem>
                    {vehicleModelChoices.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  sx={{ flex: "1 1 200px" }}
                  disabled={
                    !form.vehicle_model || vehicleTrimChoices.length === 0
                  }
                >
                  <InputLabel>تیپ خودرو (اختیاری)</InputLabel>
                  <Select
                    label="تیپ خودرو (اختیاری)"
                    value={form.vehicle_type}
                    onChange={(e) =>
                      setForm({ ...form, vehicle_type: e.target.value })
                    }
                  >
                    <MenuItem value="">بدون تیپ</MenuItem>
                    {vehicleTrimChoices.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {form.vehicle_brand && (
                <Typography variant="caption" color="text.secondary">
                  اگه پر بشه، هم توی فیلتر فروشگاه (برند/مدل خودرو) هم توی
                  جزئیات محصول نمایش داده می‌شه. تیپ فقط توی جزئیات محصول میاد،
                  جزو فیلتر نیست.
                </Typography>
              )}

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  label="وزن (کیلوگرم، اختیاری)"
                  type="number"
                  value={form.weight_kg}
                  onChange={(e) =>
                    setForm({ ...form, weight_kg: e.target.value })
                  }
                  sx={{ flex: "1 1 160px" }}
                />
                <TextField
                  label="ابعاد (اختیاری)"
                  value={form.dimensions}
                  onChange={(e) =>
                    setForm({ ...form, dimensions: e.target.value })
                  }
                  placeholder="مثلاً 20x10x5 cm"
                  sx={{ flex: "1 1 200px" }}
                />
                <TextField
                  label="نوع بسته‌بندی (اختیاری)"
                  value={form.package_type}
                  onChange={(e) =>
                    setForm({ ...form, package_type: e.target.value })
                  }
                  sx={{ flex: "1 1 160px" }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {thumbnailPreviewUrl && (
                  <Avatar
                    variant="rounded"
                    src={thumbnailPreviewUrl}
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: "background.default",
                    }}
                  >
                    <InventoryIcon fontSize="small" />
                  </Avatar>
                )}
                <Box>
                  <Button variant="outlined" component="label">
                    {thumbnailFile
                      ? thumbnailFile.name
                      : editingId
                      ? "تعویض تصویر شاخص"
                      : "انتخاب تصویر شاخص"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        setThumbnailFile(e.target.files?.[0] || null)
                      }
                    />
                  </Button>
                  {errors.thumbnail && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {errors.thumbnail[0]}
                    </Typography>
                  )}
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                  />
                }
                label="فعال"
              />

              {!editingId && (
                <Alert severity="info">
                  بعد از ذخیره‌ی اطلاعات پایه، تب‌های گالری، قیمت پلکانی،
                  ویژگی‌ها و کالای مکمل فعال می‌شن.
                </Alert>
              )}
            </Box>
          )}

          {/* ---------------- تب ۲: گالری تصاویر ---------------- */}
          {tab === 1 && editingId && (
            <Box sx={{ pt: 1 }}>
              <Button
                variant="outlined"
                component="label"
                disabled={isUploadingImages}
                sx={{ mb: 2 }}
              >
                {isUploadingImages
                  ? "در حال آپلود..."
                  : "افزودن تصویر به گالری"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleUploadImages(e.target.files)}
                />
              </Button>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {images.length === 0 ? (
                  <Typography color="text.secondary">
                    هنوز تصویری توی گالری نیست
                  </Typography>
                ) : (
                  images.map((img) => (
                    <Box key={img.id} sx={{ position: "relative" }}>
                      <Avatar
                        variant="rounded"
                        src={img.url}
                        sx={{ width: 80, height: 80 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteImage(img.id)}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor: "background.paper",
                          boxShadow: 1,
                          "&:hover": { bgcolor: "background.default" },
                        }}
                      >
                        <Close fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          )}

          {/* ---------------- تب ۳: قیمت پلکانی ---------------- */}
          {tab === 2 && editingId && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                برای فروش عمده با تخفیف پلکانی، بازه‌ی تعداد و قیمت واحد رو
                تعریف کنید.
              </Typography>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>حداقل تعداد</TableCell>
                      <TableCell>حداکثر تعداد</TableCell>
                      <TableCell>قیمت واحد</TableCell>
                      <TableCell align="center">حذف</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priceTiers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            هنوز قیمت پلکانی تعریف نشده
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      priceTiers.map((tier) => (
                        <TableRow key={tier.id}>
                          <TableCell>{tier.min_quantity}</TableCell>
                          <TableCell>{tier.max_quantity ?? "∞"}</TableCell>
                          <TableCell>{formatPrice(tier.price)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTier(tier.id)}
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

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                }}
              >
                <TextField
                  label="حداقل تعداد"
                  type="number"
                  value={newTier.min_quantity}
                  onChange={(e) =>
                    setNewTier({ ...newTier, min_quantity: e.target.value })
                  }
                  sx={{ flex: "1 1 140px" }}
                />
                <TextField
                  label="حداکثر تعداد (خالی = بی‌نهایت)"
                  type="number"
                  value={newTier.max_quantity}
                  onChange={(e) =>
                    setNewTier({ ...newTier, max_quantity: e.target.value })
                  }
                  sx={{ flex: "1 1 180px" }}
                />
                <TextField
                  label="قیمت واحد (تومان)"
                  type="number"
                  value={newTier.price}
                  onChange={(e) =>
                    setNewTier({ ...newTier, price: e.target.value })
                  }
                  sx={{ flex: "1 1 160px" }}
                />
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleAddTier}
                >
                  افزودن
                </Button>
              </Box>
            </Box>
          )}

          {/* ---------------- تب ۴: ویژگی‌های محصول ---------------- */}
          {tab === 3 && editingId && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                ویژگی‌های فنی محصول رو به‌صورت کلید-مقدار اضافه کنید (مثلاً
                «جنس: فلزی»، «رنگ: مشکی»). فقط ویژگی‌هایی که «قابل‌فیلتر» علامت
                بزنید، توی فیلتر صفحه‌ی دسته‌بندی نشون داده می‌شن — چیزهای صرفاً
                توضیحی (مثل «کشور سازنده») رو تیک نزنید.
              </Typography>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ویژگی</TableCell>
                      <TableCell>مقدار</TableCell>
                      <TableCell align="center">قابل‌فیلتر</TableCell>
                      <TableCell align="center">حذف</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attributes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            هنوز ویژگی‌ای تعریف نشده
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      attributes.map((attribute) => (
                        <TableRow key={attribute.id}>
                          <TableCell>{attribute.name}</TableCell>
                          <TableCell>{attribute.value}</TableCell>
                          <TableCell align="center">
                            <Switch
                              size="small"
                              checked={attribute.is_filterable}
                              onChange={async (e) => {
                                if (!editingId) return;
                                await adminAPI.products.attributes.update(
                                  editingId,
                                  attribute.id,
                                  {
                                    is_filterable: e.target.checked,
                                  }
                                );
                                loadProductDetails(editingId);
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDeleteAttribute(attribute.id)
                              }
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

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <TextField
                  label="نام ویژگی (مثلاً جنس)"
                  value={newAttribute.name}
                  onChange={(e) =>
                    setNewAttribute({ ...newAttribute, name: e.target.value })
                  }
                  sx={{ flex: "1 1 200px" }}
                />
                <TextField
                  label="مقدار (مثلاً فلزی)"
                  value={newAttribute.value}
                  onChange={(e) =>
                    setNewAttribute({ ...newAttribute, value: e.target.value })
                  }
                  sx={{ flex: "1 1 200px" }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={newAttribute.is_filterable}
                      onChange={(e) =>
                        setNewAttribute({
                          ...newAttribute,
                          is_filterable: e.target.checked,
                        })
                      }
                    />
                  }
                  label="قابل‌فیلتر"
                />
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleAddAttribute}
                >
                  افزودن
                </Button>
              </Box>
            </Box>
          )}

          {/* ---------------- تب ۵: کالای مکمل ---------------- */}
          {tab === 4 && editingId && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                محصولاتی که معمولاً همراه این کالا خریداری/استفاده می‌شن رو
                انتخاب کنید (مثلاً برای «روغن موتور»: فیلتر روغن، واشر درین).
                وقتی مشتری فقط بخشی از این‌ها رو توی سبدش داشته باشه، بقیه توی
                سبد خرید پیشنهاد می‌شن.
              </Typography>

              <Autocomplete
                multiple
                options={complementaryOptions}
                value={selectedComplementary}
                getOptionLabel={(p) => `${p.title} (${p.sku})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={isSearchingComplementary}
                onChange={(_, newValue) => setSelectedComplementary(newValue)}
                onInputChange={(_, newInput) =>
                  handleSearchComplementary(newInput)
                }
                filterOptions={(x) => x} // فیلتر سمت سرور انجام می‌شه، نه سمت کلاینت
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="کالای مکمل"
                    placeholder="جستجوی محصول با نام یا SKU..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.title}
                      size="small"
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                disableElevation
                onClick={handleSaveComplementary}
                disabled={isSavingComplementary}
              >
                {isSavingComplementary
                  ? "در حال ذخیره..."
                  : "ذخیره‌ی کالای مکمل"}
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            color="inherit"
            onClick={() => setDialogOpen(false)}
            disabled={isSaving}
          >
            بستن
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
