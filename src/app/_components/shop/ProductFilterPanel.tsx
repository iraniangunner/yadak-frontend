"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Rating,
  IconButton,
  Collapse,
  TextField,
  Switch,
  InputAdornment,
  Slider,
  Avatar,
} from "@mui/material";
import { ExpandMore, Search } from "@mui/icons-material";
import { productsAPI } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductFilterPanel.tsx
|--------------------------------------------------------------------------
| دسته‌بندی چندسطحیه (parent_id)، کاملاً بازگشتی (هر عمقی رو پشتیبانی
| می‌کنه). منطق تیک زدن:
| - تیک زدن یه دسته: خودش + همه‌ی زیرمجموعه‌هاش (تا هر عمقی) برای فیلتر
|   واقعی فعال می‌شن، ولی فقط خودِ همون دسته تیک نمایش داده می‌شه.
| - تیک زدن یه زیرمجموعه‌ی خاص: همه‌ی اجدادش از حالت تیک خارج می‌شن، فقط
|   همون زیرمجموعه (و زیرمجموعه‌های خودش) انتخاب می‌مونن.
|
| ⚠️ فیلتر خودرو دیگه بر اساس رابطه‌ی قدیمی Vehicle نیست - دو تا لیست
| کاملاً مستقل و مسطح (برند خودرو / مدل خودرو)، هرکدوم روی فیلد مستقیم
| vehicle_brand/vehicle_model خودِ محصول عمل می‌کنن. اگه ترکیب انتخاب‌شده
| (مثلاً پراید + ۲۰۶) روی هیچ محصولی نباشه، نتیجه خالیه - این طبیعیه.
*/

export type ProductFilters = {
  category_ids: string[];
  brand_ids: string[];
  vehicle_brands: string[];
  vehicle_models: string[];
  stock_statuses: string[];
  min_rating: string;
  attributes: Record<string, string>;
  min_price: string;
  max_price: string;
  is_available: boolean;
  is_discounted: boolean;
};

type Option = { id: number; name: string };
type CategoryOption = { id: number; name: string; parent_id: number | null };

const stockStatusOptions = [
  { value: "available", label: "موجود" },
  { value: "incoming", label: "در حال تأمین" },
  { value: "stopped", label: "متوقف‌شده" },
  { value: "out_of_stock", label: "ناموجود" },
];

const ratingOptions = [4, 3, 2, 1];

// ------------------------------------------------------------------
// بخش دسته‌بندی درختی - کاملاً بازگشتی، هر تعداد سطح رو پشتیبانی می‌کنه
// ------------------------------------------------------------------

// ترتیب نمایش: هر ریشه، بعدش همه‌ی زیرمجموعه‌هاش (به هر عمقی)، قبل از
// اینکه بریم سراغ ریشه‌ی بعدی - تا لیست مسطح هم منطقی و قابل‌فهم بمونه.
function flattenCategories(
  categories: CategoryOption[],
  parentId: number | null = null
): CategoryOption[] {
  const children = categories.filter((c) => c.parent_id === parentId);
  let result: CategoryOption[] = [];
  for (const child of children) {
    result.push(child);
    result = result.concat(flattenCategories(categories, child.id));
  }
  return result;
}

function CategoryTree({
  categories,
  selectedIds,
  onChange,
}: {
  categories: CategoryOption[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
}) {
  // فقط دسته‌های برگ (بدون زیرمجموعه) نشون داده می‌شن - چون محصولات
  // فقط به برگ‌ها وصل می‌شن (نه دسته‌های والد/سازمانی)؛ نشون‌دادن والد
  // به‌عنوان فیلتر همیشه نتیجه‌ی خالی می‌داد (هیچ محصولی category_id
  // برابر با آیدی والد نداره).
  const flatList = flattenCategories(categories).filter(
    (c) => !categories.some((child) => child.parent_id === c.id)
  );
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? flatList.filter((c) => c.name.includes(search.trim()))
    : flatList;

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((v) => v !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <Box>
      {flatList.length > 5 && (
        <TextField
          size="small"
          placeholder="جستجو در دسته‌بندی..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 0.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: 280,
          overflowY: "auto",
        }}
      >
        {filtered.map((category) => {
          const id = String(category.id);
          const isChecked = selectedIds.includes(id);

          return (
            <FormControlLabel
              key={category.id}
              sx={{
                mr: 0,
                borderRadius: 1.5,
                // bgcolor: isChecked ? "rgba(30,58,138,0.06)" : "transparent",
              }}
              control={
                <Checkbox
                  size="small"
                  checked={isChecked}
                  onChange={() => toggle(id)}
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{ fontWeight: isChecked ? 700 : 400 }}
                >
                  {category.name}
                </Typography>
              }
            />
          );
        })}
      </Box>
    </Box>
  );
}

