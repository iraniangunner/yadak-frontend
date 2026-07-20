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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ExpandMore, Close } from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/ProductFilterPanel.tsx
|--------------------------------------------------------------------------

*/

export type ProductFilters = {
  category_ids: string[];
  brand_ids: string[];
  stock_statuses: string[];
  min_rating: string;
};

type Option = { id: number; name: string };
type CategoryOption = { id: number; name: string; parent_id: number | null };
type VehicleOption = {
  id: number;
  brand: string;
  model: string;
  generation?: string | null;
};

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

function getChildren(
  categories: CategoryOption[],
  parentId: number
): CategoryOption[] {
  return categories.filter((c) => c.parent_id === parentId);
}

function getDescendantIds(
  categories: CategoryOption[],
  nodeId: number
): string[] {
  const children = getChildren(categories, nodeId);
  let ids: string[] = [];
  for (const child of children) {
    ids.push(String(child.id));
    ids = ids.concat(getDescendantIds(categories, child.id));
  }
  return ids;
}

function getAncestorIds(
  categories: CategoryOption[],
  nodeId: number
): string[] {
  const node = categories.find((c) => c.id === nodeId);
  if (!node || !node.parent_id) return [];
  return [
    String(node.parent_id),
    ...getAncestorIds(categories, node.parent_id),
  ];
}

