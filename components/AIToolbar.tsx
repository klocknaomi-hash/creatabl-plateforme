// components/AIToolbar.tsx
"use client";

import { useState } from "react";
import { useGeneratePost } from "@/hooks/useGeneratePost";
import { PostPlatform, PostTone } from "@/lib/ai-provider";

interface AIToolbarProps {
  content: string;
  platform?: PostPlatform;
  onResult: (result: string) => void;
}

const TONES: { value: PostTone; label: string }[] = [
  { value: "professionnel", label: "Professionnel" },
  { value: "storytelling", label: "Storytelling" },
  { value: "viral", label: "Viral" },
  { value: "educatif", label: "Éducatif" },
  { value: "conversationnel", label: "Conversationnel" },
];

export function AIToolbar({ content, platform, onResult }: AIToolbarProps) {
  const [showTones, setShowTones] = useState(false);
  const { generate, loading } = useGeneratePost({ onSuccess: onResult });

  const disabled = loading || !content?.trim();

  async function handleAction(action: string, tone?: PostTone) {
    setShowTones(false);
    await generate({
      content,
      action: action as any,
      platform,
      tone,
    });
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 0",
      flexWrap: "wrap",
    }}>
      {/* Badge IA */}
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 8px",
        borderRadius: 20,
        background: "#EEEDFE",
        color: "#534AB7",
        marginRight: 4,
      }}>
        IA
      </span>

      {/* Améliorer */}
      <button
        onClick={() => handleAction("ameliorer")}
        disabled={disabled}
        style={btnStyle(disabled)}
      >
        {loading ? "…" : "Améliorer"}
      </button>

      {/* Reformuler */}
      <button
        onClick={() => handleAction("reformuler")}
        disabled={disabled}
        style={btnStyle(disabled)}
      >
        Reformuler
      </button>

      {/* Changer le ton */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowTones(!showTones)}
          disabled={disabled}
          style={btnStyle(disabled)}
        >
          Changer le ton ▾
        </button>
        {showTones && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: 8,
            padding: 4,
            zIndex: 50,
            minWidth: 170,
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          }}>
            {TONES.map((t) => (
              <div
                key={t.value}
                onClick={() => handleAction("changer_ton", t.value)}
                style={{
                  padding: "7px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                  borderRadius: 6,
                  color: "var(--color-text-primary)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {t.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optimiser pour la plateforme */}
      {platform && (
        <button
          onClick={() => handleAction("optimiser_plateforme")}
          disabled={disabled}
          style={{ ...btnStyle(disabled), color: "#534AB7", borderColor: "#AFA9EC" }}
        >
          Optimiser pour {platform}
        </button>
      )}
    </div>
  );
}

function btnStyle(disabled: boolean) {
  return {
    fontSize: 12,
    padding: "6px 12px",
    borderRadius: 8,
    border: "0.5px solid var(--color-border-secondary)",
    background: "transparent",
    color: "var(--color-text-primary)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    fontWeight: 500,
    transition: "background .15s",
  } as React.CSSProperties;
}
