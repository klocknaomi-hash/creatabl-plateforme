"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, subWeeks, addWeeks, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AnalyticsNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  // Default to current week if no dates provided
  const currentDate = fromStr ? parseISO(fromStr) : new Date();
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const handleNavigate = (direction: "prev" | "next") => {
    const newDate = direction === "prev" ? subWeeks(weekStart, 1) : addWeeks(weekStart, 1);
    const newFrom = startOfWeek(newDate);
    const newTo = endOfWeek(newDate);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", format(newFrom, "yyyy-MM-dd"));
    params.set("to", format(newTo, "yyyy-MM-dd"));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-card border border-border/50 rounded-[22px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleNavigate("prev")} 
        className="h-8 w-8 rounded-full hover:bg-muted transition-colors"
      >
        <ChevronLeft className="size-4" />
      </Button>
      
      <div className="flex items-center gap-2 px-3 h-8 border-x border-border/40">
        <CalendarIcon className="size-3.5 text-primary/60" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </span>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleNavigate("next")} 
        className="h-8 w-8 rounded-full hover:bg-muted transition-colors"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
