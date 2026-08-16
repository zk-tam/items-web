"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "items-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const transitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    const timeout = window.setTimeout(() => {
      setTheme(initialTheme);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => () => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    document.documentElement.classList.remove("items-theme-transition");
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
      root.classList.remove("items-theme-transition");
      void root.offsetWidth;
      root.classList.add("items-theme-transition");
      transitionTimerRef.current = window.setTimeout(() => {
        root.classList.remove("items-theme-transition");
        transitionTimerRef.current = null;
      }, 280);
    }

    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return value;
}
