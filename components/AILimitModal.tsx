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
        return "Tu as utilisé tes 30 générations ce mois-ci. Passe au plan Pro pour 120 générations/mois.";
      case "pro":
        return "Tu as utilisé tes 120 générations ce mois-ci. Passe au plan Business pour 500 générations/mois.";
      case "business":
        return "Tu as utilisé tes 500 générations ce mois-ci. Contacte-nous pour un plan sur mesure.";
      default:
        return `Tu as atteint ta limite de ${limit} générations ce mois-ci.`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center py-8">
        <DialogHeader className="flex flex-col items-center">
          <AIUsageIndicator used={used} limit={limit} size={80} />
          <DialogTitle className="text-2xl font-bold mt-4 text-[#D85A30]">
            Limite IA atteinte
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-gray-600 text-base leading-relaxed">
          {getUpgradeMessage()}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full mt-4">
          <Button 
            render={<Link href="/pricing" />}
            className="w-full bg-[#7F77DD] hover:bg-[#6a62c5] text-white rounded-xl py-6 h-auto text-base"
          >
            Voir les plans
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full rounded-xl py-6 h-auto text-base border-gray-200"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AILimitModal;
