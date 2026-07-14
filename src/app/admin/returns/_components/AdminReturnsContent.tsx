"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { returnStatusLabels, getReturnStatusMeta } from "@/lib/returnStatus";
import { AdminReturnDetailContent } from "./AdminReturnDetailContent";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminReturnsContent.tsx
|--------------------------------------------------------------------------
*/

type ReturnRow = {
  id: number;
  quantity: number;
  reason: string;
  status: string;
  refund_amount: number | null;
  admin_note: string | null;
  created_at: string;
  user: { id: number; name: string; phone: string | null };
  order_item: { id: number; title: string; sku: string };
  order: { id: number; status: string };
};

export function AdminReturnsContent() {
  const [returns, setReturns] = useState<ReturnRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<ReturnRow | null>(null);

  const loadReturns = () => {
    setReturns(null);
    adminAPI.returns
      .list({
        status: statusFilter || undefined,
        page: page + 1,
        per_page: rowsPerPage,
      } as any)
      .then((res) => {
        setReturns(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter]);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        درخواست‌های مرجوعی
      </Typography>

      <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
        <InputLabel>وضعیت</InputLabel>
        <Select
          label="وضعیت"
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value);
          }}
        >
          <MenuItem value="">همه</MenuItem>
          {Object.entries(returnStatusLabels).map(([value, { label }]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شناسه</TableCell>
              <TableCell>مشتری</TableCell>
              <TableCell>کالا</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>تاریخ</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {returns === null ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    درخواستی یافت نشد
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              returns.map((row) => {
                const status = getReturnStatusMeta(row.status);

                return (
                  <TableRow key={row.id} hover>
                    <TableCell>#{row.id}</TableCell>
                    <TableCell>
                      {row.user.name}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {row.user.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {row.order_item.title}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        تعداد: {row.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(row.created_at)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => setSelected(row)}
                        title="مشاهده و رسیدگی"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="ردیف در صفحه"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} از ${count}`
          }
        />
      </TableContainer>

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          {selected && (
            <AdminReturnDetailContent
              returnItem={selected}
              onClose={() => setSelected(null)}
              onChanged={loadReturns}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
