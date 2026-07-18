"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  Stack,
  Badge,
  Typography,
  Divider,
} from "@mui/material";
import {
  Search,
  ShoppingCart,
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

function getChildren(categories: ServerCategory[], parentId: number | null) {
  return categories.filter((c) => c.parent_id === parentId);
}

function CategoryColumn({
  items,
  categories,
  activeId,
  onHoverItem,
  onNavigate,
}: {
  items: ServerCategory[];
  categories: ServerCategory[];
  activeId: number | null;
  onHoverItem: (category: ServerCategory) => void;
  onNavigate: () => void;
}) {
  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        py: 1,
        borderInlineEnd: "1px solid",
        borderColor: "divider",
        maxHeight: 420,
        overflowY: "auto",
      }}
    >
      {items.map((item, idx) => {
        const hasChildren = getChildren(categories, item.id).length > 0;
        const isActive = activeId === item.id;

        return (
          <Box
            key={item.id}
            component={NextLink}
            href={`/category/${item.slug}`}
            onClick={onNavigate}
            onMouseEnter={() => onHoverItem(item)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1,
              textDecoration: "none",
              color: isActive ? "primary.main" : "text.primary",
              bgcolor: isActive ? "rgba(30,58,138,0.06)" : "transparent",
              fontWeight: isActive ? 700 : 400,
              fontSize: "0.875rem",
              transition: "background-color .15s, color .15s",
              borderBottom: idx < items.length - 1 ? "1px solid" : "none",
              borderColor: "divider",
            }}
          >
            {item.name}
            {hasChildren && (
              <KeyboardArrowDown
                fontSize="small"
                sx={{ transform: "rotate(90deg)", opacity: 0.5 }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function DesktopCategoriesMegaMenu({
  categories,
  headerRef,
}: {
  categories: ServerCategory[];
  headerRef: React.RefObject<HTMLElement>;
}) {
  const [open, setOpen] = useState(false);
  const [hoverPath, setHoverPath] = useState<ServerCategory[]>([]);
  const [anchorRect, setAnchorRect] = useState<{
    top: number;
    start: number;
    headerBottom: number;
  } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const roots = getChildren(categories, null);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const startOffset = document.documentElement.clientWidth - rect.right;
      const headerBottom =
        headerRef.current?.getBoundingClientRect().bottom ?? rect.bottom;
      setAnchorRect({ top: rect.bottom + 8, start: startOffset, headerBottom });
    }
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setHoverPath([]);
    }, 150);
  };
  const handleClose = () => {
    setOpen(false);
    setHoverPath([]);
  };
  const handleHoverAtLevel = (level: number, category: ServerCategory) => {
    setHoverPath((prev) => [...prev.slice(0, level), category]);
  };

  if (roots.length === 0) return null;

  const columns: {
    items: ServerCategory[];
    activeId: number | null;
    level: number;
  }[] = [{ items: roots, activeId: hoverPath[0]?.id ?? null, level: 0 }];
  hoverPath.forEach((node, idx) => {
    const children = getChildren(categories, node.id);
    if (children.length > 0) {
      columns.push({
        items: children,
        activeId: hoverPath[idx + 1]?.id ?? null,
        level: idx + 1,
      });
    }
  });

  return (
    <Box
      ref={anchorRef}
      sx={{ display: { xs: "none", md: "block" } }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Button
        endIcon={
          <KeyboardArrowDown
            fontSize="small"
            sx={{
              transition: "transform .2s",
              transform: open ? "rotate(180deg)" : "none",
            }}
          />
        }
        startIcon={<Category fontSize="small" />}
        variant="outlined"
        color="inherit"
        size="small"
        sx={{ borderColor: "divider", color: "text.primary" }}
      >
        دسته‌بندی محصولات
      </Button>

      {open &&
        anchorRect &&
        createPortal(
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 1250,
              pointerEvents: "none",
            }}
          >
            <Box
              onClick={handleClose}
              sx={{
                position: "fixed",
                top: anchorRect.headerBottom,
                insetInline: 0,
                bottom: 0,
                bgcolor: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(6px)",
                pointerEvents: "auto",
              }}
            />
            <Box
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              style={{
                position: "absolute",
                top: anchorRect.top,
                right: anchorRect.start,
                pointerEvents: "auto",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  maxWidth: "90vw",
                  animation: "megaMenuFadeIn .2s ease-out",
                  "@keyframes megaMenuFadeIn": {
                    from: { opacity: 0, transform: "translateY(-6px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                {columns.map((col) => (
                  <CategoryColumn
                    key={col.level}
                    items={col.items}
                    categories={categories}
                    activeId={col.activeId}
                    onHoverItem={(item) => handleHoverAtLevel(col.level, item)}
                    onNavigate={handleClose}
                  />
                ))}
              </Box>
            </Box>
          </Box>,
          document.body,
        )}
    </Box>
  );
}

export function SiteHeader({
  categories = [],
}: {
  categories?: ServerCategory[];
}) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItemTypesCount = useCartStore((s) => s.items.length);
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [search, setSearch] = useState("");
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);

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
      ref={headerRef}
      sx={{ position: "sticky", top: 0, zIndex: 10 }}
    >
      {/* نوار باریک بالا - فقط دسکتاپ */}
      <Box
        sx={{
          bgcolor: "secondary.main",
          color: "#fff",
          display: { xs: "none", md: "block" },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 0.75,
              fontSize: "0.8rem",
            }}
          >
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center", opacity: 0.9 }}
              >
                <Phone sx={{ fontSize: 15 }} />
                <Typography variant="caption">
                  پشتیبانی: ۰۲۱-۹۱۰۰۰۰۰۰
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center", opacity: 0.9 }}
              >
                <LocalShipping sx={{ fontSize: 15 }} />
                <Typography variant="caption">ارسال به سراسر کشور</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2.5}>
              <Box
                component={NextLink}
                href="/about"
                sx={{
                  color: "#fff",
                  opacity: 0.85,
                  textDecoration: "none",
                  fontSize: "0.8rem",
                }}
              >
                درباره‌ی ما
              </Box>
              <Box
                component={NextLink}
                href="/articles"
                sx={{
                  color: "#fff",
                  opacity: 0.85,
                  textDecoration: "none",
                  fontSize: "0.8rem",
                }}
              >
                بلاگ
              </Box>
              <Box
                component={NextLink}
                href="/contact"
                sx={{
                  color: "#fff",
                  opacity: 0.85,
                  textDecoration: "none",
                  fontSize: "0.8rem",
                }}
              >
                تماس با ما
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* نوار اصلی */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.75 }}>
            <Box
              component={NextLink}
              href="/"
              sx={{
                fontWeight: 800,
                fontSize: "1.35rem",
                color: "primary.main",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              یدکی
            </Box>

            <DesktopCategoriesMegaMenu
              categories={categories}
              headerRef={headerRef}
            />

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <Button
                component={NextLink}
                href="/products"
                color="inherit"
                size="small"
              >
               فروشگاه
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
              sx={{ flex: 1, maxWidth: 440, mx: "auto" }}
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

            {/* دسکتاپ: سبد و حساب کاربری همینجا. موبایل: هر دو توی نوار پایین هستن */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              <IconButton component={NextLink} href="/cart">
                <Badge
                  badgeContent={mounted ? cartItemTypesCount : 0}
                  color="primary"
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {user ? (
                <>
                  <IconButton
                    onClick={(e) => setAccountAnchor(e.currentTarget)}
                  >
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
                    <MenuItem
                      component={NextLink}
                      href="/account/favorites"
                      onClick={() => setAccountAnchor(null)}
                    >
                      علاقه‌مندی‌های من
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={handleLogout}
                      sx={{ color: "error.main" }}
                    >
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
                  ورود / ثبت‌نام
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
