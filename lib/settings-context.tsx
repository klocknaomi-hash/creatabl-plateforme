"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextType {
  language: string;
  setLanguage: (lang: string) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => {
        if (data.settings?.language) {
          setLanguage(data.settings.language);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ language, setLanguage, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
