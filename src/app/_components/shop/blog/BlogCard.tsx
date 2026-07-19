import NextLink from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ServerArticle } from "@/lib/serverApi";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/blog/BlogCard.tsx
|--------------------------------------------------------------------------
*/

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
    new Date(dateStr)
  );
}

export function BlogCard({ article }: { article: ServerArticle }) {
  const displayDate = article.published_at || article.created_at;
  return (
    <Box
      component={NextLink}
      href={`/blog/${article.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        textDecoration: "none",
        color: "text.primary",
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.06)",
        overflow: "hidden",
        transition: "box-shadow .2s, transform .2s",
        "&:hover": {
          boxShadow: "0 12px 28px -12px rgba(20,20,20,0.18)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        component="img"
        src={article.thumbnail_url || undefined}
        alt={article.title}
        sx={{
          width: "100%",
          height: 170,
          objectFit: "cover",
          bgcolor: "background.default",
          display: "block",
        }}
      />
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75 }}>
          {formatDate(displayDate)}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            mb: 1,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </Typography>
        {article.excerpt && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mt: "auto",
            }}
          >
            {article.excerpt}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
