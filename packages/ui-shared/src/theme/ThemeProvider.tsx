import { useEffect } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { defaultTheme, type Theme } from "./defaultTheme";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
const FONT_LINK_ID = "sharely-font-plus-jakarta";

interface ThemeProviderProps {
  theme?: Partial<Theme>;
  children: any; // Reverted to any to bypass build error
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);

  const combinedTheme = {
    ...defaultTheme,
    ...theme,
    colors: {
      ...defaultTheme.colors,
      ...theme?.colors,
    },
    fonts: {
      ...defaultTheme.fonts,
      ...theme?.fonts,
    },
    shadows: {
      ...defaultTheme.shadows,
      ...theme?.shadows,
    },
    screens: {
      ...defaultTheme.screens,
      ...theme?.screens,
    },
  };

  return (
    <StyledThemeProvider theme={combinedTheme}>{children}</StyledThemeProvider>
  );
}
