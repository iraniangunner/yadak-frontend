"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Skeleton,
} from "@mui/material";
import { ArrowBackIos } from "@mui/icons-material";
import { vehiclesAPI, categoriesAPI, bannersAPI, productsAPI, articlesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/HomeContent.tsx
|--------------------------------------------------------------------------
*/

type Vehicle = { id: number; brand: string; model: string; generation: string | null; year_from: number | null; year_to: number | null };
type Category = { id: number; name: string; thumbnail_url: string | null };
type Banner = { id: number; title: string; image_url: string | null; link_url: string | null; product: { id: number; slug: string } | null };
type Product = { id: number; slug: string; title: string; price: number; final_price: number; thumbnail_url: string | null };
type Article = { id: number; slug: string; title: string; thumbnail_url: string | null };

function vehicleLabel(v: Vehicle) {
  let label = v.model;
  if (v.generation) label += ` (${v.generation})`;
  return label;
}

// ------------------------------------------------------------------
// بخش ۱: جستجوگر قطعه بر اساس خودرو - المان اصلی و شاخص صفحه
// ------------------------------------------------------------------
function VehicleFinder() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brand, setBrand] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  useEffect(() => {
    vehiclesAPI.list({ per_page: 200 }).then((res) => setVehicles(res.data.data));
  }, []);

  const brands = useMemo(() => Array.from(new Set(vehicles.map((v) => v.brand))), [vehicles]);
  const modelsForBrand = useMemo(() => vehicles.filter((v) => v.brand === brand), [vehicles, brand]);

  const handleSearch = () => {
    if (vehicleId) router.push(`/products?vehicle_id=${vehicleId}`);
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1E3A8A 0%, #374151 100%)",
        color: "#fff",
        py: { xs: 5, md: 7 },
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          قطعه‌ی خودروتون رو پیدا کنید
        </Typography>
        <Typography sx={{ opacity: 0.85, mb: 4 }}>
          برند و مدل خودروتون رو انتخاب کنید تا فقط قطعات سازگار باهاش رو ببینید
        </Typography>

        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <FormControl size="small" sx={{ flex: "1 1 200px" }}>
            <InputLabel sx={{ color: "text.primary" }}>برند خودرو</InputLabel>
            <Select
              label="برند خودرو"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setVehicleId("");
              }}
              sx={{ color: "text.primary" }}
            >
              {brands.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: "1 1 200px" }} disabled={!brand}>
            <InputLabel sx={{ color: "text.primary" }}>مدل</InputLabel>
            <Select
              label="مدل"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              sx={{ color: "text.primary" }}
            >
              {modelsForBrand.map((v) => (
                <MenuItem key={v.id} value={String(v.id)}>
                  {vehicleLabel(v)}
                  {(v.year_from || v.year_to) && ` — ${v.year_from ?? "؟"} تا ${v.year_to ?? "؟"}`}
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
            sx={{ flex: "0 0 auto", px: 4 }}
          >
            جستجوی قطعات
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

// ------------------------------------------------------------------
// بخش ۲: دسته‌بندی‌ها
// ------------------------------------------------------------------
function CategoriesSection() {
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    categoriesAPI.list().then((res) => setCategories(res.data.data));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        دسته‌بندی محصولات
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {categories === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={140} height={110} sx={{ borderRadius: 3 }} />
            ))
          : categories.map((category) => (
              <Box
                key={category.id}
                component={NextLink}
                href={`/products?category_id=${category.id}`}
                sx={{
                  width: 140,
                  textDecoration: "none",
                  color: "text.primary",
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  p: 2,
                  textAlign: "center",
                  transition: "box-shadow .15s",
                  "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
                }}
              >
                <Avatar
                  variant="rounded"
                  src={category.thumbnail_url || undefined}
                  sx={{ width: 48, height: 48, mx: "auto", mb: 1, bgcolor: "rgba(30,58,138,0.08)" }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {category.name}
                </Typography>
              </Box>
            ))}
      </Box>
    </Container>
  );
}

// ------------------------------------------------------------------
// بخش ۳: بنر تبلیغاتی
// ------------------------------------------------------------------
function BannersSection() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    bannersAPI.list().then((res) => setBanners(res.data.data));
  }, []);

  if (banners.length === 0) return null;

  const banner = banners[0];
  const href = banner.product ? `/products/${banner.product.slug}` : banner.link_url || "#";

  return (
    <Container maxWidth="lg" sx={{ pb: 5 }}>
      <Box
        component={NextLink}
        href={href}
        sx={{
          display: "block",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          bgcolor: "background.default",
        }}
      >
        <Box
          component="img"
          src={banner.image_url || undefined}
          alt={banner.title}
          sx={{ width: "100%", height: { xs: 140, md: 220 }, objectFit: "cover", display: "block" }}
        />
      </Box>
    </Container>
  );
}

// ------------------------------------------------------------------
// بخش ۴: محصولات
// ------------------------------------------------------------------
function ProductsSection() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    productsAPI.list({ per_page: 8 }).then((res) => setProducts(res.data.data));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          محصولات
        </Typography>
        <Button component={NextLink} href="/products" endIcon={<ArrowBackIos sx={{ fontSize: "0.8rem" }} />}>
          مشاهده‌ی همه
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {products === null
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={220} height={260} sx={{ borderRadius: 3 }} />
            ))
          : products.map((product) => (
              <Box
                key={product.id}
                component={NextLink}
                href={`/products/${product.slug}`}
                sx={{
                  width: 220,
                  textDecoration: "none",
                  color: "text.primary",
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  transition: "box-shadow .15s",
                  "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
                }}
              >
                <Box
                  component="img"
                  src={product.thumbnail_url || undefined}
                  alt={product.title}
                  sx={{ width: "100%", height: 160, objectFit: "cover", bgcolor: "background.default" }}
                />
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
                    {product.title}
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                    {formatPrice(product.final_price)}
                  </Typography>
                </Box>
              </Box>
            ))}
      </Box>
    </Container>
  );
}

// ------------------------------------------------------------------
// بخش ۵: مقالات
// ------------------------------------------------------------------
function ArticlesSection() {
  const [articles, setArticles] = useState<Article[] | null>(null);

  useEffect(() => {
    articlesAPI.list({ per_page: 3 }).then((res) => setArticles(res.data.data));
  }, []);

  if (articles !== null && articles.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        مقالات آموزشی
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {articles === null
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={280} height={180} sx={{ borderRadius: 3 }} />
            ))
          : articles.map((article) => (
              <Box
                key={article.id}
                component={NextLink}
                href={`/articles/${article.slug}`}
                sx={{
                  width: 280,
                  textDecoration: "none",
                  color: "text.primary",
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={article.thumbnail_url || undefined}
                  alt={article.title}
                  sx={{ width: "100%", height: 120, objectFit: "cover", bgcolor: "background.default" }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, p: 1.5 }}>
                  {article.title}
                </Typography>
              </Box>
            ))}
      </Box>
    </Container>
  );
}

export function HomeContent() {
  return (
    <Box>
      <VehicleFinder />
      <CategoriesSection />
      <BannersSection />
      <ProductsSection />
      <ArticlesSection />
    </Box>
  );
}