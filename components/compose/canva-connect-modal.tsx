"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CanvaIcon } from "@/components/platform-icons";

interface CanvaConnectModalProps {
  children: React.ReactNode;
  onConnect: () => void;
}

export function CanvaConnectModal({ children, onConnect }: CanvaConnectModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {React.isValidElement(children) ? (
        <DialogTrigger render={children as React.ReactElement} />
      ) : (
        <DialogTrigger>{children}</DialogTrigger>
      )}
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl border-none">
        <div className="flex flex-col md:flex-row h-full">
          {/* Illustration Side */}
          <div className="bg-muted p-8 flex items-center justify-center flex-1 min-h-[300px]">
            <div className="relative w-full aspect-[4/3] max-w-[280px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00C4CC] to-[#7F77DD] rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative bg-background/50 backdrop-blur-md rounded-2xl border shadow-xl p-4 flex flex-col gap-3 rotate-[-2deg] transform transition-transform hover:rotate-0">
                {/* Mock UI */}
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="flex gap-1">
                    <div className="size-2.5 rounded-full bg-red-400"></div>
                    <div className="size-2.5 rounded-full bg-yellow-400"></div>
                    <div className="size-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-3 w-32 bg-muted rounded"></div>
                </div>
                <div className="flex-1 rounded-lg bg-gradient-to-br from-[#00C4CC]/20 to-[#7F77DD]/20 border border-border/50"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 bg-muted rounded-md"></div>
                  <div className="h-12 bg-muted rounded-md"></div>
                  <div className="h-12 bg-muted rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Side */}
          <div className="p-10 flex flex-col justify-center flex-1 gap-6 bg-background">
            <div className="space-y-4">
              <div className="size-14 rounded-2xl bg-[#00C4CC]/10 border border-[#00C4CC]/20 flex items-center justify-center shadow-sm">
                <CanvaIcon size={28} className="text-[#00C4CC]" />
              </div>
              
              <div>
                <DialogTitle className="text-2xl font-bold mb-3">
                  Connecter Canva
                </DialogTitle>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Il semble que vous n'ayez pas encore connecté votre compte Canva.
                </p>
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={() => {
                  setOpen(false);
                  onConnect();
                }} 
                className="w-full bg-[#00C4CC] hover:bg-[#00C4CC]/90 text-white shadow-md font-bold py-6 rounded-xl text-base transition-all hover:shadow-lg"
              >
                + Connecter à Canva
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
