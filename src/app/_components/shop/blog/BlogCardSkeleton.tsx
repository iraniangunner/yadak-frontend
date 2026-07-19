import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/shop/blog/BlogCardSkeleton.tsx
|--------------------------------------------------------------------------
*/

export function BlogCardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <Skeleton variant="rectangular" height={170} animation="wave" />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width={80} height={18} animation="wave" />
        <Skeleton variant="text" width="90%" height={24} animation="wave" />
        <Skeleton variant="text" width="60%" height={24} animation="wave" />
        <Skeleton
          variant="text"
          width="100%"
          height={18}
          animation="wave"
          sx={{ mt: 1 }}
        />
      </Box>
    </Box>
  );
}
