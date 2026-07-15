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
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { adminAPI } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/admin/_components/AdminActivityLogsContent.tsx
|--------------------------------------------------------------------------
*/

const loggableTypeLabels: Record<string, string> = {
  product: "محصول",
  category: "دسته‌بندی",
  brand: "برند",
  order: "سفارش",
};

const actionLabels: Record<
  string,
  { label: string; color: "success" | "info" | "error" }
> = {
  created: { label: "ایجاد", color: "success" },
  updated: { label: "ویرایش", color: "info" },
  deleted: { label: "حذف", color: "error" },
};

type LogRow = {
  id: number;
  loggable_type: string;
  loggable_id: number;
  action: string;
  changes: Record<string, any>;
  created_at: string;
  user: { id: number; name: string; role: string } | null;
};

type UserOption = { id: number; name: string; phone: string | null };

export function AdminActivityLogsContent() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  const [typeFilter, setTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const [selectedLog, setSelectedLog] = useState<LogRow | null>(null);

  const load = () => {
    setLogs(null);
    adminAPI.activityLogs
      .list({
        loggable_type: typeFilter || undefined,
        action: actionFilter || undefined,
        user_id: selectedUser?.id,
        page: page + 1,
        per_page: rowsPerPage,
      } as any)
      .then((res) => {
        setLogs(res.data.data);
        setTotal(res.data.total);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, actionFilter, selectedUser, page, rowsPerPage]);

  const handleUserSearch = (query: string) => {
    setUserSearchLoading(true);
    adminAPI.users
      .search(query)
      .then((res) => setUserOptions(res.data.data))
      .finally(() => setUserSearchLoading(false));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        لاگ تغییرات
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>نوع</InputLabel>
          <Select
            label="نوع"
            value={typeFilter}
            onChange={(e) => {
              setPage(0);
              setTypeFilter(e.target.value);
            }}
          >
            <MenuItem value="">همه</MenuItem>
            {Object.entries(loggableTypeLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>عملیات</InputLabel>
          <Select
            label="عملیات"
            value={actionFilter}
            onChange={(e) => {
              setPage(0);
              setActionFilter(e.target.value);
            }}
          >
            <MenuItem value="">همه</MenuItem>
            {Object.entries(actionLabels).map(([value, { label }]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          options={userOptions}
          loading={userSearchLoading}
          getOptionLabel={(u) => `${u.name}${u.phone ? ` (${u.phone})` : ""}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          value={selectedUser}
          onChange={(_, newValue) => {
            setPage(0);
            setSelectedUser(newValue);
          }}
          onOpen={() => handleUserSearch("")}
          onInputChange={(_, newInput) => handleUserSearch(newInput)}
          noOptionsText="کاربری پیدا نشد"
          sx={{ minWidth: 220 }}
          renderInput={(params) => (
            <TextField {...params} label="فیلتر کاربر" size="small" />
          )}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>تاریخ</TableCell>
              <TableCell>کاربر</TableCell>
              <TableCell>عملیات</TableCell>
              <TableCell>مورد</TableCell>
              <TableCell align="center">جزئیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs === null ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">لاگی یافت نشد</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const action = actionLabels[log.action] || {
                  label: log.action,
                  color: "info" as const,
                };

                return (
                  <TableRow key={log.id} hover>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
                    <TableCell>{log.user?.name || "سیستم"}</TableCell>
                    <TableCell>
                      <Chip
                        label={action.label}
                        color={action.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {loggableTypeLabels[log.loggable_type] ||
                        log.loggable_type}{" "}
                      #{log.loggable_id}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedLog(log)}
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
          rowsPerPageOptions={[15, 30, 50]}
          labelRowsPerPage="ردیف در صفحه"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} از ${count}`
          }
        />
      </TableContainer>

      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>جزئیات تغییرات</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            dir="ltr"
            sx={{
              bgcolor: "background.default",
              p: 2,
              borderRadius: 2,
              overflowX: "auto",
              fontSize: "0.8rem",
              direction: "ltr",
              unicodeBidi: "plaintext",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {selectedLog ? JSON.stringify(selectedLog.changes, null, 2) : ""}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
