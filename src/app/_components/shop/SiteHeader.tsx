"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  Stack,
  Badge,
  Typography,
  Divider,
} from "@mui/material";
import {
  Search,
  ShoppingCart,
  Menu as MenuIcon,
  Close,
  KeyboardArrowDown,
  Category,
  Phone,
  LocalShipping,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { ServerCategory } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/SiteHeader.tsx
|--------------------------------------------------------------------------
*/

export function SiteHeader({ categories = [] }: { categories?: ServerCategory[] }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItemTypesCount = useCartStore((s) => s.items.length);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [search, setSearch] = useState("");
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [categoriesAnchor, setCategoriesAnchor] = useState<HTMLElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = async () => {
    setAccountAnchor(null);
    await logout();
    router.push("/");
  };

  return (
    <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 10 }}>
      {/* نوار باریک بالا */}
      <Box sx={{ bgcolor: "secondary.main", color: "#fff", display: { xs: "none", md: "block" } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.75, fontSize: "0.8rem" }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", opacity: 0.9 }}>
                <Phone sx={{ fontSize: 15 }} />
                <Typography variant="caption">پشتیبانی: ۰۲۱-۹۱۰۰۰۰۰۰</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", opacity: 0.9 }}>
                <LocalShipping sx={{ fontSize: 15 }} />
                <Typography variant="caption">ارسال به سراسر کشور</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2.5}>
              <Box component={NextLink} href="/about" sx={{ color: "#fff", opacity: 0.85, textDecoration: "none", fontSize: "0.8rem" }}>
                درباره‌ی ما
              </Box>
              <Box component={NextLink} href="/articles" sx={{ color: "#fff", opacity: 0.85, textDecoration: "none", fontSize: "0.8rem" }}>
                بلاگ
              </Box>
              <Box component={NextLink} href="/contact" sx={{ color: "#fff", opacity: 0.85, textDecoration: "none", fontSize: "0.8rem" }}>
                تماس با ما
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* نوار اصلی */}
      <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.75 }}>
            <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ display: { xs: "flex", md: "none" } }}>
              <MenuIcon />
            </IconButton>

            <Box
              component={NextLink}
              href="/"
              sx={{ fontWeight: 800, fontSize: "1.35rem", color: "primary.main", textDecoration: "none", flexShrink: 0 }}
            >
              یدکی
            </Box>

            {/* دراپ‌داون دسته‌بندی */}
            {categories.length > 0 && (
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Button
                  onClick={(e) => setCategoriesAnchor(e.currentTarget)}
                  startIcon={<Category fontSize="small" />}
                  endIcon={<KeyboardArrowDown fontSize="small" />}
                  variant="outlined"
                  color="inherit"
                  size="small"
                  sx={{ borderColor: "divider", color: "text.primary" }}
                >
                  دسته‌بندی
                </Button>
                <Menu
                  anchorEl={categoriesAnchor}
                  open={!!categoriesAnchor}
                  onClose={() => setCategoriesAnchor(null)}
                >
                  {categories.map((category) => (
                    <MenuItem
                      key={category.id}
                      component={NextLink}
                      href={`/products?category_id=${category.id}`}
                      onClick={() => setCategoriesAnchor(null)}
                    >
                      {category.name}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            )}

            <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
              <Button component={NextLink} href="/products" color="inherit" size="small">
                محصولات
              </Button>
              <Button component={NextLink} href="/articles" color="inherit" size="small">
                مقالات
              </Button>
            </Stack>

            <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1, maxWidth: 440, mx: "auto" }}>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی قطعه، برند، خودرو..."
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="submit" size="small">
                          <Search fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <IconButton component={NextLink} href="/cart">
              <Badge badgeContent={mounted ? cartItemTypesCount : 0} color="primary">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {user ? (
              <>
                <IconButton onClick={(e) => setAccountAnchor(e.currentTarget)}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.9rem" }}>
                    {user.name?.[0]}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={accountAnchor} open={!!accountAnchor} onClose={() => setAccountAnchor(null)}>
                  <MenuItem component={NextLink} href="/account/profile" onClick={() => setAccountAnchor(null)}>
                    پروفایل من
                  </MenuItem>
                  <MenuItem component={NextLink} href="/account/orders" onClick={() => setAccountAnchor(null)}>
                    سفارش‌های من
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                    خروج از حساب
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button component={NextLink} href="/login" variant="contained" disableElevation size="small">
                ورود / ثبت‌نام
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* منوی موبایل */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 260, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Stack spacing={0.5}>
            <Button component={NextLink} href="/products" color="inherit" onClick={() => setMobileMenuOpen(false)} sx={{ justifyContent: "flex-start" }}>
              محصولات
            </Button>
            <Button component={NextLink} href="/articles" color="inherit" onClick={() => setMobileMenuOpen(false)} sx={{ justifyContent: "flex-start" }}>
              مقالات
            </Button>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, mb: 0.5 }}>
              دسته‌بندی‌ها
            </Typography>
            {categories.map((category) => (
              <Button
                key={category.id}
                component={NextLink}
                href={`/products?category_id=${category.id}`}
                color="inherit"
                onClick={() => setMobileMenuOpen(false)}
                sx={{ justifyContent: "flex-start" }}
              >
                {category.name}
              </Button>
            ))}
            <Divider sx={{ my: 1 }} />
            <Button component={NextLink} href="/about" color="inherit" onClick={() => setMobileMenuOpen(false)} sx={{ justifyContent: "flex-start" }}>
              درباره‌ی ما
            </Button>
            <Button component={NextLink} href="/contact" color="inherit" onClick={() => setMobileMenuOpen(false)} sx={{ justifyContent: "flex-start" }}>
              تماس با ما
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}