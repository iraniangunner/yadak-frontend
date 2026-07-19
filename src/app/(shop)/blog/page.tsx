import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { getArticlesFiltered } from "@/lib/serverApi";
import { BlogFilterAndGrid } from "@/app/_components/shop/blog/BlogFilterAndGrid";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/articles/page.tsx
|--------------------------------------------------------------------------
| Server Component async - صفحه‌ی اول مقالات مستقیم سمت سرور (SSR) fetch
| می‌شه. فیلتر+گرید توی یه کامپوننت کلاینتی واحد (BlogFilterAndGrid) هستن
| تا هم Skeleton (با useTransition) هم داده‌ی همیشه‌تازه (با key) درست
| کار کنن.
*/

export const metadata = {
  title: "مقالات و بلاگ | یدکی",
};

function buildQueryString(sp: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(sp).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const queryString = buildQueryString({
    search: sp.search,
    sort: sp.sort,
    per_page: "9",
    page: "1",
  });

  const articles = await getArticlesFiltered(queryString, 10);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        مقالات و بلاگ
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        نکات نگهداری خودرو، راهنمای خرید قطعات، و آموزش‌های کاربردی
      </Typography>

      <BlogFilterAndGrid
        key={`${sp.search || ""}-${sp.sort || ""}`}
        initialArticles={articles.data}
        initialTotal={articles.total}
        initialLastPage={articles.lastPage}
      />
    </Container>
  );
}
