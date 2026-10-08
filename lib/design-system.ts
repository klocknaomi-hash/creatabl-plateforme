export const DS = {
  colors: {
    primary: "#7225E3",
    primaryLight: "#F3EEFD",
    primaryDark: "#5B1BB8",
    primaryBorder: "#AFA9EC",
    textPrimary: "#14121F",
    textSecondary: "#6B6780",
    textTertiary: "#6B6780",
    border: "#E8E6F0",
    borderLight: "#F3F4F6",
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
  },
  typography: {
    // Page titles
    h1: "text-2xl font-bold text-gray-900",
    // Section titles  
    h2: "text-xl font-semibold text-gray-900",
    // Card titles
    h3: "text-base font-semibold text-gray-900",
    // Labels
    label: "text-sm font-medium text-gray-700",
    // Body text
    body: "text-sm text-gray-600",
    // Small / captions
    caption: "text-xs text-gray-400",
    // Italic subtitle (plans)
    subtitle: "text-sm italic text-[#7225E3]",
    // Section label uppercase
    sectionLabel: "text-xs font-semibold text-gray-400 uppercase tracking-wider",
  },
  buttons: {
    primary: "bg-[#7225E3] text-white font-bold rounded-xl hover:bg-[#5B1BB8] transition-colors",
    secondary: "border border-[#7225E3] text-[#7225E3] font-bold rounded-xl hover:bg-[#F3EEFD] transition-colors",
    dark: "bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors",
    ghost: "text-gray-500 hover:text-gray-700 transition-colors",
  },
  cards: {
    base: "bg-white border border-gray-100 rounded-2xl",
    elevated: "bg-white border border-gray-100 rounded-2xl shadow-sm",
    highlighted: "bg-white border-2 border-[#7225E3] rounded-2xl",
  },
  spacing: {
    pagePadding: "p-8",
    cardPadding: "p-6",
    sectionGap: "space-y-8",
    cardGap: "gap-4",
  },
  badges: {
    popular: "bg-[#7225E3] text-white text-xs font-bold px-3 py-1 rounded-full",
    choice: "bg-[#7225E3] text-white text-xs font-bold px-3 py-1 rounded-full",
    trial: "bg-[#7225E3]/10 text-[#7225E3] text-xs font-bold px-3 py-1 rounded-full",
  }
} as const

/*
 * CREATABL DESIGN SYSTEM — DO NOT MODIFY
 * Last validated: 14 mai 2026
 * 
 * RULES:
 * - Always import DS from "@/lib/design-system"
 * - Never hardcode colors — use DS.colors.*
 * - Never change font sizes without explicit request
 * - Primary purple is always #7225E3
 * - All cards use rounded-2xl
 * - All buttons use rounded-xl
 * - Page padding is always p-8
 */
