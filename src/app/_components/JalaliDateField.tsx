"use client";
import { useEffect, useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { TextField } from "@mui/material";
/* |-------------------------------------------------------------------------- | مسیر فایل: src/app/admin/_components/JalaliDateField.tsx |-------------------------------------------------------------------------- | کاربر تاریخ رو با تقویم جلالی می‌بینه/انتخاب می‌کنه، ولی خروجی onChange | همیشه یه رشته‌ی ISO میلادی (YYYY-MM-DD) هست - چون بک‌اند لاراول با | $request->date() این فرمت رو انتظار داره، نه جلالی. | | defaultValue (اختیاری): برای حالت ویرایش، وقتی از قبل یه تاریخ میلادی | (مثلاً از رکورد موجود) داریم و می‌خوایم فیلد از همون اول پرشده باز بشه. */ export function JalaliDateField({
  label,
  onChange,
  defaultValue,
}: {
  label: string;
  onChange: (isoDate: string) => void;
  defaultValue?: string | null;
}) {
  const [date, setDate] = useState<DateObject | null>(null);

  useEffect(() => {
    if (!defaultValue) {
      setDate(null);
      return;
    }
  
    setDate(
      new DateObject({
        date: defaultValue,
        format: "YYYY-MM-DD",
        calendar: gregorian,
      }).convert(persian)
    );
  }, [defaultValue]);
  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      value={date}
      zIndex={99999}
      portal
      containerStyle={{ zIndex: 1500 }}
      onChange={(d: DateObject | null) => {
        setDate(d);
        if (!d) {
          onChange("");
          return;
        }
        const iso = d
          .convert(gregorian)
          .format("YYYY-MM-DD")
          .replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)));
        onChange(iso);
      }}
      render={(value: string, openCalendar: () => void) => (
        <TextField
          label={label}
          value={value}
          onClick={openCalendar}
          size="small"
          sx={{ minWidth: 160 }}
          slotProps={{ htmlInput: { readOnly: true } }}
        />
      )}
    />
  );
}