function CategoryNode({
  category,
  categories,
  selectedIds,
  onChange,
  depth,
  isLast,
}: {
  category: CategoryOption;
  categories: CategoryOption[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
  depth: number;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const children = getChildren(categories, category.id);
  const hasChildren = children.length > 0;

  const ancestorIds = getAncestorIds(categories, category.id);
  const isChecked =
    selectedIds.includes(String(category.id)) &&
    !ancestorIds.some((id) => selectedIds.includes(id));

  const handleToggle = () => {
    const nodeId = String(category.id);
    const descendantIds = getDescendantIds(categories, category.id);

    if (isChecked) {
      onChange(
        selectedIds.filter((id) => id !== nodeId && !descendantIds.includes(id))
      );
    } else {
      const cleaned = selectedIds.filter(
        (id) =>
          id !== nodeId &&
          !descendantIds.includes(id) &&
          !ancestorIds.includes(id)
      );
      onChange([...cleaned, nodeId, ...descendantIds]);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      {depth > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: isLast ? "auto" : 0,
            height: isLast ? 20 : "100%",
            insetInlineStart: (depth - 1) * 20 + 10,
            width: "1px",
            bgcolor: "divider",
          }}
        />
      )}
      {depth > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            height: "1px",
            width: 10,
            insetInlineStart: (depth - 1) * 20 + 10,
            bgcolor: "divider",
          }}
        />
      )}

      <Box sx={{ display: "flex", alignItems: "center" }}>
        {depth > 0 && <Box sx={{ width: depth * 20, flexShrink: 0 }} />}

        <FormControlLabel
          sx={{
            flex: 1,
            mr: 0,
            borderRadius: 1.5,
            // bgcolor: isChecked ? "rgba(30,58,138,0.06)" : "transparent",
            transition: "background-color .15s",
            pr: 0.5,
          }}
          control={
            <Checkbox
              size="small"
              checked={isChecked}
              onChange={handleToggle}
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

        {hasChildren && (
          <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
            <ExpandMore
              fontSize="small"
              sx={{
                transition: "transform .2s",
                transform: expanded ? "rotate(0deg)" : "rotate(90deg)",
              }}
            />
          </IconButton>
        )}
      </Box>

      {hasChildren && (
        <Collapse in={expanded}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {children.map((child, idx) => (
              <CategoryNode
                key={child.id}
                category={child}
                categories={categories}
                selectedIds={selectedIds}
                onChange={onChange}
                depth={depth + 1}
                isLast={idx === children.length - 1}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
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
  const roots = categories.filter((c) => !c.parent_id);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {roots.map((root, idx) => (
        <CategoryNode
          key={root.id}
          category={root}
          categories={categories}
          selectedIds={selectedIds}
          onChange={onChange}
          depth={0}
          isLast={idx === roots.length - 1}
        />
      ))}
    </Box>
  );
}

export function ProductFilterPanel({
  filters,
  categories,
  brands,
  vehicles,
  vehicleId,
  onVehicleChange,
  onChange,
  onClear,
  showCategoryFilter = true,
}: {
  filters: ProductFilters;
  categories: CategoryOption[];
  brands: Option[];
  vehicles?: VehicleOption[];
  vehicleId?: string;
  onVehicleChange?: (vehicleId: string) => void;
  onChange: (filters: ProductFilters) => void;
  onClear: () => void;
  showCategoryFilter?: boolean;
}) {
  const [optimisticFilters, setOptimisticFilters] = useState(filters);

  useEffect(() => {
    setOptimisticFilters(filters);
  }, [
    filters.category_ids.join(","),
    filters.brand_ids.join(","),
    filters.stock_statuses.join(","),
    filters.min_rating,
  ]);

  const applyChange = (next: ProductFilters) => {
    setOptimisticFilters(next);
    onChange(next);
  };

  const currentVehicle = vehicles?.find((v) => String(v.id) === vehicleId);
  const [vehicleBrand, setVehicleBrand] = useState(currentVehicle?.brand || "");

  useEffect(() => {
    setVehicleBrand(currentVehicle?.brand || "");
  }, [vehicleId]);

  const vehicleBrands = Array.from(
    new Set((vehicles || []).map((v) => v.brand))
  );
  const modelsForVehicleBrand = (vehicles || []).filter(
    (v) => v.brand === vehicleBrand
  );

  function vehicleModelLabel(v: VehicleOption) {
    return v.generation ? `${v.model} (${v.generation})` : v.model;
  }

  const handleCategoryChange = (nextCategoryIds: string[]) => {
    applyChange({ ...optimisticFilters, category_ids: nextCategoryIds });
  };

  const toggleInArray = (
    key: "brand_ids" | "stock_statuses",
    value: string
  ) => {
    const current = optimisticFilters[key] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    applyChange({ ...optimisticFilters, [key]: next });
  };

  const toggleRating = (r: number) => {
    applyChange({
      ...optimisticFilters,
      min_rating: optimisticFilters.min_rating === String(r) ? "" : String(r),
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>فیلترها</Typography>

      {vehicles && vehicles.length > 0 && onVehicleChange && (
        <>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            خودروی من
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>برند خودرو</InputLabel>
              <Select
                label="برند خودرو"
                value={vehicleBrand}
                onChange={(e) => {
                  setVehicleBrand(e.target.value);
                  onVehicleChange("");
                }}
              >
                {vehicleBrands.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth disabled={!vehicleBrand}>
              <InputLabel>مدل</InputLabel>
              <Select
                label="مدل"
                value={vehicleId || ""}
                onChange={(e) => onVehicleChange(e.target.value)}
              >
                {modelsForVehicleBrand.map((v) => (
                  <MenuItem key={v.id} value={String(v.id)}>
                    {vehicleModelLabel(v)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {vehicleId && (
              <Button
                size="small"
                color="inherit"
                startIcon={<Close fontSize="small" />}
                onClick={() => {
                  setVehicleBrand("");
                  onVehicleChange("");
                }}
              >
                پاک کردن خودرو
              </Button>
            )}
          </Box>
          <Divider sx={{ my: 1 }} />
        </>
      )}

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

      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        برند
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {brands.map((b) => (
          <FormControlLabel
            key={b.id}
            control={
              <Checkbox
                size="small"
                checked={optimisticFilters.brand_ids.includes(String(b.id))}
                onChange={() => toggleInArray("brand_ids", String(b.id))}
              />
            }
            label={<Typography variant="body2">{b.name}</Typography>}
          />
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

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

      <Divider sx={{ my: 1 }} />

      <Button
        color="inherit"
        onClick={() => {
          setOptimisticFilters({
            category_ids: [],
            brand_ids: [],
            stock_statuses: [],
            min_rating: "",
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
