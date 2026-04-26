"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";
import { toast } from "sonner";

const ruleSchema = z.object({
  socialAccountId: z.string().min(1, "Please select an account"),
  triggerType: z.enum(["keyword", "all"]),
  keywords: z.array(z.string()),
  replyTemplate: z.string().optional(),
  useAi: z.boolean(),
  aiContext: z.string().optional(),
  tone: z.string(),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

interface RuleFormProps {
  initialData?: any;
  accounts: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function RuleForm({ initialData, accounts, onSuccess, onCancel }: RuleFormProps) {
  const [keywordInput, setKeywordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema as any),
    defaultValues: initialData ? {
      socialAccountId: initialData.socialAccountId,
      triggerType: initialData.triggerType,
      keywords: initialData.keywords || [],
      replyTemplate: initialData.replyTemplate || "",
      useAi: initialData.useAi || false,
      aiContext: initialData.aiContext || "",
      tone: initialData.tone || "Friendly",
    } : {
      socialAccountId: "",
      triggerType: "keyword",
      keywords: [],
      replyTemplate: "",
      useAi: false,
      aiContext: "",
      tone: "Friendly",
    },
  });

  const triggerType = form.watch("triggerType");
  const useAi = form.watch("useAi");
  const keywords = form.watch("keywords") || [];

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = keywordInput.trim().replace(",", "");
      if (val && !keywords.includes(val)) {
        form.setValue("keywords", [...keywords, val]);
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    form.setValue("keywords", keywords.filter((k) => k !== keyword));
  };

  const onSubmit = async (values: RuleFormValues) => {
    if (values.triggerType === "keyword" && (!values.keywords || values.keywords.length === 0)) {
      form.setError("keywords", { message: "At least one keyword is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = initialData 
        ? `/api/auto-reply/${initialData.id}` 
        : "/api/auto-reply";
      
      const res = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save rule");
      }

      toast.success(initialData ? "Rule updated" : "Rule created");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control as any}
          name="socialAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a connected account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{acc.platform}</span>
                        <span className="text-muted-foreground">@{acc.username}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="triggerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trigger Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="keyword">Keyword Match</SelectItem>
                  <SelectItem value="all">Any Comment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {triggerType === "keyword" && (
          <FormItem>
            <FormLabel>Keywords</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map((k: string) => (
                <Badge key={k} variant="secondary" className="gap-1 px-2 py-1">
                  {k}
                  <X className="size-3 cursor-pointer" onClick={() => removeKeyword(k)} />
                </Badge>
              ))}
            </div>
            <FormControl>
              <Input
                placeholder="Type keyword and press Enter..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
              />
            </FormControl>
            <FormDescription>Replies will trigger when any of these keywords are found.</FormDescription>
            <FormMessage />
          </FormItem>
        )}

        <FormField
          control={form.control as any}
          name="useAi"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2">
                  <Sparkles className="size-4 text-purple-500" />
                  Use Gemini AI
                </FormLabel>
                <FormDescription>
                  Generate dynamic, context-aware replies using AI.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {useAi ? (
          <div className="space-y-4 border-l-2 border-purple-200 pl-4">
            <FormField
              control={form.control as any}
              name="aiContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Context / Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g. You are a helpful customer support agent for a tech brand. Be witty but professional."
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormDescription>Help the AI understand your brand voice.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reply Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Friendly">Friendly</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Witty">Witty/Humorous</SelectItem>
                      <SelectItem value="Empathetic">Empathetic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <FormField
            control={form.control as any}
            name="replyTemplate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Static Reply Template</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Thanks for your comment! We'll get back to you soon."
                    {...field}
                    value={field.value as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <DialogFooter className="pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Rule" : "Create Rule"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
