"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              {/* Line between steps */}
              {index !== 0 && (
                <div 
                  className={cn(
                    "absolute top-5 -left-1/2 w-full h-[2px] -translate-y-1/2 z-0",
                    isCompleted || isActive ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              
              <div 
                className={cn(
                  "size-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all duration-300 border-2",
                  isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                  isActive ? "bg-background border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : 
                  "bg-background border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-5" /> : stepNumber}
              </div>
              <span className={cn(
                "mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
