"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


interface SchedulePickerProps {
  scheduledAt: Date | null;
  onChange: (date: Date | null) => void;
}

export function SchedulePicker({ scheduledAt, onChange }: SchedulePickerProps) {
  const [isScheduled, setIsScheduled] = useState(!!scheduledAt);

  const handleToggle = (val: boolean) => {
    setIsScheduled(val);
    if (!val) {
      onChange(null);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      onChange(tomorrow);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
            isScheduled ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
          )}>
            <CalendarIcon className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="schedule-toggle" className="font-bold text-[13px] cursor-pointer">Schedule for later</Label>
            <span className="text-[11px] text-muted-foreground">Pick a specific date and time</span>
          </div>
        </div>
        <Switch
          id="schedule-toggle"
          checked={isScheduled}
          onCheckedChange={handleToggle}
          className="scale-90 data-[state=checked]:bg-foreground"
        />
      </div>

      {isScheduled && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl border border-foreground/10 bg-muted/5 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Date</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-semibold rounded-lg h-9 text-xs border-border/60 bg-background shadow-none hover:bg-background hover:border-foreground transition-all",
                        !scheduledAt && "text-muted-foreground"
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 text-foreground/70" />
                  {scheduledAt ? format(scheduledAt, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledAt || undefined}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date);
                        if (scheduledAt) {
                          newDate.setHours(scheduledAt.getHours());
                          newDate.setMinutes(scheduledAt.getMinutes());
                        }
                        onChange(newDate);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/70" />
                <input
                  type="time"
                  className="w-full h-9 pl-9 pr-3 text-[13px] font-semibold bg-background border border-border/60 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground transition-all shadow-none"
                  value={scheduledAt ? format(scheduledAt, "HH:mm") : ""}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":").map(Number);
                    const newDate = scheduledAt ? new Date(scheduledAt) : new Date();
                    newDate.setHours(hours);
                    newDate.setMinutes(minutes);
                    onChange(newDate);
                  }}
                />
              </div>
            </div>
          </div>


        </div>
      )}
      
      {!isScheduled && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10">
          <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[10px] font-medium text-green-700/70">
            Post will be published immediately.
          </p>
        </div>
      )}
    </div>
  );
}
