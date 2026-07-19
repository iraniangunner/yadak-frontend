import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Build, ArrowForward, ArrowBack } from "@mui/icons-material";
import type { getArticles } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/Home/TipsSection.tsx
|--------------------------------------------------------------------------
*/
type Article = Awaited<ReturnType<typeof getArticles>>[number];

export function TipsSection({ articles }: { articles: Article[] }) {
  const listArticles = articles.slice(0, 4);
  const cardArticles = articles.slice(4, 6);

  if (listArticles.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 4, textAlign: "center" }}
      >
        لایف‌هک و نکات نگهداری خودرو
      </Typography>

      <Box
        sx={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}
      >
        <Box
          sx={{
            flex: "1 1 220px",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {listArticles.map((article) => (
            <Box
              key={article.id}
              component={NextLink}
              href={`/blog/${article.slug}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                textDecoration: "none",
                color: "text.primary",
                bgcolor: "background.paper",
                borderRadius: 2,
                p: 1.5,
                border: "1px solid rgba(15,23,42,0.06)",
                transition: "border-color .15s",
                "&:hover": { borderColor: "accent.main" },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "rgba(30,58,138,0.08)",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ArrowBack sx={{ fontSize: 16, transform: "scaleX(-1)" }} />
              </Box>
              <Typography variant="body2">{article.title}</Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            flex: "1 1 240px",
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 220,
              height: 260,
              borderRadius: 4,
              bgcolor: "rgba(30,58,138,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Build sx={{ fontSize: 90, color: "primary.main" }} />
          </Box>
        </Box>

        <Box
          sx={{
            flex: "1 1 260px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {cardArticles.map((article) => (
            <Box
              key={article.id}
              component={NextLink}
              href={`/blog/${article.slug}`}
              sx={{
                display: "flex",
                gap: 1.5,
                textDecoration: "none",
                color: "text.primary",
                bgcolor: "background.paper",
                borderRadius: 3,
                border: "1px solid rgba(15,23,42,0.06)",
                p: 1.5,
                alignItems: "center",
                transition: "border-color .15s",
                "&:hover": { borderColor: "accent.main" },
              }}
            >
              <Box
                component="img"
                src={article.thumbnail_url || undefined}
                alt={article.title}
                sx={{
                  width: 64,
                  height: 64,
                  objectFit: "cover",
                  borderRadius: 2,
                  bgcolor: "background.default",
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {article.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          component={NextLink}
          href="/blog"
          variant="contained"
          disableElevation
        >
          مشاهده‌ی بیشتر
        </Button>
      </Box>
    </Container>
  );
}
