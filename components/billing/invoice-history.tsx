import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { History, Receipt } from "lucide-react";

export function InvoiceHistory() {
  return (
    <Card className="rounded-[32px] border-border/50 shadow-sm overflow-hidden group hover:border-primary/10 transition-colors">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <History className="size-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-black uppercase tracking-widest">Historique</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="py-16">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-muted/50 p-6 rounded-full">
            <Receipt className="size-10 text-muted-foreground/30" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Aucune facture trouvée.</h3>
            <p className="text-muted-foreground text-sm max-w-[280px]">
              Consultez votre portail client pour voir l'historique complet.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
