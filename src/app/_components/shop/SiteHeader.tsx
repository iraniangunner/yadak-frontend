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
} from "@mui/material";
import {
  Search,
  ShoppingCart,
  Menu as MenuIcon,
  Close,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/SiteHeader.tsx
|--------------------------------------------------------------------------
*/

export function SiteHeader() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.totalCount());
  const router = useRouter();

  // چون سبد خرید از localStorage خونده می‌شه، سرور همیشه صفر می‌بینه؛
  // برای جلوگیری از hydration mismatch، عدد واقعی رو فقط بعد از mount
  // شدن کامپوننت سمت کلاینت نشون می‌دیم.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [search, setSearch] = useState("");
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
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
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            sx={{ display: { xs: "flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={NextLink}
            href="/"
            sx={{
              fontWeight: 800,
              fontSize: "1.25rem",
              color: "primary.main",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            یدکی
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            <Button
              component={NextLink}
              href="/products"
              color="inherit"
              size="small"
            >
              محصولات
            </Button>
            <Button
              component={NextLink}
              href="/articles"
              color="inherit"
              size="small"
            >
              مقالات
            </Button>
          </Stack>

          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ flex: 1, maxWidth: 480, mx: "auto" }}
          >
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
            <Badge badgeContent={mounted ? cartCount : 0} color="primary">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {user ? (
            <>
              <IconButton onClick={(e) => setAccountAnchor(e.currentTarget)}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: "0.9rem",
                  }}
                >
                  {user.name?.[0]}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={accountAnchor}
                open={!!accountAnchor}
                onClose={() => setAccountAnchor(null)}
              >
                <MenuItem
                  component={NextLink}
                  href="/account/profile"
                  onClick={() => setAccountAnchor(null)}
                >
                  پروفایل من
                </MenuItem>
                <MenuItem
                  component={NextLink}
                  href="/account/orders"
                  onClick={() => setAccountAnchor(null)}
                >
                  سفارش‌های من
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  خروج از حساب
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={NextLink}
              href="/login"
              variant="contained"
              disableElevation
              size="small"
            >
              ورود
            </Button>
          )}
        </Box>
      </Container>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 240, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Stack spacing={1}>
            <Button
              component={NextLink}
              href="/products"
              color="inherit"
              onClick={() => setMobileMenuOpen(false)}
              sx={{ justifyContent: "flex-start" }}
            >
              محصولات
            </Button>
            <Button
              component={NextLink}
              href="/articles"
              color="inherit"
              onClick={() => setMobileMenuOpen(false)}
              sx={{ justifyContent: "flex-start" }}
            >
              مقالات
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
