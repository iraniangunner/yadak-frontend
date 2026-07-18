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
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

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
| ⚠️ نکته‌ی مهم درباره‌ی باگ قبلی: تصمیم «تیک بزن یا بردار» باید بر اساس
| وضعیت *نمایشی* (isChecked) باشه، نه صرفاً اینکه آیدی داخل آرایه هست یا
| نه - چون آیدی زیرمجموعه‌ها حتی وقتی به‌خاطر والدشون مخفیانه تیک‌نخورده
| نشون داده می‌شن، همچنان داخل آرایه هستن (برای فیلتر واقعی).
*/

export type ProductFilters = {
  category_ids: string[];
  brand_ids: string[];
  stock_statuses: string[];
  min_rating: string;
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

function getChildren(
  categories: CategoryOption[],
  parentId: number,
): CategoryOption[] {
  return categories.filter((c) => c.parent_id === parentId);
}

function getDescendantIds(
  categories: CategoryOption[],
  nodeId: number,
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
  nodeId: number,
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
        selectedIds.filter(
          (id) => id !== nodeId && !descendantIds.includes(id),
        ),
      );
    } else {
      const cleaned = selectedIds.filter(
        (id) =>
          id !== nodeId &&
          !descendantIds.includes(id) &&
          !ancestorIds.includes(id),
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
  onChange,
  onClear,
  showCategoryFilter = true,
}: {
  filters: ProductFilters;
  categories: CategoryOption[];
  brands: Option[];
  onChange: (filters: ProductFilters) => void;
  onClear: () => void;
  showCategoryFilter?: boolean;
}) {
  const [optimisticCategoryIds, setOptimisticCategoryIds] = useState(
    filters.category_ids,
  );

  useEffect(() => {
    setOptimisticCategoryIds(filters.category_ids);
  }, [filters.category_ids.join(",")]);

  const handleCategoryChange = (nextCategoryIds: string[]) => {
    setOptimisticCategoryIds(nextCategoryIds);
    onChange({ ...filters, category_ids: nextCategoryIds });
  };

  const toggleInArray = (
    key: "brand_ids" | "stock_statuses",
    value: string,
  ) => {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>فیلترها</Typography>

      {showCategoryFilter && (
        <>
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
            دسته‌بندی
          </Typography>
          <CategoryTree
            categories={categories}
            selectedIds={optimisticCategoryIds}
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
                checked={filters.brand_ids.includes(String(b.id))}
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
                checked={filters.stock_statuses.includes(s.value)}
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
                checked={filters.min_rating === String(r)}
                onChange={() =>
                  onChange({
                    ...filters,
                    min_rating:
                      filters.min_rating === String(r) ? "" : String(r),
                  })
                }
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

      <Button color="inherit" onClick={onClear} size="small" sx={{ mt: 1 }}>
        پاک کردن فیلترها
      </Button>
    </Box>
  );
}
