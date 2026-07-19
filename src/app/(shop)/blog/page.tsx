import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { getArticlesFiltered } from "@/lib/serverApi";
import { BlogFilterBar } from "@/app/_components/shop/blog/BlogFilterBar";
import { BlogGridWithLoadMore } from "@/app/_components/shop/blog/BlogGridWithLoadMore";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/articles/page.tsx
|--------------------------------------------------------------------------
| دقیقاً هم‌الگو با /products: Server Component async، بدون loading.tsx،
| بدون useTransition. فقط با key (بر اساس search/sort) کامپوننت گرید رو
| موقع تغییر فیلتر مجبور به remount می‌کنه تا داده‌ی تازه‌ی SSR بگیره.
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

      <BlogFilterBar />

      <BlogGridWithLoadMore
        initialArticles={articles.data}
        initialTotal={articles.total}
        initialLastPage={articles.lastPage}
      />
    </Container>
  );
}