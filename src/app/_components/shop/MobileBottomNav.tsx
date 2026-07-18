"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Typography, Badge, IconButton } from "@mui/material";
import {
  Home,
  Apps,
  ShoppingCart,
  Article,
  Person,
  Close,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { ServerCategory } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/MobileBottomNav.tsx
|--------------------------------------------------------------------------
| ناوبری ثابت پایین صفحه، فقط موبایل. دکمه‌ی «دسته‌بندی‌ها» یه Drawer از
| راست باز می‌کنه که به‌جای آکاردئون، رفتار drill-down داره: کلیک روی یه
| دسته‌ی دارای زیرمجموعه، کل لیست رو با زیرمجموعه‌هاش عوض می‌کنه (با
| دکمه‌ی برگشت بالا)، نه اینکه inline باز بشه.
*/

function getChildren(categories: ServerCategory[], parentId: number | null) {
  return categories.filter((c) => c.parent_id === parentId);
}

function CategoryDrawer({
  categories,
  open,
  onClose,
}: {
  categories: ServerCategory[];
  open: boolean;
  onClose: () => void;
}) {
  const [activeParent, setActiveParent] = useState<ServerCategory | null>(null);

  useEffect(() => {
    if (!open) setActiveParent(null);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const roots = getChildren(categories, null);
  const currentList = activeParent
    ? getChildren(categories, activeParent.id)
    : roots;

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 1300 }}>
      <Box
        onClick={onClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          insetBlock: 0,
          insetInlineStart: 0,
          width: 280,
          maxWidth: "85vw",
          bgcolor: "background.paper",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInFromEnd .25s cubic-bezier(.16,1,.3,1)",
          "@keyframes slideInFromEnd": {
            from: { transform: "translateX(-100%)" },
            to: { transform: "translateX(0)" },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(30,58,138,0.04)",
            flexShrink: 0,
          }}
        >
          {activeParent ? (
            <Box
              component="button"
              onClick={() => setActiveParent(null)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "primary.main",
                bgcolor: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              <ChevronRight fontSize="small" />
              {activeParent.name}
            </Box>
          ) : (
            <Typography sx={{ fontWeight: 700 }}>دسته‌بندی‌ها</Typography>
          )}
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {activeParent && (
            <Box
              component={NextLink}
              href={`/category/${activeParent.slug}`}
              onClick={onClose}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                color: "primary.main",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              همه‌ی {activeParent.name}
              <ChevronLeft fontSize="small" />
            </Box>
          )}

          {currentList.map((category) => {
            const children = getChildren(categories, category.id);
            const hasChildren = children.length > 0;

            return hasChildren ? (
              <Box
                key={category.id}
                component="button"
                onClick={() => setActiveParent(category)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  px: 2,
                  py: 1.75,
                  bgcolor: "transparent",
                  border: "none",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "text.primary",
                  fontFamily: "inherit",
                }}
              >
                {category.name}
                <ChevronLeft fontSize="small" sx={{ color: "text.disabled" }} />
              </Box>
            ) : (
              <Box
                key={category.id}
                component={NextLink}
                href={`/category/${category.slug}`}
                onClick={onClose}
                sx={{
                  display: "block",
                  px: 2,
                  py: 1.75,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  fontSize: "0.875rem",
                  color: "text.primary",
                  textDecoration: "none",
                }}
              >
                {category.name}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export function MobileBottomNav({
  categories,
}: {
  categories: ServerCategory[];
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const cartItemTypesCount = useCartStore((s) => s.items.length);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    setCategoriesOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const itemSx = (active: boolean) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0.5,
    py: 1.25,
    color: active ? "primary.main" : "text.secondary",
    textDecoration: "none",
    position: "relative",
    bgcolor: "transparent",
    border: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  });

  const Indicator = ({ active }: { active: boolean }) => (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        width: 32,
        height: 2,
        borderRadius: 999,
        bgcolor: "primary.main",
        opacity: active ? 1 : 0,
        transition: "opacity .2s",
      }}
    />
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          bottom: 0,
          insetInline: 0,
          zIndex: 1200,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          justifyContent: "space-around",
        }}
      >
        <Box component={NextLink} href="/" sx={itemSx(isActive("/"))}>
          <Indicator active={isActive("/")} />
          <Home fontSize="small" />
          <Typography sx={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}>
            خانه
          </Typography>
        </Box>

        <Box
          component="button"
          onClick={() => setCategoriesOpen(true)}
          sx={itemSx(categoriesOpen || isActive("/category"))}
        >
          <Indicator active={categoriesOpen || isActive("/category")} />
          <Apps fontSize="small" />
          <Typography sx={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}>
            دسته‌بندی‌ها
          </Typography>
        </Box>

        <Box component={NextLink} href="/cart" sx={itemSx(isActive("/cart"))}>
          <Indicator active={isActive("/cart")} />
          <Badge
            badgeContent={mounted ? cartItemTypesCount : 0}
            color="primary"
          >
            <ShoppingCart fontSize="small" />
          </Badge>
          <Typography sx={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}>
            سبد خرید
          </Typography>
        </Box>

        <Box
          component={NextLink}
          href="/articles"
          sx={itemSx(isActive("/articles"))}
        >
          <Indicator active={isActive("/articles")} />
          <Article fontSize="small" />
          <Typography sx={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}>
            مقالات
          </Typography>
        </Box>

        <Box
          component={NextLink}
          href={user ? "/account/profile" : "/login"}
          sx={itemSx(isActive("/account") || isActive("/login"))}
        >
          <Indicator active={isActive("/account") || isActive("/login")} />
          <Person fontSize="small" />
          <Typography sx={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}>
            {user ? "پروفایل" : "ورود"}
          </Typography>
        </Box>
      </Box>

      <CategoryDrawer
        categories={categories}
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
      />

      {/* فاصله‌ی خالی پایین صفحه به‌اندازه‌ی ارتفاع نوار - تا محتوا زیرش گم نشه */}
      <Box sx={{ height: 64, display: { xs: "block", md: "none" } }} />
    </>
  );
}
