"use client";

import { useState, useEffect, useRef } from "react";
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
  Collapse,
  Popper,
  Fade,
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
  ExpandMore,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { ServerCategory } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/SiteHeader.tsx
|--------------------------------------------------------------------------
| دسکتاپ: منوی دسته‌بندی با هاور باز می‌شه (نه کلیک) + پس‌زمینه‌ی مات
| (backdrop-blur) پشتش.
| موبایل: دسته‌بندی‌ها به‌صورت آکاردئون تودرتو (بازگشتی) توی Drawer.
| کلیک روی هر دسته (توی هر دو حالت) می‌بره به /category/[slug].
*/

function getChildren(categories: ServerCategory[], parentId: number | null) {
  return categories.filter((c) => c.parent_id === parentId);
}

// ------------------------------------------------------------------
// مگامنوی دسکتاپ - هاور + پس‌زمینه‌ی مات
// ------------------------------------------------------------------
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
    <Fade in timeout={180}>
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
        {items.map((item) => {
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
    </Fade>
  );
}

function DesktopCategoriesMegaMenu({
  categories,
}: {
  categories: ServerCategory[];
}) {
  const [open, setOpen] = useState(false);
  // مسیر آیتم‌های هاورشده از سطح ۱ به بعد - مثلاً [سیستم ترمز, لنت ترمز]
  const [hoverPath, setHoverPath] = useState<ServerCategory[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const roots = getChildren(categories, null);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
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
      sx={{ display: { xs: "none", md: "block" }, position: "relative" }}
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
        دسته‌بندی
      </Button>

      {/* پس‌زمینه‌ی مات - فقط پشتِ صفحه */}
      {open && (
        <Box
          onClick={handleClose}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1250,
            bgcolor: "rgba(255,255,255,0.4)",
            backdropFilter: "blur(6px)",
          }}
        />
      )}

      {/* ⚠️ از Popper استفاده می‌کنیم (نه Collapse+absolute) چون Popper
          محتواش رو با یه portal واقعی مستقیم به body می‌بره - یعنی کاملاً
          بیرون از هر stacking context محلی می‌شینه، پس دیگه ممکن نیست
          پشتِ پس‌زمینه‌ی مات گیر بیفته یا توسط اون تار بشه. */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        sx={{ zIndex: 1251 }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={220}>
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
          </Fade>
        )}
      </Popper>
    </Box>
  );
}

// ------------------------------------------------------------------
// آکاردئون موبایل - بازگشتی (هر عمقی رو پشتیبانی می‌کنه)
// ------------------------------------------------------------------
function MobileCategoryAccordionItem({
  category,
  categories,
  depth,
  onNavigate,
}: {
  category: ServerCategory;
  categories: ServerCategory[];
  depth: number;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const children = getChildren(categories, category.id);
  const hasChildren = children.length > 0;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {depth > 0 && <Box sx={{ width: depth * 16, flexShrink: 0 }} />}
        <Button
          component={NextLink}
          href={`/category/${category.slug}`}
          onClick={onNavigate}
          color="inherit"
          sx={{
            flex: 1,
            justifyContent: "flex-start",
            fontWeight: depth === 0 ? 700 : 400,
          }}
        >
          {category.name}
        </Button>
        {hasChildren && (
          <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
            <ExpandMore
              fontSize="small"
              sx={{
                transition: "transform .2s",
                transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            />
          </IconButton>
        )}
      </Box>

      {hasChildren && (
        <Collapse in={expanded}>
          <Box>
            {children.map((child) => (
              <MobileCategoryAccordionItem
                key={child.id}
                category={child}
                categories={categories}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </Box>
        </Collapse>
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

  const roots = getChildren(categories, null);

  return (
    <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 10 }}>
      {/* نوار باریک بالا */}
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
                fontSize: "1.35rem",
                color: "primary.main",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              یدکی
            </Box>

            <DesktopCategoriesMegaMenu categories={categories} />

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
                  <MenuItem
                    component={NextLink}
                    href="/account/favorites"
                    onClick={() => setAccountAnchor(null)}
                  >
                    علاقه‌مندی‌های من
                  </MenuItem>
                  <Divider />
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
                ورود / ثبت‌نام
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* منوی موبایل */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Stack spacing={0.5}>
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

            <Divider sx={{ my: 1 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 1.5, mb: 0.5 }}
            >
              دسته‌بندی‌ها
            </Typography>
            {roots.map((root) => (
              <MobileCategoryAccordionItem
                key={root.id}
                category={root}
                categories={categories}
                depth={0}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            ))}

            <Divider sx={{ my: 1 }} />
            <Button
              component={NextLink}
              href="/about"
              color="inherit"
              onClick={() => setMobileMenuOpen(false)}
              sx={{ justifyContent: "flex-start" }}
            >
              درباره‌ی ما
            </Button>
            <Button
              component={NextLink}
              href="/contact"
              color="inherit"
              onClick={() => setMobileMenuOpen(false)}
              sx={{ justifyContent: "flex-start" }}
            >
              تماس با ما
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
