"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AIUsageIndicator from "./AIUsageIndicator";
import Link from "next/link";

interface AILimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  used: number;
  limit: number;
  plan: string;
}

const AILimitModal: React.FC<AILimitModalProps> = ({
  isOpen,
  onClose,
  used,
  limit,
  plan,
}) => {
  const getUpgradeMessage = () => {
    switch (plan) {
      case "starter":
        return "You have used your 30 generations this month. Upgrade to Pro for 120 generations/month.";
      case "pro":
        return "You have used your 120 generations this month. Upgrade to Business for 500 generations/month.";
      case "business":
        return "You have used your 500 generations this month. Contact us for a custom plan.";
      default:
        return `You have reached your limit of ${limit} generations this month.`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center py-8">
        <DialogHeader className="flex flex-col items-center">
          <AIUsageIndicator used={used} limit={limit} size={80} />
          <DialogTitle className="text-2xl font-bold mt-4 text-[#D85A30]">
            AI Limit Reached
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-gray-600 text-base leading-relaxed">
          {getUpgradeMessage()}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full mt-4">
          <Button 
            render={<Link href="https://creatabl-ia.com/tarifs" />}
            className="w-full bg-[#7F77DD] hover:bg-[#6a62c5] text-white rounded-xl py-6 h-auto text-base"
          >
            View Plans
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full rounded-xl py-6 h-auto text-base border-gray-200"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AILimitModal;
