"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const modeRef = useRef<ThemeMode>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    modeRef.current = stored;

    const resolvedTheme = stored === "system" ? getSystemTheme() : stored;
    applyTheme(resolvedTheme);
    setTheme(resolvedTheme);
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (modeRef.current !== "system") {
        return;
      }
      const nextTheme = event.matches ? "dark" : "light";
      applyTheme(nextTheme);
      setTheme(nextTheme);
    };

    media.addEventListener("change", handleChange);
    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    modeRef.current = nextTheme;
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="h-9 w-9"
      disabled={!mounted}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
