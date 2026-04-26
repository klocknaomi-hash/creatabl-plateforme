"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface RulesListProps {
  rules: any[];
  onEdit: (rule: any) => void;
  onRefresh: () => void;
}

export function RulesList({ rules, onEdit, onRefresh }: RulesListProps) {
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/auto-reply/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(currentStatus ? "Rule disabled" : "Rule enabled");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const res = await fetch(`/api/auto-reply/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete rule");
      
      toast.success("Rule deleted");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border rounded-xl bg-muted/30">
        <MessageSquare className="size-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No rules yet</h3>
        <p className="text-muted-foreground text-center max-w-xs">
          Create your first auto-reply rule to start automating your engagement.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium capitalize">{rule.socialAccount?.platform}</span>
                  <span className="text-xs text-muted-foreground">@{rule.socialAccount?.username}</span>
                </div>
              </TableCell>
              <TableCell className="capitalize">
                {rule.triggerType === "all" ? "Any Comment" : "Keyword Match"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {rule.triggerType === "keyword" && rule.keywords?.length > 0 ? (
                    rule.keywords.map((k: string) => (
                      <Badge key={k} variant="outline" className="text-[10px] px-1.5 py-0">
                        {k}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {rule.useAi ? (
                  <Badge variant="secondary" className="gap-1 bg-purple-50 text-purple-700 border-purple-200">
                    <Sparkles className="size-3" />
                    AI
                  </Badge>
                ) : (
                  <Badge variant="secondary">Static</Badge>
                )}
              </TableCell>
              <TableCell>
                <Switch 
                  checked={rule.isActive} 
                  onCheckedChange={() => toggleActive(rule.id, rule.isActive)} 
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(rule)}>
                    <Edit2 className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
