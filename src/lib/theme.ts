import { createTheme } from "@mui/material/styles";
import { faIR } from "@mui/material/locale";

/**
 * MUI به‌صورت پیش‌فرض کلید palette.accent رو نمی‌شناسه؛ این بلاک به
 * TypeScript می‌گه که چنین کلیدی داریم، وگرنه theme.palette.accent
 * توی کدهای دیگه خطای type می‌ده.
 */
declare module "@mui/material/styles" {
  interface Palette {
    accent: Palette["primary"];
  }
  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
  }
}

// این بلاک هم لازمه تا بشه پراپ رنگ رو مستقیم روی کامپوننت‌هایی مثل
// <Button color="accent" /> استفاده کرد (اختیاریه، ولی مفیده).
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}
declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    accent: true;
  }
}

const theme = createTheme(
  {
    direction: "rtl",
    palette: {
      mode: "light",
      primary: {
        main: "#1E3A8A", // آبی تیره
      },
      secondary: {
        main: "#374151", // خاکستری تیره
      },
      accent: {
        main: "#F97316", // نارنجی - برای CTA ها و نشان‌های ویژه
        contrastText: "#FFFFFF",
      },
      background: {
        default: "#F8FAFC",
        paper: "#FFFFFF", // Surface
      },
      text: {
        primary: "#111827",
      },
      divider: "#E5E7EB",
    },
    typography: {
      fontFamily: "var(--font-iranyekan), Arial, sans-serif",
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  },
  faIR
);

export default theme;
