import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "data-bs-theme-mode";

const MODE_META = [
  {
    id: "light" as ThemeMode,
    label: "Light",
    icon: "ki-outline ki-night-day fs-2",
  },
  { id: "dark" as ThemeMode, label: "Dark", icon: "ki-outline ki-moon fs-2" },
  {
    id: "system" as ThemeMode,
    label: "System",
    icon: "ki-outline ki-screen fs-2",
  },
];

const readStoredMode = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "light";
};

const resolveSystemTheme = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const applyTheme = (mode: ThemeMode) => {
  if (typeof document === "undefined") {
    return;
  }

  const theme = mode === "system" ? resolveSystemTheme() : mode;
  document.documentElement.setAttribute("data-bs-theme", theme);
  document.documentElement.setAttribute("data-bs-theme-mode", mode);

  try {
    window.localStorage.setItem("data-bs-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
};

const useThemeMode = () => {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyTheme("system");
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  return {
    mode,
    setMode,
    modes: MODE_META,
  };
};

export default useThemeMode;
