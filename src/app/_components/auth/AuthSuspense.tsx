"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

export default function AuthSuspense({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      }
    >
      {children}
    </Suspense>
  );
}