// ------------------------------------------------------------------
// یه لیست چک‌باکسیِ قابل‌جستجو - برای وقتی گزینه‌ها زیادن (برند، برند/
// مدل خودرو) و پیدا کردن یه مورد خاص با اسکرول کردن سخته.
// ------------------------------------------------------------------
function SearchableCheckboxList({
  title,
  options,
  selected,
  onToggle,
  getLabel = (o) => o,
  getKey = (o) => o,
  getImage,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  getLabel?: (option: string) => string;
  getKey?: (option: string) => string;
  getImage?: (option: string) => string | null | undefined;
}) {
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? options.filter((o) => getLabel(o).includes(search.trim()))
    : options;

  return (
    <>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {options.length > 5 && (
        <TextField
          size="small"
          placeholder={`جستجو در ${title}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 0.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: 240,
          overflowY: "auto",
        }}
      >
        {filtered.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ py: 1 }}>
            چیزی پیدا نشد
          </Typography>
        ) : (
          filtered.map((option) => (
            <FormControlLabel
              key={getKey(option)}
              control={
                <Checkbox
                  size="small"
                  checked={selected.includes(getKey(option))}
                  onChange={() => onToggle(getKey(option))}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  {/* {getImage && (
                    <Avatar
                      variant="rounded"
                      src={getImage(option) || undefined}
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: "0.65rem",
                        bgcolor: "background.default",
                      }}
                    >
                      {getLabel(option).charAt(0)}
                    </Avatar>
                  )} */}
                  <Typography variant="body2">{getLabel(option)}</Typography>
                </Box>
              }
            />
          ))
        )}
      </Box>
    </>
  );
}

export function ProductFilterPanel({
  filters,
  categories,
  brands,
  vehicleBrandOptions,
  vehicleBrandImages,
  vehicleModelOptions,
  onChange,
  onClear,
  showCategoryFilter = true,
  filterableAttributes,
  attributeCategoryIds,
}: {
  filters: ProductFilters;
  categories: CategoryOption[];
  brands: Option[];
  vehicleBrandOptions?: string[];
  vehicleBrandImages?: { name: string; thumbnail_url: string | null }[];
  vehicleModelOptions?: string[];
  onChange: (filters: ProductFilters) => void;
  onClear: () => void;
  showCategoryFilter?: boolean;
  filterableAttributes?: { name: string; values: string[] }[];
  attributeCategoryIds?: number[];
}) {
  // ⚠️ نرمال‌سازی امن: اگه هرجایی این کامپوننت رو با یه filters ناقص صدا
  // بزنه، به‌جای کرش کردن، مقدار پیش‌فرض خالی می‌ذاریم.
  const safeFilters: ProductFilters = {
    category_ids: filters.category_ids || [],
    brand_ids: filters.brand_ids || [],
    vehicle_brands: filters.vehicle_brands || [],
    vehicle_models: filters.vehicle_models || [],
    stock_statuses: filters.stock_statuses || [],
    min_rating: filters.min_rating || "",
    attributes: filters.attributes || {},
    min_price: filters.min_price || "",
    max_price: filters.max_price || "",
    is_available: filters.is_available || false,
    is_discounted: filters.is_discounted || false,
  };

  // چون این صفحه SSR ـه، هر تغییر فیلتر یه رفت‌وبرگشت واقعی به سرور داره
  // که یه لحظه طول می‌کشه. برای فیدبک فوری روی *همه‌ی* فیلترها، یه نسخه‌ی
  // محلی خوش‌بینانه از کل filters نگه می‌داریم که همون لحظه‌ی کلیک آپدیت می‌شه.
  const [optimisticFilters, setOptimisticFilters] = useState(safeFilters);

  useEffect(() => {
    setOptimisticFilters(safeFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    safeFilters.category_ids.join(","),
    safeFilters.brand_ids.join(","),
    safeFilters.vehicle_brands.join(","),
    safeFilters.vehicle_models.join(","),
    safeFilters.stock_statuses.join(","),
    safeFilters.min_rating,
    safeFilters.min_price,
    safeFilters.max_price,
    safeFilters.is_available,
    safeFilters.is_discounted,
  ]);

  // فیلترهای دینامیک ویژگی - با تغییر برند/خودرو/قیمت/موجودی، دوباره از
  // سرور می‌گیریم تا فقط ویژگی‌هایی که واقعاً بین محصولات باقی‌مونده
  // وجود دارن نشون داده بشن (faceted filtering، مثل دیجی‌کالا).
  const [liveFilterableAttributes, setLiveFilterableAttributes] = useState(
    filterableAttributes || []
  );

  useEffect(() => {
    setLiveFilterableAttributes(filterableAttributes || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filterableAttributes)]);

  useEffect(() => {
    if (!attributeCategoryIds || attributeCategoryIds.length === 0) return;

    productsAPI
      .filterableAttributes({
        category_id: attributeCategoryIds.join(","),
        brand_id: optimisticFilters.brand_ids.length
          ? optimisticFilters.brand_ids.join(",")
          : undefined,
        vehicle_brand: optimisticFilters.vehicle_brands.length
          ? optimisticFilters.vehicle_brands.join(",")
          : undefined,
        vehicle_model: optimisticFilters.vehicle_models.length
          ? optimisticFilters.vehicle_models.join(",")
          : undefined,
        stock_status: optimisticFilters.stock_statuses.length
          ? optimisticFilters.stock_statuses.join(",")
          : undefined,
        min_price: optimisticFilters.min_price
          ? Number(optimisticFilters.min_price)
          : undefined,
        max_price: optimisticFilters.max_price
          ? Number(optimisticFilters.max_price)
          : undefined,
      })
      .then((res) => setLiveFilterableAttributes(res.data.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    optimisticFilters.brand_ids.join(","),
    optimisticFilters.vehicle_brands.join(","),
    optimisticFilters.vehicle_models.join(","),
    optimisticFilters.stock_statuses.join(","),
    optimisticFilters.min_price,
    optimisticFilters.max_price,
  ]);

  const applyChange = (next: ProductFilters) => {
    setOptimisticFilters(next); // فوری، همون لحظه
    onChange(next); // ناوبری واقعی (کمی طول می‌کشه)
  };

  const handleCategoryChange = (nextCategoryIds: string[]) => {
    applyChange({ ...optimisticFilters, category_ids: nextCategoryIds });
  };

  const toggleInArray = (
    key: "brand_ids" | "vehicle_brands" | "vehicle_models" | "stock_statuses",
    value: string
  ) => {
    const current = optimisticFilters[key] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    applyChange({ ...optimisticFilters, [key]: next });
  };

  // Slider قیمت - بازه‌ی ثابت ۰ تا ۵۰ میلیون تومان. یه state محلی جدا
  // نگه می‌داریم تا حین کشیدن دسته‌ها، هر پیکسل حرکت باعث ناوبری واقعی
  // نشه؛ فقط وقتی دست رو برمی‌دارید (onChangeCommitted) فیلتر واقعی
  // اعمال می‌شه.
  const PRICE_MIN = 0;
  const PRICE_MAX = 50_000_000;
  const [priceRange, setPriceRange] = useState<[number, number]>([
    optimisticFilters.min_price
      ? Number(optimisticFilters.min_price)
      : PRICE_MIN,
    optimisticFilters.max_price
      ? Number(optimisticFilters.max_price)
      : PRICE_MAX,
  ]);

  useEffect(() => {
    setPriceRange([
      optimisticFilters.min_price
        ? Number(optimisticFilters.min_price)
        : PRICE_MIN,
      optimisticFilters.max_price
        ? Number(optimisticFilters.max_price)
        : PRICE_MAX,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimisticFilters.min_price, optimisticFilters.max_price]);

  const toggleRating = (r: number) => {
    applyChange({
      ...optimisticFilters,
      min_rating: optimisticFilters.min_rating === String(r) ? "" : String(r),
    });
  };

  const toggleAttribute = (name: string, value: string) => {
    const current = optimisticFilters.attributes[name];
    const nextAttributes = { ...optimisticFilters.attributes };
    if (current === value) {
      delete nextAttributes[name];
    } else {
      nextAttributes[name] = value;
    }
    applyChange({ ...optimisticFilters, attributes: nextAttributes });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>فیلترها</Typography>

      {/* برند خودرو و مدل خودرو - دو لیست کاملاً مستقل و مسطح، بدون
          کاسکید. مستقل از هم AND می‌شن - یعنی اگه ترکیبی که وجود نداره
          انتخاب بشه (مثلاً پراید + ۲۰۶)، نتیجه خالیه (طبیعیه، نه باگ). */}
      {vehicleBrandOptions && vehicleBrandOptions.length > 0 && (
        <>
          <SearchableCheckboxList
            title="برند خودرو"
            options={vehicleBrandOptions}
            selected={optimisticFilters.vehicle_brands}
            onToggle={(v) => toggleInArray("vehicle_brands", v)}
            // getImage={(name) =>
            //   vehicleBrandImages?.find((v) => v.name === name)?.thumbnail_url
            // }
          />
          <Divider sx={{ my: 1 }} />
        </>
      )}

      {vehicleModelOptions && vehicleModelOptions.length > 0 && (
        <>
          <SearchableCheckboxList
            title="مدل خودرو"
            options={vehicleModelOptions}
            selected={optimisticFilters.vehicle_models}
            onToggle={(v) => toggleInArray("vehicle_models", v)}
          />
          <Divider sx={{ my: 1 }} />
        </>
      )}

      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
        محدوده‌ی قیمت (تومان)
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={priceRange}
          onChange={(_, newValue) =>
            setPriceRange(newValue as [number, number])
          }
          onChangeCommitted={(_, newValue) => {
            const [min, max] = newValue as [number, number];
            applyChange({
              ...optimisticFilters,
              min_price: min > PRICE_MIN ? String(min) : "",
              max_price: max < PRICE_MAX ? String(max) : "",
            });
          }}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={100000}
          size="small"
          valueLabelDisplay="off"
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="caption" color="text.secondary">
            {priceRange[0].toLocaleString("fa-IR")} تومان
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {priceRange[1].toLocaleString("fa-IR")} تومان
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />

      {showCategoryFilter && (
        <>
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
            دسته‌بندی
          </Typography>
          <CategoryTree
            categories={categories}
            selectedIds={optimisticFilters.category_ids}
            onChange={handleCategoryChange}
          />
          <Divider sx={{ my: 1 }} />
        </>
      )}

      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
        دسترسی سریع
      </Typography>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={optimisticFilters.is_available}
            onChange={(e) =>
              applyChange({
                ...optimisticFilters,
                is_available: e.target.checked,
              })
            }
          />
        }
        label={<Typography variant="body2">فقط کالاهای موجود</Typography>}
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={optimisticFilters.is_discounted}
            onChange={(e) =>
              applyChange({
                ...optimisticFilters,
                is_discounted: e.target.checked,
              })
            }
          />
        }
        label={<Typography variant="body2">فقط کالاهای تخفیف‌دار</Typography>}
      />
      <Divider sx={{ my: 1 }} />

      {brands.length > 0 && (
        <>
          <SearchableCheckboxList
            title="برند"
            options={brands.map((b) => String(b.id))}
            selected={optimisticFilters.brand_ids}
            onToggle={(v) => toggleInArray("brand_ids", v)}
            getLabel={(id) =>
              brands.find((b) => String(b.id) === id)?.name || id
            }
          />
          <Divider sx={{ my: 1 }} />
        </>
      )}

      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        وضعیت موجودی
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {stockStatusOptions.map((s) => (
          <FormControlLabel
            key={s.value}
            control={
              <Checkbox
                size="small"
                checked={optimisticFilters.stock_statuses.includes(s.value)}
                onChange={() => toggleInArray("stock_statuses", s.value)}
              />
            }
            label={<Typography variant="body2">{s.label}</Typography>}
          />
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        امتیاز
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {ratingOptions.map((r) => (
          <FormControlLabel
            key={r}
            control={
              <Checkbox
                size="small"
                checked={optimisticFilters.min_rating === String(r)}
                onChange={() => toggleRating(r)}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating value={r} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  و بالاتر
                </Typography>
              </Box>
            }
          />
        ))}
      </Box>

      {liveFilterableAttributes && liveFilterableAttributes.length > 0 && (
        <>
          {liveFilterableAttributes.map((attr) => (
            <Box key={attr.name}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {attr.name}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {attr.values.map((value) => (
                  <FormControlLabel
                    key={value}
                    control={
                      <Checkbox
                        size="small"
                        checked={
                          optimisticFilters.attributes[attr.name] === value
                        }
                        onChange={() => toggleAttribute(attr.name, value)}
                      />
                    }
                    label={<Typography variant="body2">{value}</Typography>}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </>
      )}

      <Divider sx={{ my: 1 }} />

      <Button
        color="inherit"
        onClick={() => {
          setOptimisticFilters({
            category_ids: [],
            brand_ids: [],
            vehicle_brands: [],
            vehicle_models: [],
            stock_statuses: [],
            min_rating: "",
            attributes: {},
            min_price: "",
            max_price: "",
            is_available: false,
            is_discounted: false,
          });
          onClear();
        }}
        size="small"
        sx={{ mt: 1 }}
      >
        پاک کردن فیلترها
      </Button>
    </Box>
  );
}
