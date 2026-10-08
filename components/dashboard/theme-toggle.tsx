"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-10" />;
  }

  return (
    <button
      id="topbar-theme-toggle"
      className="cr-iconbtn"
      aria-label={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {/* Lune en thème clair (passer au sombre), soleil en thème sombre */}
      <Moon size={20} className="block dark:hidden" aria-hidden="true" />
      <Sun size={20} className="hidden dark:block" aria-hidden="true" />
    </button>
  );
}
