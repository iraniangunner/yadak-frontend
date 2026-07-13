"use client";

import {
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { Box, TextField } from "@mui/material";

/*
|--------------------------------------------------------------------------
| مسیر فایل: src/app/_components/auth/OtpCodeInput.tsx
|--------------------------------------------------------------------------
| یه ورودی کد تأیید با باکس‌های جدا (مثل همه‌ی OTP های استاندارد)، ولی
| چون فرم‌ها اینجا Server Action هستن (نه state کنترل‌شده‌ی معمولی)، مقدار
| نهایی رو توی یه <input type="hidden"> با همون name ذخیره می‌کنیم تا
| موقع submit شدن فرم، داخل FormData باشه.
*/

type OtpCodeInputProps = {
  name: string;
  length?: number;
  autoFocus?: boolean;
};

export function OtpCodeInput({
  name,
  length = 6,
  autoFocus = true,
}: OtpCodeInputProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");

  const setDigitAt = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/[^0-9]/g, "");

    if (value.length > 1) {
      // یعنی کاربر چندتا رقم رو یک‌جا (مثلاً با پیست) توی یه باکس ریخته
      distributeFrom(index, value);
      return;
    }

    setDigitAt(index, value);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setDigitAt(index - 1, "");
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;

    e.preventDefault();
    distributeFrom(index, pasted);
  };

  const distributeFrom = (startIndex: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      let cursor = startIndex;

      for (const char of value) {
        if (cursor >= length) break;
        next[cursor] = char;
        cursor++;
      }

      const focusIndex = Math.min(cursor, length - 1);
      requestAnimationFrame(() => inputsRef.current[focusIndex]?.focus());

      return next;
    });
  };

  return (
    <Box dir="ltr" sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
      {digits.map((digit, index) => (
        <TextField
          key={index}
          inputRef={(el) => (inputsRef.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          autoFocus={autoFocus && index === 0}
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              maxLength: 1,
              style: {
                textAlign: "center",
                fontSize: "1.5rem",
                padding: "10px 0",
              },
            },
          }}
          sx={{ width: 48 }}
        />
      ))}

      <input type="hidden" name={name} value={code} />
    </Box>
  );
}
