"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-8" />;
  }

  return (
    <button
      id="topbar-theme-toggle"
      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {/* Sun shown in dark mode, Moon shown in light mode */}
      <Sun className="block dark:hidden" />
      <Moon className="hidden dark:block" />
    </button>
  );
}
