import { notFound } from "next/navigation";
import NextLink from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { getArticle, getArticles } from "@/lib/serverApi";
import { RelatedProductsCarousel } from "@/app/_components/shop/RelatedProductsCarousel";
import { NavigateBefore } from "@mui/icons-material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/(shop)/articles/[slug]/page.tsx
|--------------------------------------------------------------------------
| Server Component async جدا از صفحه‌ی لیست - SSR کامل و مستقل.
| چیدمان دوستونی: محتوای مقاله (راست) + Sidebar عمودی آخرین مقاله‌ها (چپ).
| «محصولات پیشنهادی» زیر مقاله از رابطه‌ی واقعی article.products میاد
| (بند ۶ سند).
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  return {
    title: article ? `${article.title} | یدکی` : "مقاله پیدا نشد | یدکی",
    description: article?.excerpt?.slice(0, 150),
  };
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(
    new Date(dateStr)
  );
}

function formatShortDate(dateStr: string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
    new Date(dateStr)
  );
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const otherArticles = await getArticles(8);
  const latestArticles = otherArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 6);
  const suggestedProducts = article.products || [];
  const displayDate = article.published_at || article.created_at;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        separator={<NavigateBefore fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Box
          component={NextLink}
          href="/"
          sx={{ color: "text.secondary", textDecoration: "none" }}
        >
          خانه
        </Box>
        <Box
          component={NextLink}
          href="/blog"
          sx={{ color: "text.secondary", textDecoration: "none" }}
        >
          مقالات
        </Box>
        <Typography
          color="text.primary"
          sx={{
            maxWidth: 240,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {article.title}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          gap: 4,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* محتوای اصلی - سمت راست (بزرگ‌تر) */}
        <Box sx={{ flex: "2 1 500px", minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              lineHeight: 1.5,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            {article.title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {formatDate(displayDate)}
            </Typography>
            {article.author && (
              <>
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: "text.disabled",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  نویسنده: {article.author.name}
                </Typography>
              </>
            )}
          </Box>

          {article.thumbnail_url && (
            <Box
              component="img"
              src={article.thumbnail_url}
              alt={article.title}
              sx={{
                width: "100%",
                maxHeight: 420,
                objectFit: "cover",
                borderRadius: 3,
                mb: 4,
                display: "block",
              }}
            />
          )}

          {article.content ? (
            <Box
              sx={{
                fontSize: "1rem",
                lineHeight: 2,
                color: "text.primary",
                "& p": { mb: 2 },
                "& h2, & h3": { fontWeight: 700, mt: 4, mb: 1.5 },
                "& img": { maxWidth: "100%", borderRadius: 2, my: 2 },
                "& a": { color: "primary.main" },
                "& ul, & ol": { pr: 3, mb: 2 },
              }}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <Typography color="text.secondary">
              محتوایی برای این مقاله ثبت نشده.
            </Typography>
          )}

          {/* محصولات پیشنهادی زیر مقاله (بند ۶ سند) */}
          {suggestedProducts.length > 0 && (
            <Box
              sx={{
                mt: 6,
                pt: 4,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                محصولات پیشنهادی
              </Typography>
              <RelatedProductsCarousel products={suggestedProducts} />
            </Box>
          )}
        </Box>

        {/* Sidebar عمودی - آخرین مقالات، سمت چپ */}
        {latestArticles.length > 0 && (
          <Box
            sx={{
              flex: "1 1 280px",
              maxWidth: { md: 300 },
              bgcolor: "background.paper",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 2.5,
              position: "sticky",
              top: 90,
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 2 }}>
              آخرین مقالات
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {latestArticles.map((item) => (
                <Box
                  key={item.id}
                  component={NextLink}
                  href={`/blog/${item.slug}`}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    textDecoration: "none",
                    color: "text.primary",
                    "&:hover .latest-article-title": { color: "primary.main" },
                  }}
                >
                  <Box
                    component="img"
                    src={item.thumbnail_url || undefined}
                    alt={item.title}
                    sx={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 2,
                      bgcolor: "background.default",
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      className="latest-article-title"
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1.5,
                        mb: 0.5,
                        transition: "color .15s",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatShortDate(item.published_at || item.created_at)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Button
              component={NextLink}
              href="/blog"
              variant="outlined"
              fullWidth
              sx={{ mt: 3 }}
            >
              مشاهده‌ی همه
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
