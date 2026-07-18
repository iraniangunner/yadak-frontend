"use client";

import { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { ProductReviewsSection } from "@/app/_components/shop/ProductReviewsSection";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/product/ProductTabsSection.tsx
|--------------------------------------------------------------------------
*/

type Attribute = { id: number; name: string; value: string };

export function ProductTabsSection({
  productId,
  description,
  attributes,
  averageRating,
  reviewsCount,
}: {
  productId: number;
  description: string | null;
  attributes: Attribute[];
  averageRating: number | null;
  reviewsCount: number;
}) {
  const [tab, setTab] = useState(0);

  const tabLabels = [
    "توضیحات",
    ...(attributes.length > 0 ? ["ویژگی‌ها"] : []),
    "نظرات کاربران",
  ];
  const attributesTabIndex = attributes.length > 0 ? 1 : -1;
  const reviewsTabIndex = attributes.length > 0 ? 2 : 1;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}
      >
        {tabLabels.map((label, idx) => (
          <Tab key={label} label={label} value={idx} />
        ))}
      </Tabs>

      <Box sx={{ p: 3 }}>
        {tab === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-line", lineHeight: 1.9 }}
          >
            {description || "توضیحاتی برای این محصول ثبت نشده."}
          </Typography>
        )}

        {tab === attributesTabIndex && (
          <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
            {attributes.map((attr, idx) => (
              <Box
                key={attr.id}
                sx={{
                  display: "flex",
                  px: 2,
                  py: 1.5,
                  borderBottom:
                    idx < attributes.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                  bgcolor: idx % 2 === 0 ? "background.default" : "transparent",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ width: 160, flexShrink: 0 }}
                >
                  {attr.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {attr.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {tab === reviewsTabIndex && (
          <ProductReviewsSection
            productId={productId}
            averageRating={averageRating}
            reviewsCount={reviewsCount}
          />
        )}
      </Box>
    </Box>
  );
}
